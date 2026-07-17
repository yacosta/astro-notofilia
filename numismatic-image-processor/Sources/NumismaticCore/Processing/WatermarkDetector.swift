import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
#if canImport(Vision)
import Vision
#endif

/// The outcome of watermark/logo detection: whether anything was found and a
/// mask (white = suspected watermark) covering the affected pixels.
public struct WatermarkDetection: Sendable {
    public var found: Bool
    /// Mask image at the same extent as the source (white = remove).
    public var mask: CIImage?
    /// Human-readable regions detected, for logging.
    public var regions: [String]

    public static let none = WatermarkDetection(found: false, mask: nil, regions: [])
}

/// Detects existing watermarks and logos using a combination of techniques
/// (spec Step 2): Vision text recognition (OCR), plus edge/contrast analysis to
/// catch semi-transparent graphic marks that OCR misses. Produces a mask the
/// `WatermarkRemover` then reconstructs.
public struct WatermarkDetector {
    public var useOCR: Bool
    public var useEdgeContrast: Bool
    /// Words that strongly indicate a watermark when found by OCR.
    public var watermarkKeywords: [String]

    public init(useOCR: Bool = true,
                useEdgeContrast: Bool = true,
                watermarkKeywords: [String] = ["watermark", "copyright", "©", "sample",
                                               "muestra", "colección", "coleccion",
                                               "www", ".com", "all rights"]) {
        self.useOCR = useOCR
        self.useEdgeContrast = useEdgeContrast
        self.watermarkKeywords = watermarkKeywords.map { $0.lowercased() }
    }

    public func detect(in image: CIImage, aiEnabled: Bool) -> WatermarkDetection {
        var regions: [String] = []
        var masks: [CIImage] = []

        #if canImport(Vision)
        if useOCR {
            let (ocrMask, ocrRegions) = detectText(in: image)
            if let ocrMask { masks.append(ocrMask); regions.append(contentsOf: ocrRegions) }
        }
        #endif

        if useEdgeContrast && aiEnabled {
            if let mask = detectSemiTransparentMark(in: image) {
                masks.append(mask)
                regions.append("low-contrast graphic mark")
            }
        }

        guard !masks.isEmpty else { return .none }
        let combined = masks.dropFirst().reduce(masks[0]) { partial, next in
            let f = CIFilter.additionCompositing()
            f.inputImage = next
            f.backgroundImage = partial
            return f.outputImage ?? partial
        }
        return WatermarkDetection(found: true,
                                  mask: combined.cropped(to: image.extent),
                                  regions: regions)
    }

    // MARK: OCR-based text detection

    #if canImport(Vision)
    private func detectText(in image: CIImage) -> (CIImage?, [String]) {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false

        let handler = VNImageRequestHandler(ciImage: image, options: [:])
        try? handler.perform([request])
        guard let observations = request.results, !observations.isEmpty else { return (nil, []) }

        var regions: [String] = []
        var boxes: [CGRect] = []
        let extent = image.extent

        for obs in observations {
            guard let candidate = obs.topCandidates(1).first else { continue }
            let text = candidate.string.lowercased()
            // Flag only text that reads like a watermark, not legitimate legend
            // text printed on the coin/note itself.
            let isWatermark = watermarkKeywords.contains { text.contains($0) }
            guard isWatermark else { continue }

            // Vision boxes are normalised with origin at bottom-left.
            let n = obs.boundingBox
            let rect = CGRect(x: extent.origin.x + n.origin.x * extent.width,
                              y: extent.origin.y + n.origin.y * extent.height,
                              width: n.width * extent.width,
                              height: n.height * extent.height)
                .insetBy(dx: -n.width * extent.width * 0.15,
                         dy: -n.height * extent.height * 0.35)
            boxes.append(rect)
            regions.append("text \"\(candidate.string)\"")
        }
        guard !boxes.isEmpty else { return (nil, []) }
        return (maskImage(for: boxes, extent: extent), regions)
    }
    #endif

    // MARK: Edge/contrast detection for graphic marks

    /// Finds low-contrast repeating/graphic marks (e.g. a translucent logo) by
    /// isolating mid-frequency structure that differs from the local background.
    /// Returns a soft mask, or nil if nothing significant is found.
    private func detectSemiTransparentMark(in image: CIImage) -> CIImage? {
        let mono = CIFilter.colorControls()
        mono.inputImage = image
        mono.saturation = 0
        guard let gray = mono.outputImage else { return nil }

        let edges = CIFilter.edges()
        edges.inputImage = gray
        edges.intensity = 4
        guard let edgeImg = edges.outputImage else { return nil }

        // Threshold + dilate to grow thin strokes into a coherent region.
        let threshold = CIFilter.colorThreshold()
        threshold.inputImage = edgeImg
        threshold.threshold = 0.12
        let thresholded = threshold.outputImage ?? edgeImg

        let morph = CIFilter.morphologyMaximum()
        morph.inputImage = thresholded
        morph.radius = 3
        return morph.outputImage?.cropped(to: image.extent)
    }

    // MARK: Mask helpers

    private func maskImage(for boxes: [CGRect], extent: CGRect) -> CIImage {
        // Start from black, paint white rounded rectangles over each box.
        var mask = CIImage(color: CIColor.black).cropped(to: extent)
        for box in boxes {
            let white = CIImage(color: CIColor.white).cropped(to: box.intersection(extent))
            let f = CIFilter.sourceOverCompositing()
            f.inputImage = white
            f.backgroundImage = mask
            mask = f.outputImage ?? mask
        }
        // Feather so the remover blends naturally.
        let blur = CIFilter.gaussianBlur()
        blur.inputImage = mask.clampedToExtent()
        blur.radius = 4
        return (blur.outputImage ?? mask).cropped(to: extent)
    }
}
