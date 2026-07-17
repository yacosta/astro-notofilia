import Foundation
import CoreImage

/// Ordered collection of enabled `ProcessorPlugin`s. The pipeline calls
/// `runAll` once per image. Registration order is execution order.
public final class PluginRegistry: @unchecked Sendable {
    private let lock = NSLock()
    private var plugins: [ProcessorPlugin] = []

    public init(_ plugins: [ProcessorPlugin] = []) {
        self.plugins = plugins
    }

    public func register(_ plugin: ProcessorPlugin) {
        lock.lock(); defer { lock.unlock() }
        plugins.append(plugin)
    }

    public var registered: [ProcessorPlugin] {
        lock.lock(); defer { lock.unlock() }
        return plugins
    }

    /// Run every enabled plugin in order, threading the image through each.
    /// A plugin that throws is logged and skipped so one bad plugin cannot fail
    /// the whole image.
    public func runAll(on image: CIImage, job: ImageJob, context: PipelineContext) throws -> CIImage {
        var current = image
        for plugin in registered where plugin.isEnabled {
            do {
                current = try plugin.process(current, job: job, context: context)
            } catch {
                context.logger.warn("plugin \(plugin.identifier) failed on \(job.filename): \(error.localizedDescription)")
            }
        }
        return current
    }
}
