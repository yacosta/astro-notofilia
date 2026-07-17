import Foundation

/// Discovers images in a folder and processes them concurrently, honouring the
/// memory-aware worker count from `ResourceMonitor`, per-image error isolation,
/// pause/resume/cancel, and duplicate detection. This is the top-level engine
/// entry point the UI drives.
///
/// Callbacks are invoked on an arbitrary queue; the UI layer hops to the main
/// actor. All state the callbacks read lives on the `ImageJob` reference types.
public final class BatchProcessor: @unchecked Sendable {
    public struct Callbacks {
        public var jobDidStart: ((ImageJob) -> Void)?
        public var jobDidProgress: ((ImageJob) -> Void)?
        public var jobDidFinish: ((ImageJob) -> Void)?
        public var batchDidProgress: ((_ completed: Int, _ total: Int) -> Void)?
        public var batchDidFinish: (([ProcessingResult]) -> Void)?
        public init() {}
    }

    private let context: PipelineContext
    private let resources: ResourceMonitor
    private let cancellation = CancellationToken()
    private let queue: OperationQueue
    private let resultsLock = NSLock()
    private var results: [ProcessingResult] = []
    private let progressLock = NSLock()
    private var completedCount = 0

    public var callbacks = Callbacks()

    public init(context: PipelineContext, resources: ResourceMonitor = ResourceMonitor()) {
        self.context = context
        self.resources = resources
        self.queue = OperationQueue()
        self.queue.maxConcurrentOperationCount =
            resources.recommendedConcurrency(minimumLongEdge: context.options.minimumLongEdge)
        self.queue.qualityOfService = .userInitiated
    }

    // MARK: Folder scanning

