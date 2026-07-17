import SwiftUI
import NumismaticCore

/// "Output Folder" section: choose the destination and toggle auto-create.
struct OutputFolderView: View {
    @EnvironmentObject private var model: AppViewModel

    var body: some View {
        GroupBox("Output Folder") {
            VStack(alignment: .leading, spacing: 10) {
                Button("Choose Folder…") { model.chooseOutputFolder() }

                if let folder = model.outputFolder {
                    Text(folder.path)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                        .truncationMode(.middle)
                } else {
                    Text("Originals are never modified — output is written here.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }

                Toggle("Create automatically if missing", isOn: $model.createOutputIfMissing)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(6)
        }
    }
}
