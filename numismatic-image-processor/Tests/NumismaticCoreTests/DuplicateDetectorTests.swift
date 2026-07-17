import XCTest
@testable import NumismaticCore

final class DuplicateDetectorTests: XCTestCase {
    func testFirstImageIsUnique() {
        let detector = DuplicateDetector()
        let h = PerceptualHashes(average: 1, difference: 1)
        XCTAssertNil(detector.register(id: UUID(), filename: "a.jpg", hashes: h))
    }

    func testIdenticalSecondImageIsExactDuplicate() {
        let detector = DuplicateDetector()
        let h = PerceptualHashes(average: 42, difference: 42)
        let first = UUID()
        _ = detector.register(id: first, filename: "a.jpg", hashes: h)
        let match = detector.register(id: UUID(), filename: "b.jpg", hashes: h)
        XCTAssertNotNil(match)
        XCTAssertEqual(match?.originalID, first)
        XCTAssertTrue(match?.isExact ?? false)
        XCTAssertEqual(match?.distance, 0)
    }

    func testNearDuplicateWithinThreshold() {
        let detector = DuplicateDetector(exactThreshold: 6, nearThreshold: 12)
        let base = PerceptualHashes(average: 0x0, difference: 0x0)
        // 8 bits different total → beyond exact (6) but within near (12).
        let near = PerceptualHashes(average: 0xF, difference: 0xF)
        _ = detector.register(id: UUID(), filename: "a.jpg", hashes: base)
        let match = detector.register(id: UUID(), filename: "b.jpg", hashes: near)
        XCTAssertNotNil(match)
        XCTAssertFalse(match?.isExact ?? true)
    }

    func testDistinctImageIsNotADuplicate() {
        let detector = DuplicateDetector(nearThreshold: 12)
        _ = detector.register(id: UUID(), filename: "a.jpg",
                              hashes: PerceptualHashes(average: 0x0, difference: 0x0))
        let far = PerceptualHashes(average: 0xFFFF_FFFF, difference: 0xFFFF_FFFF) // 64 bits
        XCTAssertNil(detector.register(id: UUID(), filename: "b.jpg", hashes: far))
    }

    func testDuplicatesDoNotBecomeCanonical() {
        // A duplicate of the first image must not shadow later comparisons.
        let detector = DuplicateDetector()
        let h = PerceptualHashes(average: 100, difference: 100)
        let firstID = UUID()
        _ = detector.register(id: firstID, filename: "first.jpg", hashes: h)
        let second = detector.register(id: UUID(), filename: "second.jpg", hashes: h)
        let third = detector.register(id: UUID(), filename: "third.jpg", hashes: h)
        XCTAssertEqual(second?.originalFilename, "first.jpg")
        XCTAssertEqual(third?.originalFilename, "first.jpg")
    }
}
