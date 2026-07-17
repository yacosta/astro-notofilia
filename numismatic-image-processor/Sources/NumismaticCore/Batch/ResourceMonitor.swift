import Foundation
#if canImport(Darwin)
import Darwin
#endif

/// Reports machine capabilities and live utilisation so the batch processor can
/// size its concurrency and the UI can show CPU/GPU usage (spec "Performance"
/// and the Progress window). Designed never to exceed available memory: the
/// recommended worker count is derived from both core count and free RAM,
/// because 6000px+ intermediate images are memory-hungry.
public final class ResourceMonitor: @unchecked Sendable {
    public init() {}

    public var activeProcessorCount: Int { ProcessInfo.processInfo.activeProcessorCount }
    public var physicalMemory: UInt64 { ProcessInfo.processInfo.physicalMemory }
    public var isMetalAvailable: Bool { MetalDeviceProvider.isMetalAvailable }
    public var gpuName: String { MetalDeviceProvider.deviceName }

    /// Estimated peak RAM per concurrent image at the given target long edge.
    /// A worst-case RGBA16 buffer at NxN plus working copies ≈ 8 bytes/px × ~3.
    public func estimatedBytesPerImage(longEdge: Int) -> UInt64 {
        let pixels = UInt64(longEdge) * UInt64(longEdge)
        return pixels * 8 * 3
    }

    /// Recommended number of concurrent workers, bounded by cores and by a
    /// memory budget (default: use at most ~60% of physical RAM for image work).
    public func recommendedConcurrency(minimumLongEdge: Int, memoryFraction: Double = 0.6) -> Int {
        let byCores = max(1, activeProcessorCount - 1)
        let budget = Double(physicalMemory) * memoryFraction
        let perImage = Double(estimatedBytesPerImage(longEdge: minimumLongEdge))
        let byMemory = max(1, Int(budget / max(perImage, 1)))
        return max(1, min(byCores, byMemory))
    }

    // MARK: Live CPU usage (0…1 across all cores)

    private var previousCPUTicks: (used: UInt64, total: UInt64)?

    public func currentCPUUsage() -> Double {
        #if canImport(Darwin)
        var count = mach_msg_type_number_t(HOST_CPU_LOAD_INFO_COUNT)
        var info = host_cpu_load_info_data_t()
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, $0, &count)
            }
        }
        guard result == KERN_SUCCESS else { return 0 }
        let user = UInt64(info.cpu_ticks.0)
        let system = UInt64(info.cpu_ticks.1)
        let idle = UInt64(info.cpu_ticks.2)
        let nice = UInt64(info.cpu_ticks.3)
        let used = user + system + nice
        let total = used + idle
        defer { previousCPUTicks = (used, total) }
        guard let previous = previousCPUTicks else { return 0 }
        let deltaUsed = Double(used &- previous.used)
        let deltaTotal = Double(total &- previous.total)
        guard deltaTotal > 0 else { return 0 }
        return min(1, max(0, deltaUsed / deltaTotal))
        #else
        return 0
        #endif
    }

    public func snapshot() -> String {
        let ramGB = Double(physicalMemory) / 1_073_741_824
        return String(format: "%d cores · %.0f GB RAM · GPU: %@",
                      activeProcessorCount, ramGB, gpuName)
    }
}
