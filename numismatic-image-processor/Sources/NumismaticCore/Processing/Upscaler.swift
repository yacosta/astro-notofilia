import Foundation
import CoreImage

/// Brings every image up to at least `minimumLongEdge` pixels on its long side
/// using the configured super-resolution engine (spec Step 4). Images already
/// larger than the target are returned untouched — we never downscale originals.
public struct Upscaler {
    private let model: SuperResolutionModel
    public let minimumLongEdge: Int
    public let preserveAspectRatio: Bool

    public init(model: SuperResolutionModel, minimumLongEdge: Int = 6000, preserveAspectRatio: Bool = true) {
        self.model = model
        self.minimumLongEdge = minimumLongEdge
        self.preserveAspectRatio = preserveAspectRatio
    }

    public struct Outcome { public let image: CIImage; public let didUpscale: Bool }

    public func upscale(_ image: CIImage) throws -> Outcome {
        let factor = image.upscaleFactor(toLongEdge: minimumLongEdge)
        guard factor > 1.0001 else {
            // Already at/above target — leave the archival original as-is.
            return Outcome(image: image, didUpscale: false)
        }
        let result = try model.upscale(image, factor: factor)
        return Outcome(image: result.cropped(to: result.extent), didUpscale: true)
    }
}
