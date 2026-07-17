import Foundation

/// A thread-safe cancel/pause signal shared between the UI and the batch
/// processor. Pausing blocks worker threads at the next checkpoint; cancelling
/// makes checkpoints throw `ProcessingError.cancelled`.
public final class CancellationToken: @unchecked Sendable {
    private let lock = NSCondition()
    private var _cancelled = false
    private var _paused = false

    public init() {}

    public var isCancelled: Bool { lock.withLock { _cancelled } }
    public var isPaused: Bool { lock.withLock { _paused } }

    public func cancel() {
        lock.lock(); _cancelled = true; lock.signal(); lock.unlock()
    }

    public func pause() { lock.withLock { _paused = true } }

    public func resume() {
        lock.lock(); _paused = false; lock.broadcast(); lock.unlock()
    }

    /// Throws if cancelled; otherwise blocks while paused.
    public func checkpoint() throws {
        lock.lock(); defer { lock.unlock() }
        while _paused && !_cancelled { lock.wait() }
        if _cancelled { throw ProcessingError.cancelled }
    }
}

private extension NSCondition {
    func withLock<T>(_ body: () -> T) -> T {
        lock(); defer { unlock() }; return body()
    }
}
