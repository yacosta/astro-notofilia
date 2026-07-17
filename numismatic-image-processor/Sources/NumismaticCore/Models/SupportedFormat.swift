import Foundation
import UniformTypeIdentifiers

/// Image container formats the processor can read and write.
///
/// Input accepts a superset of what we can export: BMP and WEBP are decoded
/// but always re-encoded to one of the archival output formats.
public enum ImageFormat: String, CaseIterable, Sendable, Codable {
    case jpeg
    case png
    case tiff
    case heic
    case bmp
    case webp

    /// File extensions (lower-cased, no dot) that map to this format.
    public var fileExtensions: [String] {
        switch self {
        case .jpeg: return ["jpg", "jpeg"]
        case .png:  return ["png"]
        case .tiff: return ["tif", "tiff"]
        case .heic: return ["heic", "heif"]
        case .bmp:  return ["bmp"]
        case .webp: return ["webp"]
        }
    }

    /// The Uniform Type Identifier used by ImageIO for encoding/decoding.
    public var utType: UTType {
        switch self {
        case .jpeg: return .jpeg
        case .png:  return .png
        case .tiff: return .tiff
        case .heic: return .heic
        case .bmp:  return .bmp
        case .webp: return .webP
        }
    }

    /// Formats we are allowed to write. WEBP/BMP inputs are transcoded to these.
    public static var exportable: [ImageFormat] { [.jpeg, .png, .tiff, .heic] }

    /// Resolve a format from a file URL's path extension, if supported.
    public static func from(url: URL) -> ImageFormat? {
        let ext = url.pathExtension.lowercased()
        return allCases.first { $0.fileExtensions.contains(ext) }
    }

    /// Every extension that we accept as input, e.g. for an open-panel filter.
    public static var allInputExtensions: [String] {
        allCases.flatMap { $0.fileExtensions }
    }
}
