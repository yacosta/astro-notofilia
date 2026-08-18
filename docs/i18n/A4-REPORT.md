# A4 report — Content Translator

Branch: `cursor/feat-bilingual-en-72d4`  
Owner: Agent A4  
Spanish URLs unchanged. No Astro `i18n` config. Pair registry remains a single map (`src/i18n/pairs.ts`).

## ES → EN pages shipped

| Spanish | English | Kind | Notes |
|---|---|---|---|
| `/` | `/en/` | static | A3 page; A4 only rewired blog/news card hrefs via `alternateUrl` |
| `/coleccion/` | `/en/collection/` | collection | Full English chrome; `catalog-index.json` country keys stay Spanish; Colombia / PR / Ecuador / numismatics CTAs use EN URLs; other hubs stay Spanish |
| `/coleccion/numismatica/` | `/en/collection/numismatics/` | collection | English copy; coin fichas stay Spanish hrefs; colonial hub CTA stays Spanish |
| `/coleccion/colombia/` | `/en/collection/colombia/` | collection | A3; not rewritten |
| `/coleccion/puerto-rico/` | `/en/collection/puerto-rico/` | collection | `i18n.en` overlay on the same JSON; untranslated ficha hrefs Spanish |
| `/coleccion/ecuador/` | `/en/collection/ecuador/` | collection | Same pattern as Puerto Rico |
| `/glosario/` | `/en/glossary/` | glossary | Index sorted by `termEn`; 95 terms |
| `/glosario/{id}/` | `/en/glossary/{slugify(termEn)}/` | glossary | Primary copy is `termEn` + `definitionEn`; see-also uses EN slugs |
| `/blog/` | `/en/blog/` | blog | Index of 9 evergreen EN posts |
| `/blog/como-empezar-coleccion-billetes/` | `/en/blog/how-to-start-a-banknote-collection/` | blog | Parallel `blog-en` |
| `/blog/como-identificar-billetes-falsos/` | `/en/blog/how-to-identify-counterfeit-banknotes/` | blog | |
| `/blog/diferencia-numismatica-notafilia/` | `/en/blog/difference-between-numismatics-and-notaphily/` | blog | |
| `/blog/mylar-si-plastico-no-como-guardar-billetes/` | `/en/blog/mylar-yes-plastic-no-how-to-store-banknotes/` | blog | |
| `/blog/numeros-serie-especiales-billetes/` | `/en/blog/fancy-serial-numbers-on-banknotes/` | blog | |
| `/blog/origenes-banca-comercial-colombia-banca-libre/` | `/en/blog/origins-of-commercial-banking-in-colombia-free-banking/` | blog | |
| `/blog/origenes-banca-comercial-puerto-rico/` | `/en/blog/origins-of-commercial-banking-in-puerto-rico/` | blog | |
| `/blog/personajes-billetes-colombia/` | `/en/blog/figures-on-colombia-banknotes/` | blog | |
| `/blog/tres-imprentas-misterio-pie-imprenta-billetes-colombianos/` | `/en/blog/three-printers-imprint-mystery-colombian-banknotes/` | blog | |
| `/noticias/` | `/en/news/` | news | English chrome; items stay Spanish (`lang="es"`, Spanish hrefs) |
| `/contacto/` | `/en/contact/` | static | Baked from the former `data-lang-panel="en"` (plus form copy) |
| `/editorial/` | `/en/editorial/` | static | Baked EN; corrections target `#corrections` |
| `/editorial/equipo/` | `/en/editorial/team/` | static | |
| `/politica-privacidad-cookies/` | `/en/privacy-cookies/` | static | |
| `/j-s-g-boggs/` | `/en/j-s-g-boggs/` | collection | Full catalog-style English page (`CatalogLayout locale="en"`) |

## Pages deferred (and why)

See `docs/i18n/TRANSLATION-TODO.md`.

- **55 individual noticias** — time-stamped Jul–Aug 2026; bulk translation would be thin.
- **~144 catalog fichas** — hubs are English; piece pages stay Spanish until a human `i18n.en` overlay exists.
- **Remaining hubs** — US obsolete, Federal Reserve, Treasury, colonial coinage, polymer, MPC, pop-art, food coupons, free banking, notes issued abroad.
- **`/en/search/`** — stays noindex; filter chrome still partly Spanish in `coleccion-hub.js`.
- **Logros** — Spanish placeholder only.

## Files changed

### Content collections

