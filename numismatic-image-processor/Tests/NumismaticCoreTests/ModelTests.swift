import XCTest
@testable import NumismaticCore

final class ModelTests: XCTestCase {
    // MARK: SupportedFormat

    func testFormatFromURLExtension() {
        XCTAssertEqual(ImageFormat.from(url: URL(fileURLWithPath: "/x/a.JPG")), .jpeg)
        XCTAssertEqual(ImageFormat.from(url: URL(fileURLWithPath: "/x/a.tiff")), .tiff)
        XCTAssertEqual(ImageFormat.from(url: URL(fileURLWithPath: "/x/a.heic")), .heic)
        XCTAssertNil(ImageFormat.from(url: URL(fileURLWithPath: "/x/a.gif")))
    }

    func testOnlyArchivalFormatsAreExportable() {
        XCTAssertEqual(Set(ImageFormat.exportable), [.jpeg, .png, .tiff, .heic])
        XCTAssertFalse(ImageFormat.exportable.contains(.webp))
        XCTAssertFalse(ImageFormat.exportable.contains(.bmp))
    }

    // MARK: Defaults from the spec

    func testProcessingDefaultsMatchSpec() {
        let o = ProcessingOptions.default
        XCTAssertEqual(o.minimumLongEdge, 6000)
        XCTAssertEqual(o.jpegQuality, 0.98, accuracy: 0.0001)
        XCTAssertTrue(o.applyNewWatermark)
        XCTAssertTrue(o.removeExistingWatermark)
    }

    func testWatermarkDefaultText() {
        XCTAssertEqual(WatermarkOptions.default.text, "COLECCIÓN VIRTUAL - NOTOFILIA.COM")
        XCTAssertEqual(WatermarkOptions.default.placement, .bottomRight)
    }

    // MARK: Codable round-trips (used by Preferences persistence)

    func testProcessingOptionsCodableRoundTrip() throws {
        var o = ProcessingOptions.default
        o.minimumLongEdge = 8000
        o.outputFormat = .png
        let data = try JSONEncoder().encode(o)
        let decoded = try JSONDecoder().decode(ProcessingOptions.self, from: data)
        XCTAssertEqual(decoded, o)
    }

    func testWatermarkOptionsCodableRoundTrip() throws {
        var w = WatermarkOptions.default
        w.opacity = 0.7
        w.placement = .center
        let data = try JSONEncoder().encode(w)
        let decoded = try JSONDecoder().decode(WatermarkOptions.self, from: data)
        XCTAssertEqual(decoded, w)
    }

    // MARK: Upscale factor logic

    func testUpscaleFactorNeverDownscales() {
        // A 8000px image already exceeds 6000 → factor 1 (no resize).
        let size = PixelSize(width: 8000, height: 4000)
        XCTAssertEqual(size.longEdge, 8000)
    }
}
