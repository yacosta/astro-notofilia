import Foundation
import CoreImage
import CoreGraphics
import CoreText

/// Draws the new NOTOFILIA watermark onto the finished image (spec Step 6):
/// semi-transparent white text with a thin shadow, a consistent margin, scaled
/// proportionally to the image and never cropped.
///
/// Text is rasterised with Core Text into a transparent layer the size of the
/// image, then composited over it with Core Image so the operation stays inside
/// the GPU-backed pipeline and the colour space is preserved.
public struct WatermarkApplicator {
    private let options: WatermarkOptions

    public init(options: WatermarkOptions) {
        self.options = options
    }

    public func apply(to image: CIImage) throws -> CIImage {
        let extent = image.extent
        guard extent.width > 0, extent.height > 0 else { return image }
        let longEdge = max(extent.width, extent.height)

        // Derive point sizes from fractions of the long edge (proportional scaling).
        let fontSize = max(8, longEdge * CGFloat(options.sizeFraction))
        let margin = longEdge * CGFloat(options.marginFraction)

        guard let overlay = renderTextLayer(extent: extent,
                                            fontSize: fontSize,
                                            margin: margin) else {
            throw ProcessingError.renderFailed("Could not rasterise watermark text")
        }

        let composite = CIFilter(name: "CISourceOverCompositing")!
        composite.setValue(overlay, forKey: kCIInputImageKey)
        composite.setValue(image, forKey: kCIInputBackgroundImageKey)
        return (composite.outputImage ?? image).cropped(to: extent)
    }

    /// Rasterise the watermark text into a transparent CIImage the size of the
    /// source, positioned according to `options.placement` with `margin` inset.
    private func renderTextLayer(extent: CGRect, fontSize: CGFloat, margin: CGFloat) -> CIImage? {
        let width = Int(extent.width.rounded())
        let height = Int(extent.height.rounded())
        guard width > 0, height > 0 else { return nil }

        let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
        guard let ctx = CGContext(data: nil,
                                  width: width, height: height,
                                  bitsPerComponent: 8, bytesPerRow: 0,
                                  space: colorSpace,
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
            return nil
        }

        // Build the attributed string.
        let font: CTFont = {
            if let name = options.fontName {
                return CTFontCreateWithName(name as CFString, fontSize, nil)
            }
            return CTFontCreateUIFontForLanguage(.system, fontSize, nil)
                ?? CTFontCreateWithName("Helvetica" as CFString, fontSize, nil)
        }()
        let textColor = CGColor(srgbRed: 1, green: 1, blue: 1, alpha: CGFloat(options.opacity))
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: textColor
        ]
        let attributed = NSAttributedString(string: options.text, attributes: attributes)
        let line = CTLineCreateWithAttributedString(attributed)
        let bounds = CTLineGetImageBounds(line, ctx)

        let (x, y) = position(for: bounds.size, in: extent, margin: margin)

        // Thin drop shadow for legibility on light backgrounds.
        if options.drawShadow {
            let blur = max(1, fontSize * 0.04)
            ctx.setShadow(offset: CGSize(width: 0, height: -blur),
                          blur: blur,
                          color: CGColor(srgbRed: 0, green: 0, blue: 0, alpha: CGFloat(options.opacity) * 0.8))
        }

        // Core Text falls back to the context fill colour when the attributed
        // string's foreground colour isn't honoured, so set it explicitly.
        ctx.setFillColor(textColor)
        ctx.textPosition = CGPoint(x: x, y: y)
        CTLineDraw(line, ctx)

        guard let cg = ctx.makeImage() else { return nil }
        // Place the overlay at the source extent's origin.
        return CIImage(cgImage: cg).transformed(by: CGAffineTransform(translationX: extent.origin.x, y: extent.origin.y))
    }

    /// Origin (bottom-left, Core Graphics coordinates) for the text given its
    /// rendered size and the requested placement.
    private func position(for textSize: CGSize, in extent: CGRect, margin: CGFloat) -> (CGFloat, CGFloat) {
        let w = extent.width, h = extent.height
        switch options.placement {
        case .bottomRight: return (w - textSize.width - margin, margin)
        case .bottomLeft:  return (margin, margin)
        case .topRight:    return (w - textSize.width - margin, h - textSize.height - margin)
        case .topLeft:     return (margin, h - textSize.height - margin)
        case .center:      return ((w - textSize.width) / 2, (h - textSize.height) / 2)
        }
    }
}
