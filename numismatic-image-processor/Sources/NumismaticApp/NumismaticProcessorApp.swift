import SwiftUI
import NumismaticCore

/// Application entry point. Wires up the shared `AppViewModel`, the main window
/// and the menu commands that back the keyboard shortcuts (spec "Keyboard
/// Shortcuts": ⌘O open, ⌘R run, ⌘P pause, ⌘. cancel, Space preview).
@main
struct NumismaticProcessorApp: App {
    @StateObject private var model = AppViewModel()

    var body: some Scene {
        Window("NOTOFILIA Image Processor", id: "main") {
            ContentView()
                .environmentObject(model)
                .frame(minWidth: 1080, minHeight: 720)
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Open Folder…") { model.chooseInputFolder() }
                    .keyboardShortcut("o", modifiers: .command)
            }
            CommandMenu("Process") {
                Button("Run") { model.run() }
                    .keyboardShortcut("r", modifiers: .command)
                    .disabled(model.isRunning || model.jobs.isEmpty)
                Button(model.isPaused ? "Resume" : "Pause") {
                    model.isPaused ? model.resume() : model.pause()
                }
                .keyboardShortcut("p", modifiers: .command)
                .disabled(!model.isRunning)
                Button("Cancel") { model.cancel() }
                    .keyboardShortcut(".", modifiers: .command)
                    .disabled(!model.isRunning)
            }
        }
    }
}
