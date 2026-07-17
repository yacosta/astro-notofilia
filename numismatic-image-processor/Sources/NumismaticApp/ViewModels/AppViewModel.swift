import Foundation
import SwiftUI
import Combine
import NumismaticCore

/// The single source of truth for the UI (MVVM). Owns the user's folder
/// selections and options, drives the `BatchProcessor`, and republishes engine
/// callbacks on the main actor so SwiftUI views update live.
@MainActor
public final class AppViewModel: ObservableObject {
    // Folders
    @Published public var inputFolder: URL?
    @Published public var outputFolder: URL?
    @Published public var createOutputIfMissing = true

    // Options
    @Published public var options = ProcessingOptions.default
    @Published public var watermark = WatermarkOptions.default

    // Discovered input summary
    @Published public private(set) var inputSummary = InputSummary.empty

    // Queue + progress
    @Published public private(set) var jobs: [ImageJob] = []
    @Published public private(set) var completed = 0
    @Published public private(set) var total = 0
    @Published public private(set) var isRunning = false
    @Published public private(set) var isPaused = false
    @Published public private(set) var cpuUsage: Double = 0
    @Published public private(set) var statusLine = ""

    /// Bumped whenever a job mutates so SwiftUI re-renders the class-based rows.
    @Published public private(set) var refreshTick = 0

    public let resources = ResourceMonitor()
    private let preferences = Preferences()
    private var processor: BatchProcessor?
    private var cpuTimer: Timer?

    public struct InputSummary {
        public var count: Int
        public var totalBytes: Int64
        public var formats: Set<ImageFormat>
        public static let empty = InputSummary(count: 0, totalBytes: 0, formats: [])
        public var formatList: String {
            formats.map { $0.rawValue.uppercased() }.sorted().joined(separator: ", ")
        }
        public var humanSize: String {
            ByteCountFormatter.string(fromByteCount: totalBytes, countStyle: .file)
        }
    }

    public init() {
        // Restore persisted settings.
        options = preferences.processingOptions
        watermark = preferences.watermarkOptions
        inputFolder = preferences.lastInputFolder()
        outputFolder = preferences.lastOutputFolder()
        statusLine = resources.snapshot() + " · " + ModelRegistry().summary()
        if inputFolder != nil { scanInputFolder() }
    }

    // MARK: Folder selection

    public func chooseInputFolder() {
        guard let url = FolderPicker.chooseFolder(title: "Choose Input Folder") else { return }
        inputFolder = url
        preferences.saveInputFolder(url)
        scanInputFolder()
    }

    public func chooseOutputFolder() {
        guard let url = FolderPicker.chooseFolder(title: "Choose Output Folder") else { return }
        outputFolder = url
        preferences.saveOutputFolder(url)
    }

    /// Accept a folder dropped onto the window.
    public func acceptDropped(url: URL) {
        var isDir: ObjCBool = false
        guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDir) else { return }
        if isDir.boolValue {
            inputFolder = url; preferences.saveInputFolder(url); scanInputFolder()
        }
    }

    // MARK: Scanning

    public func scanInputFolder() {
        guard let folder = inputFolder else { return }
        let urls = BatchProcessor.discoverImages(in: folder)
        let loader = ImageLoader()
        var bytes: Int64 = 0
        var formats = Set<ImageFormat>()
        for url in urls {
            if let info = loader.inspect(url) { formats.insert(info.format) }
            bytes += (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64 ?? 0) ?? 0
        }
        inputSummary = InputSummary(count: urls.count, totalBytes: bytes, formats: formats)
        jobs = urls.map { ImageJob(sourceURL: $0) }
        total = jobs.count
        completed = 0
    }

    // MARK: Run controls

    public func run() {
        guard let input = inputFolder, !jobs.isEmpty else { return }
        guard let output = resolvedOutputFolder() else { return }
        persistOptions()

        let logsDir = output.appendingPathComponent("logs", isDirectory: true)
        let logger = ProcessingLogger(logsDirectory: logsDir)
        let context = PipelineContext(options: options,
                                      watermarkOptions: watermark,
                                      outputDirectory: output,
                                      models: ModelRegistry(),
                                      logger: logger)
        preferences.addRecentProject(input.path)

        let processor = BatchProcessor(context: context, resources: resources)
        var cb = BatchProcessor.Callbacks()
        cb.jobDidStart = { [weak self] _ in Task { @MainActor in self?.refreshTick += 1 } }
        cb.jobDidProgress = { [weak self] _ in Task { @MainActor in self?.refreshTick += 1 } }
        cb.jobDidFinish = { [weak self] _ in Task { @MainActor in self?.refreshTick += 1 } }
        cb.batchDidProgress = { [weak self] done, total in
            Task { @MainActor in self?.completed = done; self?.total = total }
        }
        cb.batchDidFinish = { [weak self] _ in
            Task { @MainActor in self?.finishRun() }
        }
        processor.callbacks = cb
        self.processor = processor

        isRunning = true
        isPaused = false
        startCPUMonitor()
        let jobsCopy = jobs
        DispatchQueue.global(qos: .userInitiated).async {
            processor.run(jobs: jobsCopy)
        }
    }

    public func pause() { processor?.pause(); isPaused = true }
    public func resume() { processor?.resume(); isPaused = false }
    public func cancel() { processor?.cancel(); finishRun() }
    public func retry(_ job: ImageJob) { processor?.retry(job) }

    private func finishRun() {
        isRunning = false
        isPaused = false
        stopCPUMonitor()
        refreshTick += 1
    }

    // MARK: Helpers

    public var overallProgress: Double {
        total > 0 ? Double(completed) / Double(total) : 0
    }

    private func resolvedOutputFolder() -> URL? {
        guard let output = outputFolder else { return nil }
        if createOutputIfMissing {
            try? FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
        }
        return output
    }

    private func persistOptions() {
        preferences.processingOptions = options
        preferences.watermarkOptions = watermark
    }

    private func startCPUMonitor() {
        cpuTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.cpuUsage = self.resources.currentCPUUsage() }
        }
    }
    private func stopCPUMonitor() { cpuTimer?.invalidate(); cpuTimer = nil }
}
