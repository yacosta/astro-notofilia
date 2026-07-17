import Foundation

/// The lifecycle state of a single image in the batch queue.
public enum JobStatus: String, Sendable, Codable {
    case queued
    case processing
    case completed
    case failed
    case skippedDuplicate
    case cancelled
}

/// One unit of work in the batch: a source image and everything we learn about
/// it as it moves through the pipeline. This is a reference type because the UI
/// observes live progress on the same instance the processor mutates.
public final class ImageJob: Identifiable, @unchecked Sendable {
    public let id: UUID
    public let sourceURL: URL

    // Populated as the job runs.
    public private(set) var status: JobStatus = .queued
    public var progress: Double = 0          // 0…1 within this job
    public var startedAt: Date?
    public var finishedAt: Date?
    public var errorMessage: String?

    /// Result metadata filled in on success (dimensions, timings, etc.).
    public var result: ProcessingResult?

    /// Perceptual hash, computed during the duplicate-detection pre-pass.
    public var perceptualHash: UInt64?
    /// The job this one was found to duplicate, if any.
    public var duplicateOf: UUID?

    public init(sourceURL: URL, id: UUID = UUID()) {
        self.id = id
        self.sourceURL = sourceURL
    }

    public var filename: String { sourceURL.lastPathComponent }

    public var elapsed: TimeInterval? {
        guard let start = startedAt else { return nil }
        return (finishedAt ?? Date()).timeIntervalSince(start)
    }

    // MARK: State transitions

    public func markProcessing() {
        status = .processing
        startedAt = Date()
        progress = 0
    }

    public func markCompleted(_ result: ProcessingResult) {
        self.result = result
        status = .completed
        progress = 1
        finishedAt = Date()
    }

    public func markFailed(_ message: String) {
        status = .failed
        errorMessage = message
        finishedAt = Date()
    }

    public func markSkippedDuplicate(of other: UUID) {
        status = .skippedDuplicate
        duplicateOf = other
        finishedAt = Date()
    }

    public func markCancelled() {
        status = .cancelled
        finishedAt = Date()
    }

    /// Reset a failed/cancelled job so it can be retried.
    public func resetForRetry() {
        status = .queued
        progress = 0
        startedAt = nil
        finishedAt = nil
        errorMessage = nil
        result = nil
    }
}
