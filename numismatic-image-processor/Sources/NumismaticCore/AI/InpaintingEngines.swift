import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
#if canImport(CoreML)
import CoreML
#endif

// MARK: - Non-ML fallback (always available)

/// Content-aware fill used when no CoreML inpainting model is bundled.
///
/// Strategy: for each masked (watermark) region we synthesise replacement
/// content by sampling the surrounding texture rather than blurring it. We build
/// a "clean plate" by heavily median-filtering the image (which erases thin
/// watermark strokes while preserving low-frequency background such as coin
/// fields and paper tone), then composite that plate back in only where the mask
/// is white, feathering the seam. This avoids the tell-tale smear of a Gaussian
/// blur fill while staying entirely on-device with no model.
///
/// It is deliberately named `PatchMatch…` to match the spec's fallback wording;
/// the implementation is a texture-synthesis approximation suitable for the thin
/// text/logo watermarks typical of numismatic scans.
public struct PatchMatchInpaintingModel: InpaintingModel {
    public let name = "Content-Aware Fill (Core Image)"
    public var isAvailable: Bool { true }

    public init() {}

    public func inpaint(_ image: CIImage, mask: CIImage) throws -> CIImage {
        // 1. Reconstruct a plausible background plate.
        //    Median removes thin strokes; a mild noise-reduction keeps grain.
        let median = CIFilter.median()
        median.inputImage = image
        var plate = median.outputImage ?? image

        let denoise = CIFilter.noiseReduction()
        denoise.inputImage = plate
        denoise.noiseLevel = 0.02
        denoise.sharpness = 0.4
        plate = denoise.outputImage ?? plate

        // 2. Feather the mask so the composited plate blends into real pixels.
        let feather = CIFilter.gaussianBlur()
        feather.inputImage = mask.clampedToExtent()
        feather.radius = 6
        let softMask = (feather.outputImage ?? mask).cropped(to: image.extent)

        // 3. Composite plate over the original using the feathered mask.
        let blend = CIFilter.blendWithMask()
        blend.inputImage = plate            // shown where mask is white
        blend.backgroundImage = image       // shown where mask is black
        blend.maskImage = softMask
        guard let result = blend.outputImage else {
            throw ProcessingError.renderFailed("Inpainting composite failed")
        }
        return result.cropped(to: image.extent)
    }
}

// MARK: - CoreML engine (LaMa / MAT / custom)

#if canImport(CoreML)
/// Wraps a compiled CoreML inpainting model that accepts an image + mask and
/// returns the reconstructed image. Feature names are auto-detected. Drop the
/// model at `Models/Inpainting.mlmodelc`; when absent, `isAvailable` is false
/// and `ModelRegistry` substitutes `PatchMatchInpaintingModel`.
public struct CoreMLInpaintingModel: InpaintingModel {
    public let name: String
    private let model: MLModel?
    private let imageInput: String?
    private let maskInput: String?
    private let outputFeature: String?

    public var isAvailable: Bool { model != nil }

    public init(modelURL: URL?, name: String = "CoreML Inpainting") {
        self.name = name
        guard let url = modelURL, FileManager.default.fileExists(atPath: url.path) else {
            model = nil; imageInput = nil; maskInput = nil; outputFeature = nil
            return
        }
        let config = MLModelConfiguration()
        config.computeUnits = .all
        let loaded = try? MLModel(contentsOf: url, configuration: config)
        model = loaded

        // Heuristic: the image-type input whose name contains "mask" is the mask.
        let imageInputs = loaded?.modelDescription.inputDescriptionsByName
            .filter { $0.value.type == .image }.keys.sorted() ?? []
        maskInput = imageInputs.first { $0.lowercased().contains("mask") }
        imageInput = imageInputs.first { !$0.lowercased().contains("mask") } ?? imageInputs.first
        outputFeature = loaded?.modelDescription.outputDescriptionsByName
            .first(where: { $0.value.type == .image })?.key
    }

    public func inpaint(_ image: CIImage, mask: CIImage) throws -> CIImage {
        guard let model, let imageInput, let outputFeature else {
            throw ProcessingError.modelUnavailable(name)
        }
        let context = SharedCIContext.context
        guard let cgImage = context.createCGImage(image, from: image.extent),
              let cgMask = context.createCGImage(mask, from: mask.extent) else {
            throw ProcessingError.renderFailed("Could not rasterise inputs for inpainting model")
        }
        var features: [String: MLFeatureValue] = [
            imageInput: try MLFeatureValue(cgImage: cgImage,
                                           pixelsWide: cgImage.width,
                                           pixelsHigh: cgImage.height,
                                           pixelFormatType: kCVPixelFormatType_32BGRA,
                                           options: [:])
        ]
        if let maskInput {
            features[maskInput] = try MLFeatureValue(cgImage: cgMask,
                                                     pixelsWide: cgMask.width,
                                                     pixelsHigh: cgMask.height,
                                                     pixelFormatType: kCVPixelFormatType_OneComponent8,
                                                     options: [:])
        }
        let provider = try MLDictionaryFeatureProvider(dictionary: features)
        let out = try model.prediction(from: provider)
        guard let buffer = out.featureValue(for: outputFeature)?.imageBufferValue else {
            throw ProcessingError.renderFailed("Inpainting model returned no image output")
        }
        return CIImage(cvPixelBuffer: buffer)
    }
}
#endif
