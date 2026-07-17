import Foundation
import CoreImage
import CoreGraphics

public extension CIImage {
    /// Integer pixel size of the image's extent.
    var pixelSize: PixelSize { PixelSize(extent.size) }

    var longEdge: CGFloat { max(extent.width, extent.height) }

    /// Scale factor needed to bring the long edge up to `target` pixels.
    /// Returns 1 (no change) when the image is already large enough.
    func upscaleFactor(toLongEdge target: Int) -> CGFloat {
        let current = longEdge
        guard current > 0 else { return 1 }
        let factor = CGFloat(target) / current
        return max(1, factor)
    }
}

/// A single, shared Core Image context. Creating a `CIContext` is expensive and
/// it is thread-safe for rendering, so the whole engine reuses one instance.
/// It targets the default Metal device when Metal is available, otherwise it
/// falls back to the CPU renderer automatically.
public enum SharedCIContext {
    public static let context: CIContext = {
        let options: [CIContextOption: Any] = [
            // Work in a wide linear space to preserve highlight/shadow detail
            // through the pipeline; convert to the output profile only at export.
            .workingColorSpace: CGColorSpace(name: CGColorSpace.extendedLinearSRGB) as Any,
            .highQualityDownsample: true,
            .cacheIntermediates: false
        ]
        #if canImport(Metal)
        if let device = MetalDeviceProvider.defaultDevice {
            return CIContext(mtlDevice: device, options: options)
        }
        #endif
        return CIContext(options: options)
    }()
}
