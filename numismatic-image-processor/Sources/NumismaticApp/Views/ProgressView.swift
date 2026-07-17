import SwiftUI
import NumismaticCore

/// "Progress Window" strip: overall progress, current image, CPU/GPU usage,
/// images completed / remaining, and the Cancel / Pause / Resume controls.
/// Named `ProcessingProgressView` to avoid clashing with SwiftUI.ProgressView.
struct ProcessingProgressView: View {
    @EnvironmentObject private var model: AppViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Overall Progress").font(.headline)
                Spacer()
                Text("\(model.completed) / \(model.total)")
                    .monospacedDigit().foregroundStyle(.secondary)
            }

            ProgressView(value: model.overallProgress)

            HStack(spacing: 24) {
                metric("Completed", "\(model.completed)")
                metric("Remaining", "\(max(0, model.total - model.completed))")
                metric("CPU", "\(Int(model.cpuUsage * 100))%")
                metric("GPU", model.resources.isMetalAvailable ? "Metal" : "—")
                Spacer()
                controls
            }

            if !model.statusLine.isEmpty {
                Text(model.statusLine)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
        }
        .padding()
    }

    private func metric(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title3.monospacedDigit())
        }
    }

    @ViewBuilder private var controls: some View {
        if model.isRunning {
            Button(model.isPaused ? "Resume" : "Pause") {
                model.isPaused ? model.resume() : model.pause()
            }
            Button("Cancel", role: .destructive) { model.cancel() }
        } else {
            Button {
                model.run()
            } label: { Label("Run", systemImage: "play.fill") }
            .buttonStyle(.borderedProminent)
            .disabled(model.jobs.isEmpty || model.outputFolder == nil)
        }
    }
}
