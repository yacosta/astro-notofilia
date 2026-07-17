import Foundation
import CoreImage
import ImageIO
import CoreGraphics
import UniformTypeIdentifiers

/// Encodes the finished image to disk (spec Step 7). Applies the required
/// per-format settings — JPEG quality 0.98 + progressive + embedded profile,
/// PNG lossless, TIFF LZW — and always writes to the output folder without ever
/// touching the original.
public struct ImageExporter {
    private let options: ProcessingOptions

    public init(options: ProcessingOptions) {
        self.options = options
    }

    /// Choose the export format for a source image: explicit override, else keep
    /// the original format when it is exportable, else JPEG.
    public func exportFormat(for original: ImageFormat) -> ImageFormat {
        if let forced = options.outputFormat { return forced }
        return ImageFormat.exportable.contains(original) ? original : .jpeg
    }

    /// Render `image` and write it to `outputURL`.
    /// - Returns: the format used and the number of bytes written.
    @discardableResult
    public func export(_ image: CIImage,
                       to outputURL: URL,
                       format: ImageFormat,
                       colorSpace: CGColorSpace?) throws -> (format: ImageFormat, bytes: Int) {
        let context = SharedCIContext.context
        let outputSpace = colorSpace ?? CGColorSpace(name: CGColorSpace.sRGB)!

        guard let cgImage = context.createCGImage(image, from: image.extent,
                                                   format: .RGBA16,
                                                   colorSpace: outputSpace) else {
            throw ProcessingError.renderFailed("Could not rasterise final image for export")
        }

        guard let destination = CGImageDestinationCreateWithURL(
            outputURL as CFURL, format.utType.identifier as CFString, 1, nil) else {
            throw ProcessingError.cannotEncode(format, underlying: "destination not created")
        }

        CGImageDestinationAddImage(destination, cgImage, properties(for: format) as CFDictionary)
        guard CGImageDestinationFinalize(destination) else {
            throw ProcessingError.cannotEncode(format, underlying: "finalize failed")
        }

        let bytes = (try? FileManager.default.attributesOfItem(atPath: outputURL.path)[.size] as? Int) ?? nil
        return (format, bytes ?? 0)
    }

    /// ImageIO encoder options per format.
    private func properties(for format: ImageFormat) -> [CFString: Any] {
        switch format {
        case .jpeg, .heic:
            return [
                kCGImageDestinationLossyCompressionQuality: options.jpegQuality,
                kCGImagePropertyJFIFDictionary: [
                    kCGImagePropertyJFIFIsProgressive: options.jpegOptimization
                ] as [CFString: Any],
                // Embed colour profile with the encoded pixels.
                kCGImageDestinationEmbedThumbnail: false
            ]
        case .png:
            // PNG is inherently lossless; enable interlacing when optimising.
            return [
                kCGImagePropertyPNGDictionary: [
                    kCGImagePropertyPNGInterlaceType: options.pngOptimization ? 1 : 0
                ] as [CFString: Any]
            ]
        case .tiff:
            return [
                kCGImagePropertyTIFFDictionary: [
                    kCGImagePropertyTIFFCompression: 5   // 5 = LZW
                ] as [CFString: Any]
            ]
        case .bmp, .webp:
            // Never used as an output format (transcoded to JPEG upstream).
            return [:]
        }
    }
}
