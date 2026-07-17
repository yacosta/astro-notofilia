import Foundation
import CoreImage

/// A pluggable processing step that runs between color-correction and
/// watermarking (see spec "Future Plugin Architecture"). New capabilities —
/// background removal, automatic cropping, coin centering, scratch removal,
/// color restoration, metadata editing, AI captioning — are added by conforming
/// to this protocol and registering with a `PluginRegistry`; no change to the
/// core pipeline is required.
public protocol ProcessorPlugin: Sendable {
    /// Stable identifier, e.g. "com.notofilia.background-removal".
    var identifier: String { get }
    /// Display name for the UI.
    var name: String { get }
    /// Whether the user has this plugin enabled.
    var isEnabled: Bool { get }

    /// Transform `image`. Implementations must preserve the image extent unless
    /// they intentionally crop (e.g. auto-crop), and must be thread-safe.
    func process(_ image: CIImage, job: ImageJob, context: PipelineContext) throws -> CIImage
}

public extension ProcessorPlugin {
    var isEnabled: Bool { true }
}
