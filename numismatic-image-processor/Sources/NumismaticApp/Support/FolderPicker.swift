import Foundation
#if canImport(AppKit)
import AppKit
#endif

/// Thin wrapper around `NSOpenPanel` for choosing folders. Kept out of the view
/// models so they stay testable and AppKit-free.
public enum FolderPicker {
    #if canImport(AppKit)
    @MainActor
    public static func chooseFolder(title: String) -> URL? {
        let panel = NSOpenPanel()
        panel.title = title
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.canCreateDirectories = true
        return panel.runModal() == .OK ? panel.url : nil
    }
    #else
    public static func chooseFolder(title: String) -> URL? { nil }
    #endif
}
