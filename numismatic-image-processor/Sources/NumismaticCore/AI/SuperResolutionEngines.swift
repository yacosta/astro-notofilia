import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
#if canImport(CoreML)
import CoreML
#endif
#if canImport(Vision)
import Vision
#endif

// MARK: - Non-ML fallback (always available)

/// High-quality, dependency-free upscaler used when no CoreML super-resolution
/// model is bundled. Uses Core Image's Lanczos scale transform (GPU-accelerated
/// through the shared Metal-backed `CIContext`) followed by a very light
/// unsharp mask to keep engraving and fine print crisp.
///
/// This is intentionally conservative: it will never hallucinate detail, but it
/// also never smears. It satisfies the "minimum 6000px long edge" requirement
/// out of the box; swapping in Real-ESRGAN simply improves perceived sharpness.
public struct LanczosSuperResolutionModel: SuperResolutionModel {
    public let name = "Lanczos (Core Image / Metal)"
    public let nativeScaleFactor: Int? = nil   // arbitrary factor
    public var isAvailable: Bool { true }

    public init() {}

    public func upscale(_ image: CIImage, factor: CGFloat) throws -> CIImage {
        guard factor > 1 else { return image }

        let scale = CIFilter.lanczosScaleTransform()
        scale.inputImage = image
        scale.scale = Float(factor)
        scale.aspectRatio = 1
        guard let scaled = scale.outputImage else {
            throw ProcessingError.renderFailed("Lanczos scale produced no output")
        }

        // Gentle detail recovery — radius scales with the upscale factor so we
        // reinforce edges introduced by interpolation without ringing/halos.
        let sharpen = CIFilter.unsharpMask()
        sharpen.inputImage = scaled
        sharpen.radius = Float(min(2.5, 0.6 * factor))
        sharpen.intensity = 0.35
        return sharpen.outputImage ?? scaled
    }
}

// MARK: - CoreML engine (Real-ESRGAN / SwinIR / Apple SR)

#if canImport(CoreML)
/// Wraps a compiled CoreML super-resolution model. The model is expected to take
/// a single image input and return a single upscaled image output. Input/output
/// feature names are auto-detected from the model description so the same
/// wrapper works for Real-ESRGAN, SwinIR and Apple-provided SR models.
///
/// Drop the compiled model at `Models/SuperResolution.mlmodelc` in the app
/// bundle (or point `modelURL` at it). If the file is missing, `isAvailable`
/// is false and `ModelRegistry` falls back to Lanczos.
public struct CoreMLSuperResolutionModel: SuperResolutionModel {
    public let name: String
    public let nativeScaleFactor: Int?

    private let model: MLModel?
    private let inputFeature: String?
    private let outputFeature: String?

    public var isAvailable: Bool { model != nil }

    /// - Parameters:
    ///   - modelURL: location of a compiled `.mlmodelc`.
    ///   - name: label for logs/UI.
    ///   - nativeScaleFactor: the model's fixed magnification (e.g. 4).
    public init(modelURL: URL?, name: String = "CoreML Super-Resolution", nativeScaleFactor: Int = 4) {
        self.name = name
        self.nativeScaleFactor = nativeScaleFactor

        guard let url = modelURL, FileManager.default.fileExists(atPath: url.path) else {
            self.model = nil; self.inputFeature = nil; self.outputFeature = nil
            return
        }
        let config = MLModelConfiguration()
        config.computeUnits = .all   // Neural Engine + GPU + CPU as available
        let loaded = try? MLModel(contentsOf: url, configuration: config)
        self.model = loaded
        self.inputFeature = loaded?.modelDescription.inputDescriptionsByName
            .first(where: { $0.value.type == .image })?.key
        self.outputFeature = loaded?.modelDescription.outputDescriptionsByName
            .first(where: { $0.value.type == .image })?.key
    }

    public func upscale(_ image: CIImage, factor: CGFloat) throws -> CIImage {
        guard let model, let inputFeature, let outputFeature else {
            throw ProcessingError.modelUnavailable(name)
        }
        // Run enough native passes to reach the requested factor, then trim any
        // overshoot with a Lanczos downscale so the final long edge is exact.
        var current = image
        let passCount = max(1, passes(for: factor))
        for _ in 0..<passCount {
            current = try runModelPass(current, model: model,
                                       input: inputFeature, output: outputFeature)
        }
        let achieved = current.longEdge / image.longEdge
        if achieved > factor * 1.001 {
            let down = CIFilter.lanczosScaleTransform()
            down.inputImage = current
            down.scale = Float(factor / achieved)
            down.aspectRatio = 1
            current = down.outputImage ?? current
        }
        return current
    }

    private func runModelPass(_ image: CIImage, model: MLModel,
                              input: String, output: String) throws -> CIImage {
        let context = SharedCIContext.context
        guard let cg = context.createCGImage(image, from: image.extent) else {
            throw ProcessingError.renderFailed("Could not rasterise tile for CoreML input")
        }
        let options: [MLFeatureValue.ImageOption: Any] = [:]
        let featureValue = try MLFeatureValue(cgImage: cg,
                                              pixelsWide: cg.width,
                                              pixelsHigh: cg.height,
                                              pixelFormatType: kCVPixelFormatType_32BGRA,
                                              options: options)
        let provider = try MLDictionaryFeatureProvider(dictionary: [input: featureValue])
        let out = try model.prediction(from: provider)
        guard let buffer = out.featureValue(for: output)?.imageBufferValue else {
            throw ProcessingError.renderFailed("CoreML model returned no image output")
        }
        return CIImage(cvPixelBuffer: buffer)
    }
}
#endif
