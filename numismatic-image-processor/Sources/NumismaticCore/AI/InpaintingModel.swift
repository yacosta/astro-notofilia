import Foundation
import CoreImage

/// Abstraction over the engine that reconstructs image regions where a
/// watermark or logo was removed (spec Step 3 — "Reconstruct background
/// naturally. Do NOT blur. Do NOT smear.").
///
/// Production drops a CoreML inpainting model (e.g. LaMa / MAT converted to
/// `.mlpackage`) behind `CoreMLInpaintingModel`. The non-ML fallback,
/// `PatchMatchInpaintingModel`, performs texture-synthesis / content-aware fill
/// using Core Image so the app is fully functional before any model is added.
public protocol InpaintingModel: Sendable {
    var name: String { get }
    var isAvailable: Bool { get }

    /// Reconstruct `image` inside the white regions of `mask` (same extent as
    /// `image`; white = reconstruct, black = keep). Returns a full-size image.
    func inpaint(_ image: CIImage, mask: CIImage) throws -> CIImage
}
