import SwiftUI
import NumismaticCore

/// "Watermark Options" section: editable text, font, opacity, size, margin and
/// placement, with a small live text preview.
struct WatermarkOptionsView: View {
    @EnvironmentObject private var model: AppViewModel

    // A curated font list; the system font is the default (nil).
    private let fonts: [String?] = [nil, "Helvetica Neue", "Helvetica", "Avenir Next",
                                    "Times New Roman", "Georgia", "Menlo"]

    var body: some View {
        GroupBox("Watermark") {
            VStack(alignment: .leading, spacing: 10) {
                TextField("Watermark text", text: $model.watermark.text, axis: .vertical)
                    .textFieldStyle(.roundedBorder)

                Picker("Font", selection: $model.watermark.fontName) {
                    ForEach(fonts, id: \.self) { font in
                        Text(font ?? "System").tag(font)
                    }
                }

                Picker("Placement", selection: $model.watermark.placement) {
                    ForEach(WatermarkPlacement.allCases) { p in
                        Text(p.displayName).tag(p)
                    }
                }

                slider("Opacity", value: $model.watermark.opacity, range: 0.1...1.0, format: .percent)
                slider("Size", value: $model.watermark.sizeFraction, range: 0.01...0.08, format: .fractionOfEdge)
                slider("Margin", value: $model.watermark.marginFraction, range: 0.0...0.1, format: .fractionOfEdge)

                Toggle("Thin shadow", isOn: $model.watermark.drawShadow)

                // Live approximation of how the mark reads.
                watermarkPreview
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(6)
        }
    }

    private enum SliderFormat { case percent, fractionOfEdge }

    @ViewBuilder
    private func slider(_ label: String, value: Binding<Double>, range: ClosedRange<Double>, format: SliderFormat) -> some View {
        HStack {
            Text(label).frame(width: 60, alignment: .leading)
            Slider(value: value, in: range)
            Text(formatted(value.wrappedValue, format))
                .monospacedDigit().frame(width: 52, alignment: .trailing)
        }
    }

    private func formatted(_ v: Double, _ f: SliderFormat) -> String {
        switch f {
        case .percent: return "\(Int(v * 100))%"
        case .fractionOfEdge: return String(format: "%.1f%%", v * 100)
        }
    }

    private var watermarkPreview: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(LinearGradient(colors: [.gray.opacity(0.5), .gray.opacity(0.2)],
                                     startPoint: .top, endPoint: .bottom))
            Text(model.watermark.text)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.white.opacity(model.watermark.opacity))
                .shadow(color: .black.opacity(model.watermark.drawShadow ? 0.6 : 0), radius: 1, y: 1)
                .padding(6)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: alignment)
        }
        .frame(height: 60)
        .accessibilityHidden(true)
    }

    private var alignment: Alignment {
        switch model.watermark.placement {
        case .bottomRight: return .bottomTrailing
        case .bottomLeft:  return .bottomLeading
        case .topRight:    return .topTrailing
        case .topLeft:     return .topLeading
        case .center:      return .center
        }
    }
}
