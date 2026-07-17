import Foundation

/// Resolves the best available AI engine for each stage, preferring a bundled
/// CoreML model and gracefully degrading to the built-in non-ML fallback.
///
/// The registry looks for compiled models next to the executable in a `Models`
/// directory (overridable via `modelsDirectory`). This is the single place the
/// rest of the engine asks "what upscaler / inpainter should I use?", which
/// keeps model-selection policy out of the processing stages.
public final class ModelRegistry: @unchecked Sendable {
    public let modelsDirectory: URL?

    public init(modelsDirectory: URL? = ModelRegistry.defaultModelsDirectory) {
        self.modelsDirectory = modelsDirectory
    }

    /// `Models/` alongside the running executable/bundle, if it exists.
    public static var defaultModelsDirectory: URL? {
        let exeDir = Bundle.main.bundleURL.deletingLastPathComponent()
        let candidate = exeDir.appendingPathComponent("Models", isDirectory: true)
        return FileManager.default.fileExists(atPath: candidate.path) ? candidate : nil
    }

    private func modelURL(_ filename: String) -> URL? {
        guard let dir = modelsDirectory else { return nil }
        let url = dir.appendingPathComponent(filename)
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }

    /// Best available super-resolution engine.
    public func superResolution() -> SuperResolutionModel {
        #if canImport(CoreML)
        let coreML = CoreMLSuperResolutionModel(
            modelURL: modelURL("SuperResolution.mlmodelc"),
            name: "Real-ESRGAN / SwinIR (CoreML)",
            nativeScaleFactor: 4
        )
        if coreML.isAvailable { return coreML }
        #endif
        return LanczosSuperResolutionModel()
    }

    /// Best available inpainting engine.
    public func inpainting() -> InpaintingModel {
        #if canImport(CoreML)
        let coreML = CoreMLInpaintingModel(modelURL: modelURL("Inpainting.mlmodelc"))
        if coreML.isAvailable { return coreML }
        #endif
        return PatchMatchInpaintingModel()
    }

    /// Summary for the UI / logs, e.g. "Upscale: Lanczos · Inpaint: Content-Aware".
    public func summary() -> String {
        "Upscale: \(superResolution().name) · Inpaint: \(inpainting().name)"
    }
}
