# Importing the image assets

This archive contains the full Astro migration **except** `public/uploads/`
(~188 MB of banknote photography, fonts, and PDFs) and the `reference/` folder,
which were omitted to keep the download small. Those files are **byte-identical
to the ones already in your `yacosta/notofilia` repo**, so you re-add them in one
step.

## Steps

1. Unzip this archive and `cd` into it.
2. Copy `uploads/` from your existing static-site repo into `public/`:

   ```bash
   # from inside this project folder, point at your notofilia checkout:
   cp -R /path/to/notofilia/uploads ./public/uploads
   ```

   (Or run the helper: `bash scripts/import-uploads.sh /path/to/notofilia`)

3. Install and build:

   ```bash
   npm install
   npm run build      # outputs the full site to dist/
   npm run preview    # verify at http://localhost:4321
   ```

That's it — the build then reproduces the complete site. The optional
`reference/` folder (design-source components, prior snapshots, screenshots) also
lives in your `notofilia` repo if you want to bring it across too.
