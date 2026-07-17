# Building, packaging & adding AI models

## Prerequisites

- macOS 13 (Ventura) or later — Apple Silicon or Intel.
- Xcode 15 or later (includes Swift 5.9+).
- Command Line Tools: `xcode-select --install`.

## Build & run

```bash
# Debug run from the command line
swift run NumismaticProcessor

# Release build
swift build -c release
.build/release/NumismaticProcessor

# Open in Xcode (recommended for UI work, entitlements, signing)
open Package.swift
```

## Tests

```bash
swift test                 # all engine unit + integration tests
swift test --filter PipelineIntegrationTests
```

The integration tests render real images with Core Image, so they require
macOS. On other platforms those tests `XCTSkip` themselves.

## Adding the AI models (optional, drop-in)

The app runs fully without any model using high-quality non-ML fallbacks. To
enable Real-ESRGAN / SwinIR upscaling and CoreML inpainting:

1. Obtain or convert the models to **compiled** CoreML format:
   - Convert a PyTorch/ONNX model with `coremltools` on macOS, producing a
     `.mlpackage`, then compile it:
     ```bash
     xcrun coremlcompiler compile SuperResolution.mlpackage Models/
     xcrun coremlcompiler compile Inpainting.mlpackage Models/
     ```
   - This yields `Models/SuperResolution.mlmodelc` and
     `Models/Inpainting.mlmodelc`.
2. Place the compiled `.mlmodelc` bundles in a `Models/` directory **next to the
   built executable / inside the app bundle's Resources**.
3. Relaunch. `ModelRegistry` detects them automatically — no code change. The
   status line at the bottom of the window shows which engines are active.

Expected model I/O (auto-detected from the model description):

| Model | Inputs | Output |
|-------|--------|--------|
| Super-resolution | one image input | one (larger) image output |
| Inpainting | image input + a `mask` image input | reconstructed image output |

Set the super-resolution model's `nativeScaleFactor` in
`ModelRegistry.superResolution()` if your model is not ×4 (the wrapper chains
passes to reach the required factor and trims any overshoot).

> Model weights are **not** committed (`.gitignore` excludes `Models/*.mlmodelc`
> etc.) because they are large binaries; distribute them alongside releases.

## Packaging a signed app + `.dmg`

For distribution, create an Xcode app target (or use `swift build` output inside
a bundle) and then:

```bash
# 1. Sign (Developer ID Application certificate required)
codesign --deep --force --options runtime \
  --sign "Developer ID Application: <YOUR NAME> (<TEAMID>)" \
  NumismaticProcessor.app

# 2. Build a DMG
hdiutil create -volname "NOTOFILIA Image Processor" \
  -srcfolder NumismaticProcessor.app -ov -format UDZO \
  NotofiliaImageProcessor.dmg

# 3. Notarize
xcrun notarytool submit NotofiliaImageProcessor.dmg \
  --apple-id "<APPLE_ID>" --team-id "<TEAMID>" --wait
xcrun stapler staple NotofiliaImageProcessor.dmg
```

## App entitlements / sandbox

If shipping through the App Store or with the hardened runtime, add an
entitlements file with:

- `com.apple.security.app-sandbox` = YES
- `com.apple.security.files.user-selected.read-write` = YES (folder access)

`Preferences` already stores **security-scoped bookmarks** for the chosen input
and output folders so access survives relaunch under the sandbox.
