// swift-tools-version:5.9
import PackageDescription

// Numismatic Image Batch Processor
// A native macOS application that prepares collectible coin, banknote, token,
// medal and exonumia images for publication on NOTOFILIA.COM.
//
// The package is split into three targets so that the image-processing engine
// (`NumismaticCore`) is fully testable and decoupled from the SwiftUI user
// interface (`NumismaticApp`).  See docs/ARCHITECTURE.md for the full design.
let package = Package(
    name: "NumismaticImageProcessor",
    platforms: [
        // Apple Silicon + Intel; macOS 13 gives us the SwiftUI App lifecycle,
        // modern Core Image inpainting filters and up-to-date Vision requests.
        .macOS(.v13)
    ],
    products: [
        .library(name: "NumismaticCore", targets: ["NumismaticCore"]),
        .executable(name: "NumismaticProcessor", targets: ["NumismaticApp"])
    ],
    dependencies: [],
    targets: [
        // MARK: Engine (UI-independent, fully unit-testable)
        .target(
            name: "NumismaticCore",
            path: "Sources/NumismaticCore"
        ),
        // MARK: SwiftUI application
        .executableTarget(
            name: "NumismaticApp",
            dependencies: ["NumismaticCore"],
            path: "Sources/NumismaticApp"
        ),
        // MARK: Tests
        .testTarget(
            name: "NumismaticCoreTests",
            dependencies: ["NumismaticCore"],
            path: "Tests/NumismaticCoreTests"
        )
    ]
)
