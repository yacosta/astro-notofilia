import Foundation
import SwiftUI
import CoreImage
#if canImport(AppKit)
import AppKit
#endif
import NumismaticCore

/// Runs the pipeline for a single image (off the batch queue) purely to capture
/// the four preview stages the spec's Preview Window shows:
/// Original → Watermark Removed → Upscaled → Final.
@MainActor
final class PreviewViewModel: ObservableObject {
    enum Stage: String, CaseIterable, Identifiable {
        case original = "Original"
        case watermarkRemoved = "Watermark Removed"
        case upscaled = "Upscaled"
        case finalImage = "Final Image"
        var id: String { rawValue }
    }

    @Published var images: [Stage: Image] = [:]
    @Published var isRendering = false
    @Published var error: String?

    /// Generate previews for `job` using the current options/watermark. Uses a
    /// smaller minimum long edge so the preview renders quickly; the real batch
    /// run still targets the full resolution.
    func generate(for job: ImageJob, options: ProcessingOptions, watermark: WatermarkOptions) {
        isRendering = true
        error = nil
        images = [:]

        // Preview at reduced target for speed.
        var previewOptions = options
        previewOptions.minimumLongEdge = min(options.minimumLongEdge, 2000)

        let logger = ProcessingLogger(logsDirectory: FileManager.default.temporaryDirectory
            .appendingPathComponent("notofilia-preview-logs"))
        let context = PipelineContext(options: previewOptions,
                                      watermarkOptions: watermark,
                                      outputDirectory: FileManager.default.temporaryDirectory
                                        .appendingPathComponent("notofilia-preview-out"),
                                      models: ModelRegistry(),
                                      logger: logger)
        let pipeline = ImageProcessingPipeline(context: context)
        let token = CancellationToken()

        DispatchQueue.global(qos: .userInitiated).async {
            var captured = PreviewStages()
            _ = try? pipeline.process(job,
                                      cancellation: token,
                                      capturePreview: true,
                                      preview: { captured = $0 },
                                      progress: nil)
            let rendered = self.render(captured)
            DispatchQueue.main.async {
                self.images = rendered
                self.isRendering = false
                if rendered.isEmpty { self.error = "Could not render preview." }
            }
        }
    }

    private func render(_ stages: PreviewStages) -> [Stage: Image] {
        var out: [Stage: Image] = [:]
        if let ci = stages.original,        let img = toImage(ci) { out[.original] = img }
        if let ci = stages.watermarkRemoved, let img = toImage(ci) { out[.watermarkRemoved] = img }
        if let ci = stages.upscaled,        let img = toImage(ci) { out[.upscaled] = img }
        if let ci = stages.finalImage,      let img = toImage(ci) { out[.finalImage] = img }
        return out
    }

    /// Render a CIImage into a SwiftUI Image, downscaling very large previews so
    /// the UI stays responsive (the actual export keeps full resolution).
    private func toImage(_ ci: CIImage) -> Image? {
        #if canImport(AppKit)
        let maxEdge: CGFloat = 1400
        var image = ci
        let long = max(ci.extent.width, ci.extent.height)
        if long > maxEdge {
            let scale = maxEdge / long
            image = ci.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        }
        guard let cg = SharedCIContext.context.createCGImage(image, from: image.extent) else { return nil }
        let ns = NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height))
        return Image(nsImage: ns)
        #else
        return nil
        #endif
    }
}
