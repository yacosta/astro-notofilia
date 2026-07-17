import SwiftUI
import UniformTypeIdentifiers
import NumismaticCore

/// Root layout: a scrollable configuration sidebar on the left (folders,
/// options, watermark) and the batch queue + progress on the right, with the
/// preview accessible from any selected job.
struct ContentView: View {
    @EnvironmentObject private var model: AppViewModel
    @State private var showPreview = false
    @State private var selectedJobID: ImageJob.ID?

    var body: some View {
        NavigationSplitView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    InputFolderView()
                    OutputFolderView()
                    ProcessingOptionsView()
                    WatermarkOptionsView()
                }
                .padding()
            }
            .navigationSplitViewColumnWidth(min: 340, ideal: 380, max: 460)
        } detail: {
            VStack(spacing: 0) {
                ProcessingProgressView()
                Divider()
                BatchQueueView(selectedJobID: $selectedJobID, onPreview: { showPreview = true })
            }
        }
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                runControls
            }
        }
        .sheet(isPresented: $showPreview) {
            if let id = selectedJobID, let job = model.jobs.first(where: { $0.id == id }) {
                PreviewView(job: job).environmentObject(model)
            }
        }
        // Drag-and-drop a folder anywhere on the window.
        .onDrop(of: [.fileURL], isTargeted: nil) { providers in
            handleDrop(providers)
        }
    }

    @ViewBuilder private var runControls: some View {
        if model.isRunning {
            Button(model.isPaused ? "Resume" : "Pause") {
                model.isPaused ? model.resume() : model.pause()
            }
            Button("Cancel", role: .destructive) { model.cancel() }
        } else {
            Button {
                model.run()
            } label: {
                Label("Run", systemImage: "play.fill")
            }
            .disabled(model.jobs.isEmpty || model.outputFolder == nil)
            .keyboardShortcut("r", modifiers: .command)
        }
    }

    private func handleDrop(_ providers: [NSItemProvider]) -> Bool {
        guard let provider = providers.first else { return false }
        _ = provider.loadObject(ofClass: URL.self) { url, _ in
            if let url { Task { @MainActor in model.acceptDropped(url: url) } }
        }
        return true
    }
}
