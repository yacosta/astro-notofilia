import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
import CoreGraphics

/// Compact perceptual fingerprints of an image, robust to resize/recompress and
/// (via the average hash) tolerant of small edits. Used by `DuplicateDetector`.
///
/// - `average` (aHash): 64-bit, each bit = pixel brighter than the 8×8 mean.
/// - `difference` (dHash): 64-bit, each bit = pixel brighter than its left
///   neighbour on a 9×8 grid. dHash is strong against gamma/brightness shifts.
public struct PerceptualHashes: Sendable, Equatable {
    public let average: UInt64
    public let difference: UInt64

    /// Combined distance: Hamming over both hashes (0…128), lower = more similar.
    public func distance(to other: PerceptualHashes) -> Int {
        (average ^ other.average).nonzeroBitCount +
        (difference ^ other.difference).nonzeroBitCount
    }
}

/// Computes perceptual hashes by rendering tiny grayscale thumbnails through the
/// shared Core Image context and thresholding their luminance.
public struct PerceptualHasher {
    private let context = SharedCIContext.context

    public init() {}

    public func hashes(for image: CIImage) -> PerceptualHashes? {
        guard let a = averageHash(image), let d = differenceHash(image) else { return nil }
        return PerceptualHashes(average: a, difference: d)
    }

    // MARK: aHash (8×8)

    private func averageHash(_ image: CIImage) -> UInt64? {
        guard let px = grayPixels(image, width: 8, height: 8) else { return nil }
        let mean = px.reduce(0, { $0 + Int($1) }) / px.count
        var bits: UInt64 = 0
        for (i, value) in px.enumerated() where Int(value) >= mean {
            bits |= (1 << UInt64(i))
        }
        return bits
    }

    // MARK: dHash (9×8 → 8×8 comparisons)

    private func differenceHash(_ image: CIImage) -> UInt64? {
        guard let px = grayPixels(image, width: 9, height: 8) else { return nil }
        var bits: UInt64 = 0
        var bitIndex = 0
        for row in 0..<8 {
            for col in 0..<8 {
                let left = px[row * 9 + col]
                let right = px[row * 9 + col + 1]
                if right > left { bits |= (1 << UInt64(bitIndex)) }
                bitIndex += 1
            }
        }
        return bits
    }

    /// Downscale to `width`×`height`, desaturate, and read 8-bit luminance.
    private func grayPixels(_ image: CIImage, width: Int, height: Int) -> [UInt8]? {
        let mono = CIFilter.colorControls()
        mono.inputImage = image
        mono.saturation = 0
        guard let gray = mono.outputImage else { return nil }

        let scaleX = CGFloat(width) / gray.extent.width
        let scaleY = CGFloat(height) / gray.extent.height
        let small = gray.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))
            .cropped(to: CGRect(x: 0, y: 0, width: width, height: height))

        var buffer = [UInt8](repeating: 0, count: width * height * 4)
        let space = CGColorSpace(name: CGColorSpace.sRGB)!
        context.render(small,
                       toBitmap: &buffer,
                       rowBytes: width * 4,
                       bounds: CGRect(x: 0, y: 0, width: width, height: height),
                       format: .RGBA8,
                       colorSpace: space)
        // Take the red channel (image is already desaturated → R=G=B).
        return stride(from: 0, to: buffer.count, by: 4).map { buffer[$0] }
    }
}
