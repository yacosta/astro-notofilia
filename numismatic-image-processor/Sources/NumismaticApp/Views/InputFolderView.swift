import SwiftUI
import NumismaticCore

/// "Input Folder" section: choose a folder and show image count, supported
/// formats present, and total size.
struct InputFolderView: View {
    @EnvironmentObject private var model: AppViewModel

    var body: some View {
        GroupBox("Input Folder") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Button("Choose Folder…") { model.chooseInputFolder() }
                    Spacer()
                    if model.inputFolder != nil {
                        Button {
                            model.scanInputFolder()
                        } label: { Image(systemName: "arrow.clockwise") }
                        .help("Rescan folder")
                    }
                }

                if let folder = model.inputFolder {
                    Text(folder.path)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                        .truncationMode(.middle)

                    let s = model.inputSummary
                    LabeledContent("Images", value: "\(s.count)")
                    LabeledContent("Formats", value: s.formats.isEmpty ? "—" : s.formatList)
                    LabeledContent("Total size", value: s.humanSize)
                } else {
                    Text("Drop a folder here or click Choose Folder.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(6)
        }
    }
}
