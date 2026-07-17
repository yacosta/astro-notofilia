import Foundation
import CoreGraphics

/// Immutable record of what happened to one image. Also the row shape used by
/// the CSV / JSON reports (see `ReportWriter`).
public struct ProcessingResult: Sendable, Codable {
    public var filename: String
    public var outputURL: URL?

    public var pixelsBefore: PixelSize
    public var pixelsAfter: PixelSize

    public var watermarkDetected: Bool
    public var watermarkRemoved: Bool
    public var upscaled: Bool
    public var duplicateStatus: String   // "unique", "duplicate-of:<name>", etc.

    public var exportFormat: ImageFormat
    public var byteSize: Int?

    public var startedAt: Date
    public var finishedAt: Date

    public var errors: [String]

    public var processingSeconds: TimeInterval { finishedAt.timeIntervalSince(startedAt) }

    public init(
        filename: String,
        outputURL: URL?,
        pixelsBefore: PixelSize,
        pixelsAfter: PixelSize,
        watermarkDetected: Bool,
        watermarkRemoved: Bool,
        upscaled: Bool,
        duplicateStatus: String,
        exportFormat: ImageFormat,
        byteSize: Int?,
        startedAt: Date,
        finishedAt: Date,
        errors: [String] = []
    ) {
        self.filename = filename
        self.outputURL = outputURL
        self.pixelsBefore = pixelsBefore
        self.pixelsAfter = pixelsAfter
        self.watermarkDetected = watermarkDetected
        self.watermarkRemoved = watermarkRemoved
        self.upscaled = upscaled
        self.duplicateStatus = duplicateStatus
        self.exportFormat = exportFormat
        self.byteSize = byteSize
        self.startedAt = startedAt
        self.finishedAt = finishedAt
        self.errors = errors
    }
}

/// Integer pixel dimensions with a couple of convenience accessors.
public struct PixelSize: Sendable, Codable, Equatable {
    public var width: Int
    public var height: Int

    public init(width: Int, height: Int) {
        self.width = width
        self.height = height
    }

    public init(_ size: CGSize) {
        self.width = Int(size.width.rounded())
        self.height = Int(size.height.rounded())
    }

    public var longEdge: Int { max(width, height) }
    public var shortEdge: Int { min(width, height) }
    public var cgSize: CGSize { CGSize(width: width, height: height) }
    public var description: String { "\(width)×\(height)" }
}
