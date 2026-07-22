# Notofilia.com — Astro build

Astro 4 build of [notofilia.com](https://www.notofilia.com): a digital catalog
and virtual collection of historical banknotes and coins — Colombia, Puerto
Rico, Ecuador, U.S. currency, colonial issues, and world polymer notes — plus
historical profiles of figures tied to Colombian monetary history.

This is a faithful migration of the existing static site onto the Astro
toolchain. Catalog pages (`.dc.html`) are served verbatim from `public/`; the
homepage, Noticias, Blog, and 404 are native Astro routes styled with Tailwind
v4.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static site to dist/
npm run preview   # serve the production build locally
npm run check     # Astro + TypeScript diagnostics
```

Requires Node 20.3.0+ (Astro 4 requirement).

## How the migration works

Most of the live site is a set of **hand-authored, self-contained HTML
documents** (`*.dc.html`, one per catalog/profile page). Each page inlines its
own `<head>` SEO block, header/footer, and styles. Navigation, image lightboxes,
and search run on a client-side runtime in `public/support.js` (the
"dc-runtime").

Those catalog pages use two syntaxes that are **incompatible with a build-time
component compiler**:

- `{{ … }}` mustache placeholders consumed by the client runtime inside
  `<template>` elements, and
- inline `${ … }` JavaScript template literals inside `<script>` blocks.

Astro's `.astro` parser would evaluate `{ … }` / `${ … }` at build time and
break those pages. Re-authoring ~130 bespoke pages into `.astro` components is
also a large, careful content migration.

So the faithful approach is: **serve catalog pages verbatim from `public/`.**
Astro copies `public/**` into `dist/` unchanged. Native Astro routes layer on
top for the pages that benefit most from content collections and shared layouts.

### Natively Astro routes

| Route | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/noticias/`, `/noticias/<slug>/` | `src/pages/[section]/*` + collection `noticias` |
| `/blog/`, `/blog/<slug>/` | `src/pages/[section]/*` + collection `blog` |
| `/404` | `src/pages/404.astro` |

Editorial posts live as Markdown in `src/content/{noticias,blog}/` with a shared
Zod schema (`src/content/config.ts`). Shared UI lives under `src/components/`;
design tokens and utilities under `src/styles/global.css` (Tailwind v4
`@theme`).

News articles include a Turnstile-protected comment form backed by Cloudflare
D1. New comments remain pending until approved. See
[`docs/comments-moderation.md`](docs/comments-moderation.md) for the moderation
workflow and required Cloudflare bindings.

## Project structure

```
.
├── astro.config.mjs        # Astro static config (site URL, Tailwind Vite plugin)
├── wrangler.jsonc          # Cloudflare Pages config (output dir: dist)
├── functions/
│   └── _middleware.js      # Cloudflare Pages Function: logs 404s
├── src/
│   ├── components/         # Cover, PreFooter, SiteFooter, BaseHead, Post*, Home*
│   ├── content/            # Markdown collections (blog, noticias)
│   ├── layouts/            # BlogLayout (editorial shell)
│   ├── lib/                # site URL, dates, posts helpers, sitemap stats
│   ├── pages/              # native Astro routes ([section] = blog|noticias)
│   └── styles/global.css   # Tailwind v4 theme + fonts + prose
├── public/                 # catalog site, served verbatim
│   ├── billete-*.dc.html   # individual banknote pages (~90)
│   ├── perfil-*.dc.html    # historical figure profiles (~14)
│   ├── catalogo*.dc.html   # catalog / collection pages (~11)
│   ├── moneda-*.dc.html    # colonial coin pages
│   ├── catalog-fonts.css   # shared @font-face for catalog pages
│   ├── support.js          # client runtime (dc-runtime)
│   ├── uploads/            # photography, fonts (WOFF2 + TTF)
│   ├── favicon.png, robots.txt, sitemap.xml, sitemap_index.xml, news-sitemap.xml
│   └── _redirects, _headers
└── reference/              # design-time sources, NOT web-served
```

## URLs & redirects

Catalog URLs are unchanged (`.dc.html` paths + Cloudflare `_redirects` pretty
URLs). Astro editorial routes use directory URLs (`/blog/<slug>/`,
`/noticias/<slug>/`).

`scripts/generate-sitemap.mjs` (run via `prebuild`) writes:

- `sitemap.xml` — all canonical pages
- `news-sitemap.xml` — noticias from the last ~48 hours (Google News schema)
- `sitemap_index.xml` — index pointing at both

Legacy `/sitemap-news.xml` 301s to `/news-sitemap.xml` for old Search Console submissions.
## Deploying (Cloudflare Pages)

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
- `functions/` is picked up automatically for Pages Functions.

## Migrating a catalog page into Astro (future work)

The next step is to model banknotes/profiles as content collections and render
them through one template. That requires faithfully transcribing each page's
prose, specs, sources, and JSON-LD — done incrementally, one page at a time.
