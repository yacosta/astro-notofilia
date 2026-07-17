import Foundation

/// Persisted user settings (spec "Preferences"): last folders, watermark and
/// processing options, window size, export/compression settings, recent
/// projects. Backed by `UserDefaults` with Codable blobs so the whole options
/// struct round-trips in one key.
public final class Preferences: @unchecked Sendable {
    private let defaults: UserDefaults
    private enum Key {
        static let inputFolder = "inputFolderBookmark"
        static let outputFolder = "outputFolderBookmark"
        static let processingOptions = "processingOptions"
        static let watermarkOptions = "watermarkOptions"
        static let windowSize = "windowSize"
        static let recentProjects = "recentProjects"
    }

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    // MARK: Options (Codable blobs)

    public var processingOptions: ProcessingOptions {
        get { decode(Key.processingOptions) ?? .default }
        set { encode(newValue, Key.processingOptions) }
    }

    public var watermarkOptions: WatermarkOptions {
        get { decode(Key.watermarkOptions) ?? .default }
        set { encode(newValue, Key.watermarkOptions) }
    }

    // MARK: Security-scoped folder bookmarks
    // Sandboxed macOS apps must store *bookmarks*, not raw paths, to retain
    // access to user-chosen folders across launches.

    public func saveInputFolder(_ url: URL) { saveBookmark(url, Key.inputFolder) }
    public func saveOutputFolder(_ url: URL) { saveBookmark(url, Key.outputFolder) }
    public func lastInputFolder() -> URL? { resolveBookmark(Key.inputFolder) }
    public func lastOutputFolder() -> URL? { resolveBookmark(Key.outputFolder) }

    // MARK: Window size

    public var windowSize: CGSize? {
        get {
            guard let arr = defaults.array(forKey: Key.windowSize) as? [Double], arr.count == 2 else { return nil }
            return CGSize(width: arr[0], height: arr[1])
        }
        set {
            if let s = newValue { defaults.set([Double(s.width), Double(s.height)], forKey: Key.windowSize) }
        }
    }

    // MARK: Recent projects (paths)

    public var recentProjects: [String] {
        get { defaults.stringArray(forKey: Key.recentProjects) ?? [] }
        set { defaults.set(Array(newValue.prefix(10)), forKey: Key.recentProjects) }
    }

    public func addRecentProject(_ path: String) {
        var list = recentProjects.filter { $0 != path }
        list.insert(path, at: 0)
        recentProjects = list
    }

    // MARK: Helpers

    private func encode<T: Encodable>(_ value: T, _ key: String) {
        if let data = try? JSONEncoder().encode(value) { defaults.set(data, forKey: key) }
    }
    private func decode<T: Decodable>(_ key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
    private func saveBookmark(_ url: URL, _ key: String) {
        #if os(macOS)
        if let data = try? url.bookmarkData(options: .withSecurityScope,
                                            includingResourceValuesForKeys: nil,
                                            relativeTo: nil) {
            defaults.set(data, forKey: key)
        }
        #else
        defaults.set(url.path, forKey: key)
        #endif
    }
    private func resolveBookmark(_ key: String) -> URL? {
        #if os(macOS)
        guard let data = defaults.data(forKey: key) else { return nil }
        var stale = false
        return try? URL(resolvingBookmarkData: data,
                        options: .withSecurityScope,
                        relativeTo: nil,
                        bookmarkDataIsStale: &stale)
        #else
        return defaults.string(forKey: key).map { URL(fileURLWithPath: $0) }
        #endif
    }
}
