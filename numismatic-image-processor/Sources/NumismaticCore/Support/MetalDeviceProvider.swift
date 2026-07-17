import Foundation
#if canImport(Metal)
import Metal
#endif

/// Centralised access to the system's Metal device so every stage that can use
/// the GPU (Core Image rendering, Metal Performance Shaders upscaling, CoreML
/// compute units) shares the same device and its command queue.
///
/// On machines without a usable Metal device (rare, or CI on Linux) every
/// accessor returns `nil` and callers transparently fall back to the CPU path.
public enum MetalDeviceProvider {
    #if canImport(Metal)
    public static let defaultDevice: MTLDevice? = MTLCreateSystemDefaultDevice()

    /// A lazily created command queue on the default device, reused across
    /// stages to avoid the cost of building one per image.
    public static let commandQueue: MTLCommandQueue? = defaultDevice?.makeCommandQueue()

    public static var isMetalAvailable: Bool { defaultDevice != nil }

    public static var deviceName: String { defaultDevice?.name ?? "CPU (no Metal device)" }
    #else
    public static let isMetalAvailable = false
    public static var deviceName: String { "CPU (Metal unavailable on this platform)" }
    #endif
}
