import Foundation
import CoreImage

/// Runs the full seven-step pipeline for one image. Stateless apart from the
/// injected `PipelineContext`, so many instances run concurrently on the batch
/// queue. All heavy work goes through the shared Metal-backed `CIContext`.
public struct ImageProcessingPipeline {
    private let context: PipelineContext

    public init(context: PipelineContext) {
        self.context = context
    }

    /// Process `job`, writing the result to the output folder and returning its
    /// metadata. `capturePreview` collects intermediate images for the UI.
    ///
    /// - Parameter progress: called with 0…1 as the job advances.
    public func process(_ job: ImageJob,
                        cancellation: CancellationToken,
                        capturePreview: Bool = false,
                        preview: ((PreviewStages) -> Void)? = nil,
                        progress: ((Double) -> Void)? = nil) throws -> ProcessingResult {
        let started = Date()
        var errors: [String] = []
        var accumulated = 0.0
        var stages = PreviewStages()

        func advance(_ kind: PipelineStageKind) {
            accumulated += kind.progressWeight
            progress?(min(1, accumulated))
        }

        // STEP 1 — Load
        try cancellation.checkpoint()
        let loaded = try context.loader.load(job.sourceURL)
        var image = loaded.image
        let pixelsBefore = loaded.pixelSize
        if capturePreview { stages.original = image; preview?(stages) }
        advance(.load)

        // STEP 2 — Detect existing watermark
        try cancellation.checkpoint()
        var detection = WatermarkDetection.none
        if context.options.removeExistingWatermark || context.options.removeLogos {
            detection = context.detector.detect(in: image, aiEnabled: context.options.aiWatermarkDetection)
            if detection.found {
                context.logger.debug("\(job.filename): detected \(detection.regions.joined(separator: ", "))")
            }
        }
        advance(.detectWatermark)

        // STEP 3 — Remove watermark (AI inpainting / content-aware fallback)
        try cancellation.checkpoint()
        var watermarkRemoved = false
        if detection.found && context.options.removeExistingWatermark {
            let remover = WatermarkRemover(inpainter: context.models.inpainting())
            do {
                image = try remover.remove(from: image, detection: detection)
                watermarkRemoved = true
            } catch {
                errors.append("watermark removal: \(error.localizedDescription)")
            }
        }
        if capturePreview { stages.watermarkRemoved = image; preview?(stages) }
        advance(.removeWatermark)

        // STEP 4 — Upscale to ≥ minimum long edge
        try cancellation.checkpoint()
        var didUpscale = false
        if context.options.upscaleToMinimum {
            let upscaler = Upscaler(model: context.models.superResolution(),
                                    minimumLongEdge: context.options.minimumLongEdge,
                                    preserveAspectRatio: context.options.preserveAspectRatio)
            let outcome = try upscaler.upscale(image)
            image = outcome.image
            didUpscale = outcome.didUpscale
        }
        if capturePreview { stages.upscaled = image; preview?(stages) }
        advance(.upscale)

        // STEP 5 — Light color correction
        try cancellation.checkpoint()
        if context.options.lightColorCorrection {
            image = context.corrector.apply(to: image)
        }
        advance(.colorCorrect)

        // Plugin hook: additional processors run here (background removal,
        // cropping, centering, …) before the watermark is stamped on.
        image = try context.plugins.runAll(on: image, job: job, context: context)

        // STEP 6 — Apply new NOTOFILIA watermark
        try cancellation.checkpoint()
        if context.options.applyNewWatermark {
            let applicator = WatermarkApplicator(options: context.watermarkOptions)
            image = try applicator.apply(to: image)
        }
        if capturePreview { stages.finalImage = image; preview?(stages) }
        advance(.applyWatermark)

        // STEP 7 — Export
        try cancellation.checkpoint()
        let format = context.exporter.exportFormat(for: loaded.originalFormat)
        let outputURL = context.outputURL(for: job.sourceURL, format: format)
        try ensureOutputDirectory()
        let (usedFormat, bytes) = try context.exporter.export(image,
                                                              to: outputURL,
                                                              format: format,
                                                              colorSpace: loaded.colorSpace)
        advance(.export)

        let result = ProcessingResult(
            filename: job.filename,
            outputURL: outputURL,
            pixelsBefore: pixelsBefore,
            pixelsAfter: image.pixelSize,
            watermarkDetected: detection.found,
            watermarkRemoved: watermarkRemoved,
            upscaled: didUpscale,
            duplicateStatus: job.duplicateOf == nil ? "unique" : "duplicate",
            exportFormat: usedFormat,
            byteSize: bytes,
            startedAt: started,
            finishedAt: Date(),
            errors: errors
        )
        progress?(1)
        return result
    }

    private func ensureOutputDirectory() throws {
        let fm = FileManager.default
        var isDir: ObjCBool = false
        if !fm.fileExists(atPath: context.outputDirectory.path, isDirectory: &isDir) {
            try fm.createDirectory(at: context.outputDirectory, withIntermediateDirectories: true)
        } else if !isDir.boolValue {
            throw ProcessingError.outputDirectoryUnavailable(context.outputDirectory)
        }
    }
}
