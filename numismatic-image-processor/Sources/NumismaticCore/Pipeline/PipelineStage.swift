import Foundation
import CoreImage

/// The ordered stages of the per-image pipeline. Used for progress weighting and
/// for the preview window's "Original → Watermark Removed → Upscaled → Final"
/// stepper.
public enum PipelineStageKind: String, CaseIterable, Sendable {
    case load
    case detectWatermark
    case removeWatermark
    case upscale
    case colorCorrect
    case applyWatermark
    case export

    public var displayName: String {
        switch self {
        case .load:            return "Load"
        case .detectWatermark: return "Detect Watermark"
        case .removeWatermark: return "Remove Watermark"
        case .upscale:         return "Upscale"
        case .colorCorrect:    return "Color Correct"
        case .applyWatermark:  return "Apply Watermark"
        case .export:          return "Export"
        }
    }

    /// Rough share of total work, used to advance `ImageJob.progress` smoothly.
    /// Upscaling dominates, so it carries the most weight.
    public var progressWeight: Double {
        switch self {
        case .load:            return 0.05
        case .detectWatermark: return 0.10
        case .removeWatermark: return 0.15
        case .upscale:         return 0.45
        case .colorCorrect:    return 0.08
        case .applyWatermark:  return 0.07
        case .export:          return 0.10
        }
    }
}

/// Snapshots captured for the preview window. Kept small (rendered lazily by the
/// UI) — the pipeline only tags which intermediate images to expose.
public struct PreviewStages: Sendable {
    public var original: CIImage?
    public var watermarkRemoved: CIImage?
    public var upscaled: CIImage?
    public var finalImage: CIImage?
    public init() {}
}
