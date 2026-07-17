import Foundation

/// How duplicate images should be handled once detected.
public enum DuplicateHandling: String, CaseIterable, Sendable, Codable {
    /// Process every image regardless of duplicates (still reported).
    case none
    /// Skip images detected as duplicates of an already-queued image.
    case skip
    /// Process the first copy, move later copies to a `/duplicates` folder.
    case move
}

/// The full set of toggles that control a batch run. Mirrors the checkboxes in
/// the "Processing Options" section of the UI.
public struct ProcessingOptions: Sendable, Codable, Equatable {
    // Watermark handling
    public var removeExistingWatermark: Bool
    public var aiWatermarkDetection: Bool
    public var removeLogos: Bool
    public var applyNewWatermark: Bool

    // Geometry / quality
    public var upscaleToMinimum: Bool
    /// Minimum long-edge in pixels for upscaling (spec default: 6000).
    public var minimumLongEdge: Int
    public var preserveAspectRatio: Bool
    public var lightColorCorrection: Bool

    // Encoding
    public var jpegOptimization: Bool
    public var pngOptimization: Bool
    public var tiffSupport: Bool
    public var heicSupport: Bool

    /// Preferred output format. If `nil`, each image keeps its own format when
    /// that format is exportable, otherwise falls back to JPEG.
    public var outputFormat: ImageFormat?

    /// JPEG quality 0…1 (spec: 0.98).
    public var jpegQuality: Double

    // Duplicate detection
    public var detectDuplicates: Bool
    public var duplicateHandling: DuplicateHandling

    public init(
        removeExistingWatermark: Bool = true,
        aiWatermarkDetection: Bool = true,
        removeLogos: Bool = true,
        applyNewWatermark: Bool = true,
        upscaleToMinimum: Bool = true,
        minimumLongEdge: Int = 6000,
        preserveAspectRatio: Bool = true,
        lightColorCorrection: Bool = true,
        jpegOptimization: Bool = true,
        pngOptimization: Bool = true,
        tiffSupport: Bool = true,
        heicSupport: Bool = true,
        outputFormat: ImageFormat? = .jpeg,
        jpegQuality: Double = 0.98,
        detectDuplicates: Bool = true,
        duplicateHandling: DuplicateHandling = .skip
    ) {
        self.removeExistingWatermark = removeExistingWatermark
        self.aiWatermarkDetection = aiWatermarkDetection
        self.removeLogos = removeLogos
        self.applyNewWatermark = applyNewWatermark
        self.upscaleToMinimum = upscaleToMinimum
        self.minimumLongEdge = minimumLongEdge
        self.preserveAspectRatio = preserveAspectRatio
        self.lightColorCorrection = lightColorCorrection
        self.jpegOptimization = jpegOptimization
        self.pngOptimization = pngOptimization
        self.tiffSupport = tiffSupport
        self.heicSupport = heicSupport
        self.outputFormat = outputFormat
        self.jpegQuality = jpegQuality
        self.detectDuplicates = detectDuplicates
        self.duplicateHandling = duplicateHandling
    }

    public static let `default` = ProcessingOptions()
}
