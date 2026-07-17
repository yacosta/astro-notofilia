import XCTest
@testable import NumismaticCore

final class PerceptualHashTests: XCTestCase {
    func testIdenticalHashesHaveZeroDistance() {
        let a = PerceptualHashes(average: 0xDEAD_BEEF_1234_5678,
                                 difference: 0x0F0F_0F0F_0F0F_0F0F)
        XCTAssertEqual(a.distance(to: a), 0)
    }

    func testDistanceIsSymmetricHammingOverBothHashes() {
        let a = PerceptualHashes(average: 0x0, difference: 0x0)
        let b = PerceptualHashes(average: 0xF, difference: 0x0)   // 4 bits differ
        XCTAssertEqual(a.distance(to: b), 4)
        XCTAssertEqual(b.distance(to: a), 4)
    }

    func testDistanceCombinesAverageAndDifference() {
        let a = PerceptualHashes(average: 0b1010, difference: 0b1100)
        let b = PerceptualHashes(average: 0b1001, difference: 0b0011)
        // average differs in 2 bits, difference differs in 4 bits → 6
        XCTAssertEqual(a.distance(to: b), 6)
    }
}
