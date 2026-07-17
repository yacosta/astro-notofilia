import Foundation
import CoreImage

/// Abstraction over an image super-resolution engine.
///
/// The production build drops a compiled CoreML model (Real-ESRGAN, SwinIR, or
/// an Apple super-resolution model) behind `CoreMLSuperResolutionModel`. When no
/// model is bundled the pipeline uses `LanczosSuperResolutionModel`, a
/// high-quality non-ML fallback built on Metal Performance Shaders / Core Image
/// Lanczos scaling. Both conform to this protocol so the `Upscaler` stage never
/// needs to know which one it is talking to.
public protocol SuperResolutionModel: Sendable {
    /// Human-readable name for logs and the UI (e.g. "Real-ESRGAN x4").
    var name: String { get }

    /// The fixed integer scale factor this model produces per pass (2, 4, …).
    /// Fallback scalers report `nil` because they can scale by any factor.
    var nativeScaleFactor: Int? { get }

    /// Whether this engine is actually usable in the current runtime (model file
    /// present, OS version high enough, compute units available).
    var isAvailable: Bool { get }

    /// Upscale `image` by roughly `factor`×. Implementations may run several
    /// native passes and a final resample to hit the requested factor exactly.
    /// - Throws: `ProcessingError.modelUnavailable` if the engine cannot run.
    func upscale(_ image: CIImage, factor: CGFloat) throws -> CIImage
}

/// Convenience helpers shared by concrete super-resolution engines.
public extension SuperResolutionModel {
    /// Number of native passes needed to reach or exceed `factor`.
    func passes(for factor: CGFloat) -> Int {
        guard let native = nativeScaleFactor, native > 1, factor > 1 else { return 0 }
        var total: CGFloat = 1
        var passes = 0
        while total < factor {
            total *= CGFloat(native)
            passes += 1
        }
        return passes
    }
}
