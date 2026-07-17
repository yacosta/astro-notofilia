import Foundation

/// Emits the batch's CSV and JSON reports (spec "Logging"). Both capture, per
/// image: filename, resolution before/after, watermark-removed, duplicate
/// status, export time and errors.
public struct ReportWriter {
    public init() {}

    public func writeReports(_ results: [ProcessingResult], to logsDirectory: URL) throws {
        try FileManager.default.createDirectory(at: logsDirectory, withIntermediateDirectories: true)
        try writeCSV(results, to: logsDirectory.appendingPathComponent("report.csv"))
        try writeJSON(results, to: logsDirectory.appendingPathComponent("report.json"))
    }

    // MARK: CSV

    public func writeCSV(_ results: [ProcessingResult], to url: URL) throws {
        var rows = ["filename,resolution_before,resolution_after,watermark_detected,watermark_removed,upscaled,duplicate_status,export_format,bytes,seconds,errors"]
        for r in results {
            let fields = [
                r.filename,
                r.pixelsBefore.description,
                r.pixelsAfter.description,
                String(r.watermarkDetected),
                String(r.watermarkRemoved),
                String(r.upscaled),
                r.duplicateStatus,
                r.exportFormat.rawValue,
                r.byteSize.map(String.init) ?? "",
                String(format: "%.2f", r.processingSeconds),
                r.errors.joined(separator: "; ")
            ].map(csvEscape)
            rows.append(fields.joined(separator: ","))
        }
        try rows.joined(separator: "\n").write(to: url, atomically: true, encoding: .utf8)
    }

    private func csvEscape(_ field: String) -> String {
        guard field.contains(",") || field.contains("\"") || field.contains("\n") else { return field }
        return "\"" + field.replacingOccurrences(of: "\"", with: "\"\"") + "\""
    }

    // MARK: JSON

    public func writeJSON(_ results: [ProcessingResult], to url: URL) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(results)
        try data.write(to: url)
    }
}
