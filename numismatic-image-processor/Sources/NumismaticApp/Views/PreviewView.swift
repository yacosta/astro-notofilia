import SwiftUI
import NumismaticCore

/// "Preview Window": shows the four pipeline stages for one image with zoom up
/// to 400%. Rendered on demand by `PreviewViewModel`.
struct PreviewView: View {
    @EnvironmentObject private var model: AppViewModel
    @StateObject private var previewModel = PreviewViewModel()
    @Environment(\.dismiss) private var dismiss

    let job: ImageJob
    @State private var stage: PreviewViewModel.Stage = .original
    @State private var zoom: Double = 1.0

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            content
            Divider()
            footer
        }
        .frame(minWidth: 720, minHeight: 560)
        .onAppear {
            previewModel.generate(for: job, options: model.options, watermark: model.watermark)
        }
    }

    private var header: some View {
        HStack {
            Text(job.filename).font(.headline).lineLimit(1).truncationMode(.middle)
            Spacer()
            Button("Done") { dismiss() }.keyboardShortcut(.defaultAction)
        }
        .padding()
    }

    @ViewBuilder private var content: some View {
        if previewModel.isRendering {
            VStack(spacing: 12) {
                ProgressView()
                Text("Rendering preview…").foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if let error = previewModel.error {
            unavailable("Preview unavailable", error)
        } else if let image = previewModel.images[stage] {
            ScrollView([.horizontal, .vertical]) {
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .scaleEffect(zoom)
                    .frame(minWidth: 400, minHeight: 300)
                    .accessibilityLabel("\(stage.rawValue) of \(job.filename)")
            }
            .background(Color(white: 0.12))
        } else {
            unavailable("Stage not available", "This stage was skipped by the current options.")
        }
    }

    /// Simple empty-state (ContentUnavailableView is macOS 14+; we target 13).
    private func unavailable(_ title: String, _ message: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: "photo").font(.system(size: 40)).foregroundStyle(.secondary)
            Text(title).font(.headline)
            Text(message).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    private var footer: some View {
        VStack(spacing: 12) {
            // Stage stepper: Original → Watermark Removed → Upscaled → Final.
            Picker("Stage", selection: $stage) {
                ForEach(PreviewViewModel.Stage.allCases) { s in
                    Text(s.rawValue).tag(s)
                }
            }
            .pickerStyle(.segmented)

            HStack {
                Image(systemName: "minus.magnifyingglass")
                Slider(value: $zoom, in: 0.25...4.0)   // up to 400%
                Image(systemName: "plus.magnifyingglass")
                Text("\(Int(zoom * 100))%").monospacedDigit().frame(width: 52, alignment: .trailing)
            }
        }
        .padding()
    }
}
