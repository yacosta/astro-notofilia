# Architecture

## Goals

- **Archival quality**: work in a wide linear colour space, never downscale an
  original, encode with high-fidelity settings, and keep colour profiles.
- **On-device only**: everything uses Apple frameworks (Core Image, Vision,
  CoreML, Metal / MPS). No network calls.
- **Testable engine**: all image logic lives in `NumismaticCore`, a library
  target with zero SwiftUI/AppKit dependencies in its core paths, so it can be
  unit-tested and reused (CLI, automation, future services).
- **Extensible**: new processing steps are added as plugins; new AI models are
  dropped in as files.

## MVVM layering

```
┌────────────────────────────────────────────────┐
│ NumismaticApp (SwiftUI)                         │
│   Views  ──observe──▶  ViewModels (@MainActor)  │
│                          │ drive                │
├──────────────────────────┼─────────────────────┤
│ NumismaticCore (engine)  ▼                      │
│   BatchProcessor ─▶ ImageProcessingPipeline     │
│                        └▶ Processing stages      │
│   ModelRegistry ─▶ SuperResolution / Inpainting │
│   DuplicateDetector, ResourceMonitor, Logger    │
└────────────────────────────────────────────────┘
```

- **Views** are declarative and stateless beyond local UI state; they read from
  and bind to view models.
- **ViewModels** (`AppViewModel`, `PreviewViewModel`) are `@MainActor`
  `ObservableObject`s. They own user selections, translate them into engine
  types, drive the `BatchProcessor`, and republish its callbacks on the main
  actor.
- **Engine** types are plain Swift and thread-safe where shared. They know
  nothing about SwiftUI.

## The seven-step pipeline

`ImageProcessingPipeline.process(_:)` runs each image through, in order
(weights drive the progress bar):

| Step | Stage | Implementation | Fallback ⇄ AI |
|------|-------|----------------|----------------|
| 1 | Load | `ImageLoader` — ImageIO, honours EXIF orientation, keeps ICC profile | — |
| 2 | Detect watermark | `WatermarkDetector` — Vision OCR (keyword-filtered) + edge/contrast mask | — |
| 3 | Remove watermark | `WatermarkRemover` → `InpaintingModel` | Content-aware fill ⇄ CoreML LaMa/MAT |
| 4 | Upscale | `Upscaler` → `SuperResolutionModel` | Lanczos+unsharp ⇄ Real-ESRGAN/SwinIR |
| 5 | Colour correct | `ColorCorrector` — minor contrast/clarity, denoise, halo-safe sharpen | — |
| — | Plugins | `PluginRegistry.runAll` | user-registered |
| 6 | Apply watermark | `WatermarkApplicator` — Core Text, proportional scaling, thin shadow | — |
| 7 | Export | `ImageExporter` — per-format archival settings | — |

Every step checks a `CancellationToken` first, so pause/cancel is responsive and
memory is released promptly.

### Colour management

The shared `CIContext` (`SharedCIContext`) uses an **extended-linear sRGB**
working space with high-quality downsampling. The source's embedded colour
space is carried through `ImageLoader` and re-applied at export time by
`ImageExporter`, so tones are preserved end-to-end.

## AI model abstraction

`SuperResolutionModel` and `InpaintingModel` are protocols. `ModelRegistry`
resolves the best implementation at runtime:

1. If a compiled CoreML model exists in `Models/`, wrap it
   (`CoreMLSuperResolutionModel` / `CoreMLInpaintingModel`). Feature names are
   auto-detected from the model description, so Real-ESRGAN, SwinIR and Apple SR
   models all work through the same wrapper.
2. Otherwise use the always-available non-ML fallback
   (`LanczosSuperResolutionModel` / `PatchMatchInpaintingModel`).

The pipeline is oblivious to which one it gets. This keeps model selection in
one place and makes the app fully functional before any model is added.

## Concurrency & memory

`BatchProcessor` uses an `OperationQueue`. Its
`maxConcurrentOperationCount` is chosen by `ResourceMonitor`, which bounds
concurrency by **both** core count *and* a RAM budget — a 6000px RGBA16
intermediate is ~288 MB, so the worker count is capped so total working set
stays within ~60% of physical memory. This satisfies "never exceed available
memory."

- Per-image failures are isolated: one image throwing is logged and the batch
  continues; the row exposes a **Retry** button.
- `CancellationToken` provides cooperative pause (workers block at the next
  checkpoint) and cancel (checkpoints throw).
- The shared, Metal-backed `CIContext` is reused across all workers (creating
  one per image is expensive and it is safe for concurrent rendering).

## Duplicate detection

`PerceptualHasher` computes an **average hash** and a **difference hash**
(64-bit each) from tiny grayscale thumbnails. `DuplicateDetector` compares the
combined Hamming distance against thresholds: ≤6 = exact/recompressed/resized,
≤12 = near-duplicate. The first member of a duplicate group stays canonical, so
processing always yields at least one output per group. Policy (skip / copy to
`/duplicates` / process anyway) is user-selectable.

## Plugin architecture

Any type conforming to `ProcessorPlugin` and registered with a `PluginRegistry`
runs between colour-correction and watermarking. This is the seam for the
roadmap features — background removal, auto-crop, coin centering, scratch
removal, colour restoration, metadata editing, AI captioning — with **no change
to the core pipeline**. A failing plugin is logged and skipped so it can never
fail an image.

## Logging & reports

- `ProcessingLogger` writes `processing.log` (and mirrors to the unified system
  log) thread-safely.
- `ReportWriter` emits `report.csv` and `report.json` with, per image:
  filename, resolution before/after, watermark-removed, duplicate status,
  export time and errors. A `duplicates.json` report is written by the pre-pass.

## Folder structure produced per run

```
<output>/
  <preserved-filenames>.<ext>   ← processed images
  duplicates/                   ← copies of duplicates (when policy = move)
  logs/
    processing.log
    report.csv
    report.json
    duplicates.json
```

## Testing strategy

- **Unit tests** cover pure logic: perceptual-hash distance, duplicate
  classification, format resolution, option defaults and Codable round-trips.
- **Integration tests** synthesise an image on disk and run the whole pipeline,
  asserting the output is written with the preserved filename, is upscaled to
  the target (and *not* upscaled when already large), and the original is never
  touched.
