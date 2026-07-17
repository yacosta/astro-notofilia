import Foundation
import CoreGraphics

/// Where the new watermark is anchored within the image.
public enum WatermarkPlacement: String, CaseIterable, Sendable, Codable, Identifiable {
    case bottomRight
    case bottomLeft
    case center
    case topRight
    case topLeft

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .bottomRight: return "Bottom Right"
        case .bottomLeft:  return "Bottom Left"
        case .center:      return "Center"
        case .topRight:    return "Top Right"
        case .topLeft:     return "Top Left"
        }
    }
}

/// User-configurable appearance of the applied NOTOFILIA watermark.
///
/// Sizes are expressed as *fractions of the image's long edge* so the watermark
/// scales proportionally with the image (spec Step 6 — "Scale proportionally to
/// image size"). This keeps the mark visually consistent whether the export is
/// 6000px or 12000px on its long edge.
public struct WatermarkOptions: Sendable, Codable, Equatable {
    /// The watermark text. Default per spec.
    public var text: String

    /// PostScript font name. `nil` uses the platform system font.
    public var fontName: String?

    /// Opacity 0…1 applied to the white text.
    public var opacity: Double

    /// Cap height of the text as a fraction of the image long edge (e.g. 0.03).
    public var sizeFraction: Double

    /// Margin from the anchored edges as a fraction of the image long edge.
    public var marginFraction: Double

    public var placement: WatermarkPlacement

    /// Draw a thin drop shadow behind the text for legibility on light images.
    public var drawShadow: Bool

    public static let defaultText = "COLECCIÓN VIRTUAL - NOTOFILIA.COM"

    public init(
        text: String = WatermarkOptions.defaultText,
        fontName: String? = nil,
        opacity: Double = 0.55,
        sizeFraction: Double = 0.028,
        marginFraction: Double = 0.025,
        placement: WatermarkPlacement = .bottomRight,
        drawShadow: Bool = true
    ) {
        self.text = text
        self.fontName = fontName
        self.opacity = opacity
        self.sizeFraction = sizeFraction
        self.marginFraction = marginFraction
        self.placement = placement
        self.drawShadow = drawShadow
    }

    public static let `default` = WatermarkOptions()
}
