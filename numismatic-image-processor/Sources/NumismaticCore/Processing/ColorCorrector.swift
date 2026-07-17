import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins

/// Very light, appearance-preserving finishing pass (spec Step 5): minor
/// contrast, minor clarity, gentle noise reduction and edge-safe sharpening.
/// Explicitly avoids halos by keeping the unsharp-mask radius small and its
/// intensity low. Intended to make detail read well at print scale without
/// changing the object's true colour or tone.
public struct ColorCorrector {
    public struct Settings: Sendable {
        public var contrast: Float          // multiplicative, ~1.0
        public var noiseLevel: Float
        public var noiseSharpness: Float
        public var unsharpRadius: Float
        public var unsharpIntensity: Float

        public init(contrast: Float = 1.03,
                    noiseLevel: Float = 0.015,
                    noiseSharpness: Float = 0.4,
                    unsharpRadius: Float = 1.2,
                    unsharpIntensity: Float = 0.3) {
            self.contrast = contrast
            self.noiseLevel = noiseLevel
            self.noiseSharpness = noiseSharpness
            self.unsharpRadius = unsharpRadius
            self.unsharpIntensity = unsharpIntensity
        }

        public static let `default` = Settings()
    }

    private let settings: Settings

    public init(settings: Settings = .default) {
        self.settings = settings
    }

    public func apply(to image: CIImage) -> CIImage {
        var current = image

        // 1. Gentle noise reduction first, so sharpening doesn't amplify grain.
        let denoise = CIFilter.noiseReduction()
        denoise.inputImage = current
        denoise.noiseLevel = settings.noiseLevel
        denoise.sharpness = settings.noiseSharpness
        current = denoise.outputImage ?? current

        // 2. Minor contrast only — saturation/brightness untouched to preserve
        //    the object's true appearance.
        let controls = CIFilter.colorControls()
        controls.inputImage = current
        controls.contrast = settings.contrast
        controls.saturation = 1.0
        controls.brightness = 0.0
        current = controls.outputImage ?? current

        // 3. Small-radius unsharp mask for clarity without halos.
        let sharpen = CIFilter.unsharpMask()
        sharpen.inputImage = current
        sharpen.radius = settings.unsharpRadius
        sharpen.intensity = settings.unsharpIntensity
        current = sharpen.outputImage ?? current

        return current.cropped(to: image.extent)
    }
}
