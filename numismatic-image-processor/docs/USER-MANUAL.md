# User Manual — NOTOFILIA Image Processor

## What it does

Prepares your collectible images for publication: it removes old watermarks,
enlarges each image to publication resolution (6000px+), stamps the official
`COLECCIÓN VIRTUAL - NOTOFILIA.COM` watermark, and saves the results to a
separate folder — **your originals are never changed.**

## 1. Choose your folders

- **Input Folder** — click *Choose Folder…* (or drag a folder onto the window).
  The app shows how many images it found, which formats are present, and the
  total size.
- **Output Folder** — where finished images are written. Leave *Create
  automatically if missing* on and the folder will be made for you.

Supported inputs: JPG, JPEG, PNG, TIFF, HEIC, BMP, WEBP.
Outputs: JPEG, PNG, TIFF, HEIC.

## 2. Set processing options

| Option | What it does |
|--------|--------------|
| Remove existing watermark | Finds and erases an old watermark, rebuilding the background. |
| AI watermark detection | Also looks for faint/graphic marks, not just text. |
| Remove logos | Treats logos like watermarks for removal. |
| Upscale to 6000+ | Enlarges to at least this many pixels on the long edge. Images already larger are left as-is. |
| Preserve aspect ratio | Keeps the original proportions (recommended). |
| Apply new watermark | Stamps the NOTOFILIA watermark. |
| Light color correction | Very gentle contrast/clarity — appearance is preserved. |
| Detect duplicates | Finds duplicate/near-duplicate images and applies your chosen policy. |

**Minimum long edge** and **output format / JPEG quality** are adjustable.
**On duplicate** lets you *Skip*, *Copy to /duplicates*, or *Process anyway*.

## 3. Customise the watermark

Edit the text, pick a font and placement (Bottom Right by default), and use the
sliders for opacity, size and margin. A small live preview shows how it reads.
Everything scales proportionally, so the mark looks consistent at any output
size.

## 4. Preview one image (optional)

Select a row in the Batch Queue and press **Space** (or the *Preview* button).
You'll see the four stages — **Original → Watermark Removed → Upscaled → Final
Image** — and can zoom up to 400% to inspect detail before running the batch.

## 5. Run

Press **⌘R** (or the *Run* button). Watch progress in real time:

- **Overall Progress** with images completed / remaining.
- **Batch Queue** — per-image status, progress, elapsed and estimated remaining
  time. If an image fails, it continues with the rest and you get a **Retry**
  button on that row.
- **CPU / GPU** usage indicators.

Controls: **⌘P** pause/resume, **⌘.** cancel.

## 6. Find your results

Everything lands in your output folder, with the **original filenames
preserved**:

```
output/
  <your-filenames>            ← finished images
  duplicates/                 ← duplicate copies (if you chose that policy)
  logs/
    processing.log            ← detailed run log
    report.csv                ← spreadsheet-friendly summary
    report.json               ← machine-readable summary
    duplicates.json           ← duplicate detection report
```

The CSV/JSON reports list, for each image: filename, resolution before/after,
whether a watermark was removed, duplicate status, export time and any errors.

## Tips

- The app remembers your last folders and settings between launches.
- For the sharpest possible enlargements, install the optional AI upscaling
  model (see BUILD.md) — the app uses it automatically when present, shown in
  the status line at the bottom of the window.
- Processing is fully local; you can run it with no internet connection.