- `src/content.config.ts` — added `blog-en` and `noticias-en` with `pairEs` (Spanish glob unchanged).
- `src/content/blog-en/*.md` — 9 evergreen translations.
- `src/content/noticias-en/.gitkeep` — empty parallel collection on purpose.
- `src/content/catalog/puerto-rico.json` — `i18n.en` + per-card `titleEn`/`altEn` (Spanish `path`/`title`/`template` untouched).
- `src/content/catalog/ecuador.json` — same.

### Routes (`src/pages/en/**`)

- `collection/index.astro`, `collection/numismatics/index.astro`
- Tiny wiring: `collection/[...slug].astro` breadcrumb uses `recordTitle` (not hardcoded Colombia); `index.astro` blog/news hrefs use `alternateUrl`
- `glossary/index.astro`, `glossary/[slug].astro`
- `blog/index.astro`, `blog/[...slug].astro`
- `news/index.astro`
- `contact/index.astro`, `editorial/index.astro`, `editorial/team.astro`, `privacy-cookies/index.astro`, `j-s-g-boggs/index.astro`

### Libraries

- `src/i18n/pairs.ts` — `SEED_PAIRS` for static/section indexes; generators `fromGlossary`, `fromBlogEn`, `fromNoticiasEn`. `fromCatalog` unchanged. One map.
- `src/lib/glossary.ts` — `GLOSSARY_PATH_EN`, EN path helpers, `getGlossaryTermsEn`, EN JSON-LD. Spanish `GLOSSARY_PATH` unchanged.
- `src/lib/collections.ts` — `collectionIndexJsonLdEn`, `articleJsonLdEn` only. Spanish `COLLECTIONS` labels unchanged.

### Docs

- `docs/i18n/TRANSLATION-TODO.md` (this queue)
- `docs/i18n/A4-REPORT.md` (this file)

## Pair-registry notes

Register order: `SEED_PAIRS` → `fromCatalog()` → `fromGlossary()` → `fromBlogEn()` → `fromNoticiasEn()`.

- Colombia appears in both seed and catalog; identical `{es,en,kind}` merges.
- Puerto Rico and Ecuador pairs come from `fromCatalog()` (`i18n.en.path`).
- Glossary: 95 pairs; EN slug = `slugifyGlossary(termEn)` (NFD, ASCII, hyphens). Duplicate `termEn` slugs would throw at build.
- Blog: 9 pairs from `pairEs` frontmatter.
- `noticias-en` currently contributes zero pairs.
- Conflicting duplicates (same ES, different EN) still throw.

`fromGlossary` / `fromBlogEn` / `fromNoticiasEn` are filesystem readers (YAML scalar parse) so `generate-sitemap.mjs` can import `pairs.ts` without pulling `astro:content`.

## Glossary (canonical dictionary used)

notafilia → notaphily; billete → banknote; anverso / reverso → obverse / reverse; ceca → mint; tirada → print run; specimen stays specimen; marca de agua → watermark; registro coincidente → see-through register; banca libre → free banking. Proper nouns and catalog IDs kept.

## Known follow-ups for A5 / A6 (not edited here)

- SiteHeader Collection link on EN pages still goes to `/en/collection/colombia/` (A3). Should be `/en/collection/`.
- BlogLayout skip link remains Spanish in HTML source (layouts are A5-owned).
- `coleccion-hub.js` “Todos” option label is still Spanish on the EN collection index.

## Verification

- [x] `npm run check` — 0 errors (15 preexisting hints, none in A4 routes)
- [x] `npm run build` — pass; 435 pages; sitemap 432 URLs / 118 English / 236 with hreflang
- [x] Spanish `dist/coleccion/`, `dist/blog/`, `dist/noticias/`, `dist/glosario/` still present at the same paths (`lang="es"`)
- [x] Spot-check `dist/en/` is English:
  - `/en/glossary/obverse/` — h1 Obverse, `definitionEn`, see-also `/en/glossary/reverse/`, Spanish term `Anverso` marked `lang="es"`
  - `/en/collection/` — h1 “Virtual Collection: 215 banknotes…”, featured Colombia/PR/Ecuador/numismatics → `/en/…`, polymer/MPC/obsolete/pop-art stay `/coleccion/…`
  - `/en/blog/how-to-start-a-banknote-collection/` — English body (“Starting a banknote collection…”)
  - `/en/contact/` — English h1 and form labels (Name, Email)
  - `/en/news/` — English chrome; article titles `lang="es"` with Spanish `/noticias/` hrefs
- [x] Mustache guard: 437 HTML files, zero `{{`

`noticias-en` glob is empty by design (`No files found matching … noticias-en` warning at sync). 95 glossary EN slugs are unique. Title lengths on shipped EN pages are ≤60; meta descriptions ≤150.