    /// Enumerate supported image files directly inside `folder` (non-recursive
    /// by default; set `recursive` to descend into subfolders).
    public static func discoverImages(in folder: URL, recursive: Bool = false) -> [URL] {
        let fm = FileManager.default
        let keys: [URLResourceKey] = [.isRegularFileKey]
        let options: FileManager.DirectoryEnumerationOptions =
            recursive ? [.skipsHiddenFiles] : [.skipsHiddenFiles, .skipsSubdirectoryDescendants]
        guard let enumerator = fm.enumerator(at: folder,
                                             includingPropertiesForKeys: keys,
                                             options: options) else { return [] }
        var urls: [URL] = []
        for case let url as URL in enumerator where ImageFormat.from(url: url) != nil {
            urls.append(url)
        }
        return urls.sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending }
    }

    // MARK: Duplicate pre-pass

    /// Compute perceptual hashes and mark duplicates before processing. Mutates
    /// each job's `perceptualHash`/`duplicateOf`. Returns a report array.
    public func detectDuplicates(in jobs: [ImageJob]) -> [DuplicateReportEntry] {
        let detector = DuplicateDetector()
        let hasher = PerceptualHasher()
        let loader = ImageLoader()
        var report: [DuplicateReportEntry] = []

        for job in jobs {
            guard let loaded = try? loader.load(job.sourceURL),
                  let hashes = hasher.hashes(for: loaded.image) else {
                report.append(DuplicateReportEntry(filename: job.filename, status: "unhashable", distance: nil))
                continue
            }
            job.perceptualHash = hashes.average
            if let match = detector.register(id: job.id, filename: job.filename, hashes: hashes) {
                job.duplicateOf = match.originalID
                let kind = match.isExact ? "duplicate-of" : "near-duplicate-of"
                report.append(DuplicateReportEntry(filename: job.filename,
                                                   status: "\(kind):\(match.originalFilename)",
                                                   distance: match.distance))
            } else {
                report.append(DuplicateReportEntry(filename: job.filename, status: "unique", distance: nil))
            }
        }
        return report
    }

    // MARK: Run

    /// Process all jobs. Returns immediately if you call it off the main thread's
    /// blocking is undesirable — callers typically run this on a background queue.
    public func run(jobs: [ImageJob]) {
        results.removeAll()
        progressLock.lock(); completedCount = 0; progressLock.unlock()
        let total = jobs.count

        // Optional duplicate pre-pass.
        if context.options.detectDuplicates {
            let report = detectDuplicates(in: jobs)
            try? writeDuplicateReport(report)
        }

        for job in jobs {
            queue.addOperation { [weak self] in
                guard let self else { return }
                if self.cancellation.isCancelled { job.markCancelled(); return }

                // Handle duplicates according to policy.
                if let dupID = job.duplicateOf, self.context.options.detectDuplicates {
                    switch self.context.options.duplicateHandling {
                    case .skip:
                        job.markSkippedDuplicate(of: dupID)
                        self.context.logger.info("\(job.filename): skipped (duplicate)")
                        self.finish(job: job, total: total)
                        return
                    case .move:
                        self.moveDuplicate(job)
                        job.markSkippedDuplicate(of: dupID)
                        self.finish(job: job, total: total)
                        return
                    case .none:
                        break // process anyway
                    }
                }

                self.process(job)
                self.finish(job: job, total: total)
            }
        }

        queue.addBarrierBlock { [weak self] in
            guard let self else { return }
            self.writeFinalReports()
            self.callbacks.batchDidFinish?(self.snapshotResults())
        }
    }

    private func process(_ job: ImageJob) {
        job.markProcessing()
        callbacks.jobDidStart?(job)
        let pipeline = ImageProcessingPipeline(context: context)
        do {
            let result = try pipeline.process(job, cancellation: cancellation, progress: { p in
                job.progress = p
                self.callbacks.jobDidProgress?(job)
            })
            job.markCompleted(result)
            appendResult(result)
            context.logger.info("\(job.filename): done \(result.pixelsBefore.description) → \(result.pixelsAfter.description) in \(String(format: "%.1fs", result.processingSeconds))")
        } catch ProcessingError.cancelled {
            job.markCancelled()
        } catch {
            job.markFailed(error.localizedDescription)
            context.logger.error("\(job.filename): FAILED — \(error.localizedDescription)")
        }
    }

    private func finish(job: ImageJob, total: Int) {
        callbacks.jobDidFinish?(job)
        progressLock.lock(); completedCount += 1; let done = completedCount; progressLock.unlock()
        callbacks.batchDidProgress?(done, total)
    }

    /// Retry a single failed/cancelled job synchronously on the queue.
    public func retry(_ job: ImageJob) {
        job.resetForRetry()
        queue.addOperation { [weak self] in
            self?.process(job)
            self?.callbacks.jobDidFinish?(job)
        }
    }

    // MARK: Controls

    public func pause() { cancellation.pause(); queue.isSuspended = true }
    public func resume() { cancellation.resume(); queue.isSuspended = false }
    public func cancel() { cancellation.cancel(); queue.cancelAllOperations() }

    // MARK: Result bookkeeping

    private func appendResult(_ result: ProcessingResult) {
        resultsLock.lock(); results.append(result); resultsLock.unlock()
    }
    private func snapshotResults() -> [ProcessingResult] {
        resultsLock.lock(); defer { resultsLock.unlock() }; return results
    }

    private func writeFinalReports() {
        let logs = context.outputDirectory.appendingPathComponent("logs", isDirectory: true)
        try? ReportWriter().writeReports(snapshotResults(), to: logs)
    }

    private func writeDuplicateReport(_ report: [DuplicateReportEntry]) throws {
        let logs = context.outputDirectory.appendingPathComponent("logs", isDirectory: true)
        try FileManager.default.createDirectory(at: logs, withIntermediateDirectories: true)
        let encoder = JSONEncoder(); encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        let data = try encoder.encode(report)
        try data.write(to: logs.appendingPathComponent("duplicates.json"))
    }

    private func moveDuplicate(_ job: ImageJob) {
        let fm = FileManager.default
        try? fm.createDirectory(at: context.duplicatesDirectory, withIntermediateDirectories: true)
        let dest = context.duplicatesDirectory.appendingPathComponent(job.filename)
        // Copy (never move/delete the original source per "never overwrite").
        try? fm.copyItem(at: job.sourceURL, to: dest)
    }
}
