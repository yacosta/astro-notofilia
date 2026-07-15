# Notofilia.com — Astro build

Astro 4 build of [notofilia.com](https://www.notofilia.com): a digital catalog
and virtual collection of historical banknotes and coins — Colombia, Puerto
Rico, Ecuador, U.S. currency, colonial issues, and world polymer notes — plus
historical profiles of figures tied to Colombian monetary history.

This is a faithful 1:1 migration of the existing static site onto the Astro
toolchain. Every page, asset, URL, redirect, and piece of SEO metadata from the
live site is preserved exactly; `astro build` reproduces the site's output
byte-for-byte and adds a proper dev/build/preview workflow on top.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static site to dist/
npm run preview   # serve the production build locally
```

Requires Node 20.3.0+ (Astro 4 requirement).

## How the migration works

The live site is a set of **hand-authored, self-contained HTML documents**
(`*.dc.html`, one per page). Each page inlines its own `<head>` SEO block
(title, description, Open Graph, Twitter Card, JSON-LD), its own header/footer,
and its own styles. Navigation between pages, image lightboxes, search, and the
homepage hero all run on a client-side runtime shipped in `public/support.js`
(the "dc-runtime"), `public/image-slot.js`, and `public/news-items.js`.

Those pages use two syntaxes that are **fundamentally incompatible with a
build-time component compiler**:

- `{{ … }}` mustache placeholders (e.g. `{{ activeNoteJpg }}`) consumed by the
  client runtime inside `<template>` elements, and
- inline `${ … }` JavaScript template literals inside `<script>` blocks.

Astro's `.astro`/JSX parser evaluates `{ … }` and `${ … }` at build time, which
would break these pages. Re-authoring ~130 bespoke pages into `.astro`
components would also risk silently dropping content or altering the carefully
hand-tuned SEO/JSON-LD on each page.

So the faithful, zero-loss approach is: **serve the existing pages verbatim from
`public/`.** Astro copies `public/**` into `dist/` unchanged, preserving exact
file names (including the `.dc.html` extension the internal links depend on),
relative asset paths, and the `_redirects` / `_headers` that Cloudflare Pages
uses. The result is a genuine Astro project — dev server, build pipeline,
config, and a foundation for incremental componentization — that outputs the
identical site.

The one net-new, genuinely-Astro route is `src/pages/404.astro`: a styled
not-found page (the static site had none) built through Astro and matching the
site's palette and typography.

## Project structure

```
.
├── astro.config.mjs        # Astro static config (site URL, trailing slash)
├── wrangler.jsonc          # Cloudflare Pages config (output dir: dist)
├── functions/
│   └── _middleware.js      # Cloudflare Pages Function: logs 404s
├── src/
│   └── pages/
│       └── 404.astro       # custom 404 (real Astro route → dist/404.html)
├── public/                 # the faithful site, served verbatim
│   ├── index.html          # homepage
│   ├── billete-*.dc.html   # individual banknote pages (~90)
│   ├── perfil-*.dc.html    # historical figure profiles (~14)
│   ├── catalogo*.dc.html   # catalog / collection pages (~11)
│   ├── moneda-*.dc.html    # colonial coin pages (7)
│   ├── glosario-numismatico.dc.html, contacto.dc.html, noticias.dc.html,
│   │   politica-privacidad-cookies.dc.html, departamento-del-tesoro-de-ee-uu.dc.html
│   ├── support.js, news-items.js   # client runtime (dc-runtime + homepage news)
│   ├── uploads/            # banknote photography, fonts, PDFs (~820 files)
│   ├── favicon.png, robots.txt, sitemap.xml
│   └── _redirects, _headers   # Cloudflare Pages rewrites + headers
└── reference/              # design-time sources, NOT web-served
    ├── SiteHeader.dc.html, SiteFooter.dc.html, BanknoteCard.dc.html
    ├── *mockup*.dc.html, Notofilia Landing.dc.html
    ├── site-files/         # prior working snapshot of the site
    ├── screenshots/        # development screenshots
    ├── image-slot.js       # editor-only tool; not referenced by any served page
    ├── *-pdf-text.txt, politica-privacidad-cookies.md, glosario-numismatico.json
    └── crop*.png           # image-crop working files
```

`reference/` preserves every source and working file from the original repo so
nothing is lost, but those files are not part of the deployed site.

## URLs & redirects

URLs are unchanged. Pages are served at their `.dc.html` paths (which internal
links reference directly), and `public/_redirects` layers the site's pretty URLs
(`/coleccion/colombia/…/`, `/glosario/`, `/contacto/`, etc.) on top via
Cloudflare Pages 200-rewrites — exactly as on the live site. `sitemap.xml`
(128 URLs) and `robots.txt` are carried over as-is.

## Deploying (Cloudflare Pages)

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
- `functions/` is picked up automatically for Pages Functions.

## Migrating a page into a real Astro component (future work)

The elegant next step (already prototyped in the original repo's
`astro-migration/` folder) is to model banknotes/profiles as content
collections and render them through one template. That work is intentionally
**not** done here because it requires faithfully transcribing each page's prose,
specs, sources, and JSON-LD — a large, careful effort. This project is the
complete, working, faithful baseline to do that on incrementally, one page at a
time, without ever taking the live site offline.
