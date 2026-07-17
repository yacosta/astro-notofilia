# NOTOFILIA Image Processor

A native **macOS** application that prepares collectible **coin, banknote,
token, medal and exonumia** images for publication on
[NOTOFILIA.COM](https://notofilia.com).

It batch-processes hundreds or thousands of images entirely on-device — no
internet, no cloud — and for every image it:

1. Loads the original (JPEG / PNG / TIFF / HEIC / BMP / WEBP).
2. Detects and removes any existing watermark or logo (Vision + AI inpainting).
3. Upscales to a minimum of **6000px on the long edge** while preserving detail.
4. Applies a light, appearance-preserving finishing pass.
5. Stamps the new `COLECCIÓN VIRTUAL - NOTOFILIA.COM` watermark.
6. Exports to a **separate output folder, preserving the original filename** —
   **originals are never modified**.

It also detects duplicate/near-duplicate images and writes CSV + JSON reports.

---

## Status of this repository

This is a **complete, buildable project scaffold** implementing the full
architecture and pipeline. Every stage works out of the box using Apple's
frameworks:

| Stage | Ships working with | Optional upgrade (drop-in) |
|-------|--------------------|----------------------------|
| Watermark detection | Vision OCR + Core Image edge/contrast analysis | — |
| Watermark removal | Core Image content-aware fill (texture synthesis) | CoreML inpainting model (LaMa/MAT) |
| Upscaling | Lanczos + detail recovery (Metal-accelerated) | Real-ESRGAN / SwinIR CoreML model |
| Everything else | Fully implemented | — |

The AI upgrades are **pure drop-ins**: place a compiled CoreML model in
`Models/` and the app uses it automatically (see [docs/BUILD.md](docs/BUILD.md)).
No code changes required. The weights are **not** committed because they are
large binaries distributed separately.

> Built and structured on Linux CI; **compile, run and test it on macOS** with
> Xcode 15+ / Swift 5.9+. See [docs/BUILD.md](docs/BUILD.md).

---

## Quick start

```bash
# Build & run the app
swift run NumismaticProcessor

# Or open in Xcode
open Package.swift

# Run the engine unit + integration tests (macOS)
swift test
```

Then in the app: **Choose Input Folder → Choose Output Folder → ⌘R to Run.**

## Requirements

- macOS 13 (Ventura) or later — Apple Silicon **and** Intel.
- Xcode 15+ / Swift 5.9+ (for building).
- Metal-capable GPU used automatically when present; falls back to CPU.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘O | Open input folder |
| ⌘R | Run batch |
| ⌘P | Pause / Resume |
| ⌘. | Cancel |
| Space | Preview selected image |

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — module map, MVVM design, the
  seven-step pipeline, plugin system, concurrency & memory model.
- **[docs/BUILD.md](docs/BUILD.md)** — building, packaging a `.dmg`, code
  signing, and adding the CoreML models.
- **[docs/USER-MANUAL.md](docs/USER-MANUAL.md)** — end-user guide.

## Project layout

```
Sources/
  NumismaticCore/     Engine — UI-independent, fully unit-tested
    Models/           Value types (options, jobs, results, formats)
    Pipeline/         The 7-step per-image pipeline
    Processing/       Load, detect, remove, upscale, correct, watermark, export
    AI/               Super-resolution & inpainting engines (+ CoreML wrappers)
    Dedup/            Perceptual hashing & duplicate detection
    Batch/            Concurrent OperationQueue orchestration + resource monitor
    Logging/          processing.log + CSV/JSON reports
    Settings/         Preferences persistence
    Plugins/          Extensible processor plugin architecture
  NumismaticApp/      SwiftUI application (MVVM)
    ViewModels/       AppViewModel, PreviewViewModel
    Views/            Folders, options, watermark, queue, progress, preview
Tests/
  NumismaticCoreTests/  Unit + end-to-end integration tests
docs/                   Architecture, build, and user documentation
```

## Moving this into its own repository

This project is fully self-contained in the `numismatic-image-processor/`
folder. To lift it into a dedicated repo (e.g. `yacosta/numismatic-image-processor`):

```bash
# from the astro-notofilia checkout
cp -R numismatic-image-processor /path/to/numismatic-image-processor
cd /path/to/numismatic-image-processor
git init && git add . && git commit -m "Initial import: NOTOFILIA Image Processor"
git branch -M main
git remote add origin git@github.com:yacosta/numismatic-image-processor.git
git push -u origin main
```

Nothing in the project depends on the Astro site.

## License

[MIT](LICENSE) © 2026 NOTOFILIA.COM
