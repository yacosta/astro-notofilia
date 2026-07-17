import SwiftUI
import NumismaticCore

/// "Processing Options" section — the checkboxes from the spec plus the
/// duplicate-handling policy and output format.
struct ProcessingOptionsView: View {
    @EnvironmentObject private var model: AppViewModel

    var body: some View {
        GroupBox("Processing Options") {
            VStack(alignment: .leading, spacing: 6) {
                Toggle("Remove existing watermark", isOn: $model.options.removeExistingWatermark)
                Toggle("AI watermark detection", isOn: $model.options.aiWatermarkDetection)
                Toggle("Remove logos", isOn: $model.options.removeLogos)
                Toggle("Upscale to \(model.options.minimumLongEdge)+", isOn: $model.options.upscaleToMinimum)
                Toggle("Preserve aspect ratio", isOn: $model.options.preserveAspectRatio)
                Toggle("Apply new watermark", isOn: $model.options.applyNewWatermark)
                Toggle("Light color correction", isOn: $model.options.lightColorCorrection)

                Divider().padding(.vertical, 4)

                Stepper(value: $model.options.minimumLongEdge, in: 2000...12000, step: 500) {
                    Text("Minimum long edge: \(model.options.minimumLongEdge)px")
                }

                Picker("Output format", selection: $model.options.outputFormat) {
                    Text("Keep original").tag(ImageFormat?.none)
                    ForEach(ImageFormat.exportable, id: \.self) { fmt in
                        Text(fmt.rawValue.uppercased()).tag(ImageFormat?.some(fmt))
                    }
                }

                if model.options.outputFormat == .jpeg || model.options.outputFormat == nil {
                    HStack {
                        Text("JPEG quality")
                        Slider(value: $model.options.jpegQuality, in: 0.5...1.0)
                        Text("\(Int(model.options.jpegQuality * 100))%")
                            .monospacedDigit().frame(width: 44, alignment: .trailing)
                    }
                }

                Divider().padding(.vertical, 4)

                Toggle("Detect duplicates", isOn: $model.options.detectDuplicates)
                if model.options.detectDuplicates {
                    Picker("On duplicate", selection: $model.options.duplicateHandling) {
                        Text("Skip").tag(DuplicateHandling.skip)
                        Text("Copy to /duplicates").tag(DuplicateHandling.move)
                        Text("Process anyway").tag(DuplicateHandling.none)
                    }
                    .pickerStyle(.radioGroup)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(6)
        }
    }
}
