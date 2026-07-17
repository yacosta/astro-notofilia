import Foundation
import CoreGraphics

/// Everything a single image needs to travel through the pipeline: the user's
/// options, the resolved AI engines, output location and a logger. Built once
/// per batch and shared (read-only) across concurrent workers.
public final class PipelineContext: @unchecked Sendable {
    public let options: ProcessingOptions
    public let watermarkOptions: WatermarkOptions
    public let outputDirectory: URL
    public let duplicatesDirectory: URL
    public let models: ModelRegistry
    public let logger: ProcessingLogger
    public let plugins: PluginRegistry

    // Pre-built, stateless stage helpers (safe to share across threads).
    public let loader = ImageLoader()
    public let detector: WatermarkDetector
    public let corrector: ColorCorrector
    public let exporter: ImageExporter

    public init(options: ProcessingOptions,
                watermarkOptions: WatermarkOptions,
                outputDirectory: URL,
                models: ModelRegistry,
                logger: ProcessingLogger,
                plugins: PluginRegistry = PluginRegistry()) {
        self.options = options
        self.watermarkOptions = watermarkOptions
        self.outputDirectory = outputDirectory
        self.duplicatesDirectory = outputDirectory.appendingPathComponent("duplicates", isDirectory: true)
        self.models = models
        self.logger = logger
        self.plugins = plugins
        self.detector = WatermarkDetector(useOCR: options.aiWatermarkDetection || options.removeExistingWatermark,
                                          useEdgeContrast: options.aiWatermarkDetection)
        self.corrector = ColorCorrector()
        self.exporter = ImageExporter(options: options)
    }

    /// Destination URL preserving the original filename but swapping the
    /// extension to match the chosen export format. Never collides with input.
    public func outputURL(for sourceURL: URL, format: ImageFormat) -> URL {
        let base = sourceURL.deletingPathExtension().lastPathComponent
        let ext = format.fileExtensions.first ?? format.rawValue
        return outputDirectory.appendingPathComponent(base).appendingPathExtension(ext)
    }
}
