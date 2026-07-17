import Foundation
import CoreImage
import ImageIO
import CoreGraphics

/// Loads images from disk into `CIImage`, honouring EXIF orientation and
/// preserving the embedded colour profile. (Pipeline Step 1.)
public struct ImageLoader {
    public init() {}

    public struct LoadedImage {
        public let image: CIImage
        public let originalFormat: ImageFormat
        public let pixelSize: PixelSize
        /// The source's ICC colour space, carried through to export.
        public let colorSpace: CGColorSpace?
        /// Raw EXIF/TIFF metadata dictionary, re-embedded on export.
        public let properties: [CFString: Any]
    }

    public func load(_ url: URL) throws -> LoadedImage {
        guard let format = ImageFormat.from(url: url) else {
            throw ProcessingError.unsupportedFormat(url.pathExtension)
        }
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              CGImageSourceGetCount(source) > 0 else {
            throw ProcessingError.cannotDecode(url)
        }

        let props = (CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any]) ?? [:]

        // `applyOrientationProperty` bakes EXIF orientation into the pixel data
        // so downstream stages work in display orientation.
        let options: [CIImageOption: Any] = [.applyOrientationProperty: true]
        guard let image = CIImage(contentsOf: url, options: options) else {
            throw ProcessingError.cannotDecode(url)
        }

        return LoadedImage(
            image: image,
            originalFormat: format,
            pixelSize: image.pixelSize,
            colorSpace: image.colorSpace,
            properties: props
        )
    }

    /// Fast metadata-only read (dimensions + format) without decoding pixels —
    /// used for the input-folder summary and duplicate pre-pass sizing.
    public func inspect(_ url: URL) -> (format: ImageFormat, size: PixelSize)? {
        guard let format = ImageFormat.from(url: url),
              let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let props = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
              let w = props[kCGImagePropertyPixelWidth] as? Int,
              let h = props[kCGImagePropertyPixelHeight] as? Int else {
            return nil
        }
        return (format, PixelSize(width: w, height: h))
    }
}
