import SwiftUI
import NumismaticCore

/// "Batch Queue": one row per image showing filename, status, progress, elapsed
/// time, an estimate of remaining time, errors and a retry button.
struct BatchQueueView: View {
    @EnvironmentObject private var model: AppViewModel
    @Binding var selectedJobID: ImageJob.ID?
    var onPreview: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            Table(model.jobs, selection: $selectedJobID) {
                TableColumn("File") { job in
                    Text(job.filename).lineLimit(1).truncationMode(.middle)
                }
                TableColumn("Status") { job in StatusBadge(job: job) }
                    .width(140)
                TableColumn("Progress") { job in
                    ProgressView(value: job.progress).frame(width: 90)
                }
                .width(110)
                TableColumn("Elapsed") { job in
                    Text(job.elapsed.map(Self.format) ?? "—").monospacedDigit()
                }
                .width(80)
                TableColumn("Remaining") { job in
                    Text(Self.estimateRemaining(job)).monospacedDigit().foregroundStyle(.secondary)
                }
                .width(90)
                TableColumn("") { job in
                    if job.status == .failed {
                        Button("Retry") { model.retry(job) }.controlSize(.small)
                    }
                }
                .width(60)
            }
            // Re-render rows when jobs mutate in place.
            .id(model.refreshTick)
        }
    }

    private var header: some View {
        HStack {
            Text("Batch Queue").font(.headline)
            Spacer()
            Button {
                onPreview()
            } label: { Label("Preview", systemImage: "eye") }
            .keyboardShortcut(.space, modifiers: [])
            .disabled(selectedJobID == nil)
            .help("Preview the selected image (Space)")
        }
        .padding(8)
    }

    // MARK: Formatting

    static func format(_ t: TimeInterval) -> String {
        let s = Int(t)
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    /// Naive per-job ETA: for a job still processing, scale elapsed by remaining
    /// fraction. Queued jobs show "—".
    static func estimateRemaining(_ job: ImageJob) -> String {
        guard job.status == .processing, job.progress > 0.01, let elapsed = job.elapsed else { return "—" }
        let remaining = elapsed / job.progress - elapsed
        return format(max(0, remaining))
    }
}

private struct StatusBadge: View {
    // ImageJob is a plain class; the surrounding Table refreshes via refreshTick.
    let job: ImageJob

    var body: some View {
        Label(text, systemImage: symbol)
            .foregroundStyle(color)
            .help(job.errorMessage ?? text)
    }

    private var text: String {
        switch job.status {
        case .queued: return "Queued"
        case .processing: return "Processing"
        case .completed: return "Done"
        case .failed: return "Failed"
        case .skippedDuplicate: return "Duplicate"
        case .cancelled: return "Cancelled"
        }
    }
    private var symbol: String {
        switch job.status {
        case .queued: return "clock"
        case .processing: return "gearshape.2"
        case .completed: return "checkmark.circle.fill"
        case .failed: return "exclamationmark.triangle.fill"
        case .skippedDuplicate: return "doc.on.doc"
        case .cancelled: return "xmark.circle"
        }
    }
    private var color: Color {
        switch job.status {
        case .completed: return .green
        case .failed: return .red
        case .processing: return .blue
        case .skippedDuplicate: return .orange
        default: return .secondary
        }
    }
}
