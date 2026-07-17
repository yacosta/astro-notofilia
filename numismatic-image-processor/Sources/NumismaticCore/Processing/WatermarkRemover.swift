import Foundation
import CoreImage

/// Removes a detected watermark by reconstructing the masked region with the
/// configured inpainting engine (spec Step 3). No blur, no smear — the engine
/// synthesises plausible background texture.
public struct WatermarkRemover {
    private let inpainter: InpaintingModel

    public init(inpainter: InpaintingModel) {
        self.inpainter = inpainter
    }

    /// - Returns: the reconstructed image, or the original untouched if the
    ///   detection found nothing to remove.
    public func remove(from image: CIImage, detection: WatermarkDetection) throws -> CIImage {
        guard detection.found, let mask = detection.mask else { return image }
        let reconstructed = try inpainter.inpaint(image, mask: mask)
        // Guarantee the extent is preserved (some CoreML buffers add padding).
        return reconstructed.cropped(to: image.extent)
    }
}
