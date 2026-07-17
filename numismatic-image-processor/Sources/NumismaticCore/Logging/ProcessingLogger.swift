import Foundation
import os

/// Writes a human-readable `processing.log` to the logs directory and mirrors
/// messages to the unified system log. Thread-safe — many workers log at once.
public final class ProcessingLogger: @unchecked Sendable {
    public enum Level: String { case debug = "DEBUG", info = "INFO", warn = "WARN", error = "ERROR" }

    private let fileHandle: FileHandle?
    private let queue = DispatchQueue(label: "com.notofilia.processor.logger")
    private let osLog = Logger(subsystem: "com.notofilia.processor", category: "processing")
    private let dateFormatter: ISO8601DateFormatter
    public let logFileURL: URL?

    /// Minimum level actually written to disk.
    public var minimumLevel: Level = .info

    public init(logsDirectory: URL) {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        self.dateFormatter = formatter

        let fm = FileManager.default
        try? fm.createDirectory(at: logsDirectory, withIntermediateDirectories: true)
        let url = logsDirectory.appendingPathComponent("processing.log")
        if !fm.fileExists(atPath: url.path) {
            fm.createFile(atPath: url.path, contents: nil)
        }
        self.logFileURL = url
        self.fileHandle = try? FileHandle(forWritingTo: url)
        try? self.fileHandle?.seekToEnd()
    }

    deinit { try? fileHandle?.close() }

    public func log(_ level: Level, _ message: @autoclosure () -> String) {
        guard shouldLog(level) else { return }
        let line = "[\(dateFormatter.string(from: Date()))] \(level.rawValue) \(message())\n"
        queue.async { [weak self] in
            guard let self, let data = line.data(using: .utf8) else { return }
            self.fileHandle?.write(data)
        }
        switch level {
        case .debug: osLog.debug("\(line, privacy: .public)")
        case .info:  osLog.info("\(line, privacy: .public)")
        case .warn:  osLog.warning("\(line, privacy: .public)")
        case .error: osLog.error("\(line, privacy: .public)")
        }
    }

    public func debug(_ m: @autoclosure () -> String) { log(.debug, m()) }
    public func info(_ m: @autoclosure () -> String)  { log(.info, m()) }
    public func warn(_ m: @autoclosure () -> String)  { log(.warn, m()) }
    public func error(_ m: @autoclosure () -> String) { log(.error, m()) }

    private func shouldLog(_ level: Level) -> Bool {
        let order: [Level] = [.debug, .info, .warn, .error]
        return (order.firstIndex(of: level) ?? 0) >= (order.firstIndex(of: minimumLevel) ?? 0)
    }
}
