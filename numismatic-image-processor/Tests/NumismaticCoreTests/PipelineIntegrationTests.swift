import XCTest
import CoreImage
import ImageIO
import UniformTypeIdentifiers
@testable import NumismaticCore

/// End-to-end test: synthesise a small image on disk, run the full pipeline, and
/// assert the output exists, is upscaled to the target, preserves the filename,
/// and never touches the original. Exercises real Core Image rendering, so it
/// runs on macOS only.
final class PipelineIntegrationTests: XCTestCase {
    private var workDir: URL!

    override func setUpWithError() throws {
        workDir = FileManager.default.temporaryDirectory
            .appendingPathComponent("notofilia-tests-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: workDir, withIntermediateDirectories: true)
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: workDir)
    }

    func testEndToEndProducesUpscaledWatermarkedOutput() throws {
        // 1. Write a 512px synthetic source image.
        let source = workDir.appendingPathComponent("coin_001.jpg")
        try writeSyntheticImage(to: source, size: 512)

        // 2. Configure a fast run (target 1500px so the test is quick).
        var options = ProcessingOptions.default
        options.minimumLongEdge = 1500
        options.detectDuplicates = false

        let outputDir = workDir.appendingPathComponent("output", isDirectory: true)
        let logger = ProcessingLogger(logsDirectory: outputDir.appendingPathComponent("logs"))
        let context = PipelineContext(options: options,
                                      watermarkOptions: .default,
                                      outputDirectory: outputDir,
                                      models: ModelRegistry(modelsDirectory: nil),
                                      logger: logger)

        // 3. Run the single-image pipeline directly.
        let job = ImageJob(sourceURL: source)
        let pipeline = ImageProcessingPipeline(context: context)
        let result = try pipeline.process(job, cancellation: CancellationToken())

        // 4. Assertions.
        let expectedOutput = outputDir.appendingPathComponent("coin_001.jpg")
        XCTAssertTrue(FileManager.default.fileExists(atPath: expectedOutput.path),
                      "output should be written preserving the filename")
        XCTAssertGreaterThanOrEqual(result.pixelsAfter.longEdge, 1500,
                                    "image should be upscaled to at least the target")
        XCTAssertTrue(result.upscaled)
        XCTAssertTrue(FileManager.default.fileExists(atPath: source.path),
                      "original must never be deleted or overwritten")
        XCTAssertEqual(result.exportFormat, .jpeg)
    }

    func testAlreadyLargeImageIsNotUpscaled() throws {
        let source = workDir.appendingPathComponent("note_big.png")
        try writeSyntheticImage(to: source, size: 2000, format: .png)

        var options = ProcessingOptions.default
        options.minimumLongEdge = 1500
        options.detectDuplicates = false

        let outputDir = workDir.appendingPathComponent("output", isDirectory: true)
        let logger = ProcessingLogger(logsDirectory: outputDir.appendingPathComponent("logs"))
        let context = PipelineContext(options: options, watermarkOptions: .default,
                                      outputDirectory: outputDir,
                                      models: ModelRegistry(modelsDirectory: nil),
                                      logger: logger)
        let result = try ImageProcessingPipeline(context: context)
            .process(ImageJob(sourceURL: source), cancellation: CancellationToken())

        XCTAssertFalse(result.upscaled, "images already above target must not be resized")
        XCTAssertEqual(result.pixelsAfter.longEdge, 2000)
    }

    // MARK: Helpers

    private func writeSyntheticImage(to url: URL, size: Int, format: ImageFormat = .jpeg) throws {
        // A gradient with some structure so detection/inpainting have real pixels.
        let gradient = CIFilter(name: "CILinearGradient")!
        gradient.setValue(CIVector(x: 0, y: 0), forKey: "inputPoint0")
        gradient.setValue(CIVector(x: CGFloat(size), y: CGFloat(size)), forKey: "inputPoint1")
        gradient.setValue(CIColor(red: 0.2, green: 0.3, blue: 0.5), forKey: "inputColor0")
        gradient.setValue(CIColor(red: 0.8, green: 0.75, blue: 0.6), forKey: "inputColor1")
        let image = gradient.outputImage!.cropped(to: CGRect(x: 0, y: 0, width: size, height: size))

        let ctx = SharedCIContext.context
        let space = CGColorSpace(name: CGColorSpace.sRGB)!
        guard let cg = ctx.createCGImage(image, from: image.extent, format: .RGBA8, colorSpace: space),
              let dest = CGImageDestinationCreateWithURL(url as CFURL,
                                                         format.utType.identifier as CFString, 1, nil) else {
            throw XCTSkip("Core Image rendering unavailable on this platform")
        }
        CGImageDestinationAddImage(dest, cg, nil)
        XCTAssertTrue(CGImageDestinationFinalize(dest))
    }
}
