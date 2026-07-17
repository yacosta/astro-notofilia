# AI models (optional drop-in)

Place compiled CoreML models here to upgrade the two AI stages. The app works
without them using high-quality non-ML fallbacks; when a model is present,
`ModelRegistry` uses it automatically — no code change required.

| File | Enables | Suggested source |
|------|---------|------------------|
| `SuperResolution.mlmodelc` | Real-ESRGAN / SwinIR / Apple SR upscaling | Convert with `coremltools`, compile with `xcrun coremlcompiler` |
| `Inpainting.mlmodelc` | AI watermark/logo removal (LaMa / MAT) | Convert with `coremltools`, compile with `xcrun coremlcompiler` |

Expected I/O (feature names are auto-detected):

- **SuperResolution** — one image input → one larger image output.
- **Inpainting** — an image input plus a `mask` image input (white = rebuild) →
  reconstructed image output.

See [../docs/BUILD.md](../docs/BUILD.md) for conversion and compilation steps.

> The compiled model bundles are intentionally **not** committed to git (they are
> large binaries). Ship them alongside releases or your app bundle's Resources.
