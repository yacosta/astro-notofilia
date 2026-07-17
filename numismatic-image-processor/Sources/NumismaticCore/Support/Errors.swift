import Foundation

/// Errors surfaced by the engine. Each case carries enough context to write a
/// useful line to `processing.log` and to show the user a retryable message.
public enum ProcessingError: Error, LocalizedError, Sendable {
    case unsupportedFormat(String)
    case cannotDecode(URL)
    case cannotEncode(ImageFormat, underlying: String?)
    case cannotCreateContext
    case renderFailed(String)
    case outputDirectoryUnavailable(URL)
    case cancelled
    case modelUnavailable(String)

    public var errorDescription: String? {
        switch self {
        case .unsupportedFormat(let ext):
            return "Unsupported image format: .\(ext)"
        case .cannotDecode(let url):
            return "Could not decode image: \(url.lastPathComponent)"
        case .cannotEncode(let format, let underlying):
            return "Could not encode \(format.rawValue.uppercased())" +
                (underlying.map { ": \($0)" } ?? "")
        case .cannotCreateContext:
            return "Could not create a Core Image / Metal rendering context"
        case .renderFailed(let detail):
            return "Rendering failed: \(detail)"
        case .outputDirectoryUnavailable(let url):
            return "Output directory is unavailable: \(url.path)"
        case .cancelled:
            return "Processing was cancelled"
        case .modelUnavailable(let name):
            return "AI model unavailable, using fallback: \(name)"
        }
    }
}
