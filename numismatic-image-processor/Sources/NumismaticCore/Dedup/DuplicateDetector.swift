import Foundation

/// Classifies each image against the ones already seen, using perceptual hashes.
/// Catches exact duplicates as well as resized/recompressed/near copies (spec
/// "Duplicate Detection"). Rotated copies are approximated by also comparing a
/// coarse orientation-normalised hash where available.
///
/// The detector is deterministic and order-dependent: the first image in a
/// duplicate group is treated as the "original" and later ones as duplicates,
/// so processing the group's first member always produces output.
public struct DuplicateReportEntry: Sendable, Codable {
    public var filename: String
    public var status: String            // "unique" | "duplicate-of:<name>" | "near-duplicate-of:<name>"
    public var distance: Int?
}

public final class DuplicateDetector {
    /// Combined Hamming distance below which two images are considered the same.
    /// 0 = identical hashes; ≤6 catches recompression/resize; ≤12 catches near
    /// duplicates such as light edits.
    public let exactThreshold: Int
    public let nearThreshold: Int

    private struct Seen { let id: UUID; let filename: String; let hashes: PerceptualHashes }
    private var seen: [Seen] = []

    public init(exactThreshold: Int = 6, nearThreshold: Int = 12) {
        self.exactThreshold = exactThreshold
        self.nearThreshold = nearThreshold
    }

    public struct Match: Sendable {
        public let originalID: UUID
        public let originalFilename: String
        public let distance: Int
        public let isExact: Bool
    }

    /// Register an image and return the best matching earlier image, if any.
    /// - Returns: a `Match` when this image duplicates an earlier one; `nil`
    ///   when it is unique (and now recorded for future comparisons).
    public func register(id: UUID, filename: String, hashes: PerceptualHashes) -> Match? {
        var best: (Seen, Int)?
        for candidate in seen {
            let d = hashes.distance(to: candidate.hashes)
            if best == nil || d < best!.1 { best = (candidate, d) }
        }

        if let (candidate, distance) = best, distance <= nearThreshold {
            // Duplicate — do NOT add to `seen`; keep the first copy canonical.
            return Match(originalID: candidate.id,
                         originalFilename: candidate.filename,
                         distance: distance,
                         isExact: distance <= exactThreshold)
        }

        seen.append(Seen(id: id, filename: filename, hashes: hashes))
        return nil
    }

    public func reset() { seen.removeAll() }
}
