# A7 QA report — bilingual `/en/` release

**Agent:** A7 (adversarial QA)  
**Date:** 2026-08-18  
**Branch:** `cursor/feat-bilingual-en-72d4`  
**Truth source:** production `dist/` after `npm run check` and `npm run build` (not the dev server).  
**Do not fix.** This file is findings only.

**Phase 6 follow-up (orchestrator):** W1 (`llms.txt`), W2 (EN JSON-LD inventory names), and W5 (glossary `termEn` for scripophily / reeded edge / coin blank) were fixed after this report. W3 (Spanish catalog-index filter keys) and W4 (`/en/search/`) remain deferred — see `docs/i18n/TRANSLATION-TODO.md` and `docs/i18n/LAUNCH-CHECKLIST.md`.

---

## Summary counts

| Metric | Count |
|---|---|
| `npm run check` | **0 errors** (14 preexisting hints; `noticias-en` glob empty by design) |
| `npm run build` | **success** — 435 Astro pages; mustache guard **437** HTML files, zero `{{` |
| Spanish HTML routes in `dist/` | **316** — exact match to AUDIT.md §1 (including `/404` and `/buscar/`) |
| English HTML routes in `dist/` | **119** — extra tree, not replacements (`118` paired + `/en/404/`) |
| `allPairs()` | **118** |
| Sitemap `<loc>` (`public/sitemap.xml` = `dist/sitemap.xml`) | **432** (314 Spanish indexable + 118 English; omits `/404`, `/buscar/`, `/en/404/`) |
| HTML files with reciprocal hreflang cluster | **236** = 118 pairs × 2 |
| Unpaired Spanish pages with hreflang | **0** of 196 |
| Checks 1–10 PASS | **10** |
| Checks FAIL | **0** |
| Blockers | **0** |
| Warnings | **5** |

Architecture was not re-litigated. Manual `src/pages/en/` + `src/i18n/pairs.ts`; no Astro `i18n` key.

---

## Checks 1–10

| # | Check | Result |
|---|---|---|
| 1 | Spanish URLs unchanged vs AUDIT.md §1 | **PASS** |
| 2 | Placeholder scan of `dist/**/*.html` | **PASS** |
| 3 | hreflang integrity vs `allPairs()` | **PASS** |
| 4 | Canonicals self-referencing; no ES↔EN swap | **PASS** |
| 5 | `<html lang>` `es` / `en`; 404 sources | **PASS** |
| 6 | Sitemap parses; both trees; loc ↔ `dist/` | **PASS** |
| 7 | EN translation sample (≥10 pages) | **PASS** (see warnings) |
| 8 | Language switcher `<a href>` counterparts | **PASS** |
| 9 | No redirect traps; no `/en/coleccion/` alias | **PASS** |
| 10 | Regressions (WebVitals, images, RSS, cookies, `compressHTML`) | **PASS** (see warnings) |

---

## Blockers (must fix)

None. No check failed. Remaining issues are quality / docs / partial-coverage leftovers and do not ship unrendered templates, broken Spanish URLs, or non-reciprocal hreflang.

---

## Warnings (should fix)

### W1 — `llms.txt` still describes the deleted chrome toggle

`dist/llms.txt` (from `scripts/generate-llms-txt.mjs`) still says:

> contenido editorial en español (`lang=es`). El interruptor ES/EN del encabezado cambia solo el idioma de la interfaz (chrome), no traduce títulos ni fechas; **no implica un documento `/en/` con hreflang recíproco**.

That is false after this release: `/en/` exists, pairs are registered, and BaseHead emits reciprocal `es` / `en` / `x-default`. Agents that read `llms.txt` will be told there is no English URL tree.

- Files: `scripts/generate-llms-txt.mjs`, `public/llms.txt`, `dist/llms.txt` (and `llms-full.txt` / `llm.txt` aliases).

### W2 — English JSON-LD still uses Spanish inventory property names

On `dist/en/index.html` and `dist/en/collection/index.html`, `additionalProperty` mixes an English availability label with Spanish names:

`Billetes`, `Monedas`, `Países`, `Fichas`, `Páginas`

Same graph already uses English `"Availability"`. Crawlers see Spanish property names on `inLanguage: "en"` documents. Not body/meta/alt, so not a check-7 fail, but it is leftover A3/A4 schema copy.

### W3 — English collection hub filters still expose Spanish catalog-index keys

`dist/en/collection/index.html`:

- Filter chrome labels are English (`Country`, `Issuer`, `All`).
- `<option>` values and many visible labels remain Spanish catalog keys (`Estados Unidos`, `España`, `Catar`, `Brunéi`, plus sentence-length issuer names such as `Asamblea General de Pensilvania, bajo el reinado de Jorge III`).
- Country chips are inconsistent: visible “United States” / “Brazil” but still `?pais=Estados%20Unidos`; chip “España” is untranslated.

A4 documented that `catalog-index.json` keys stay Spanish so filters work. Honest partial coverage, but the EN hub still shows Spanish UI strings next to translated ones.

### W4 — English pages still submit search to `/buscar/`

Every sampled EN document has `action="/buscar/"`. `/en/search/` is unpaired and does not exist (`dist/en/search/` absent). A6 documented this; switcher from `/buscar/` falls back to `/en/` (`data-i18n-fallback="home"`). English chrome + Spanish search URL is the remaining toggle-era hole.

### W5 — Glossary `termEn` bugs from AUDIT.md shipped on `/en/glossary/`

Pre-existing dictionary issues, now live English URLs:

| ES | EN URL built | Notes (AUDIT.md §4.2 / Appendix E) |
|---|---|---|
| `escripofilia` | `/en/glossary/escripofilia/` | `termEn` still Spanish; AUDIT wanted `scripophily` |
| `cordoncillo` | `/en/glossary/cordoncillo/` | `termEn = termEs` |
| `cospel` | `/en/glossary/cospel/` | `termEn = termEs` (vs `planchuela` → planchet) |

Not a routing defect (`slugify(termEn)` matches `pairs.ts`). English term pages whose `termEn` was never anglicized are Spanish headwords at English URLs.

---

## Passes worth noting

### Check 1 — Spanish inventory

AUDIT.md §1 native routes + Appendix A (144 catalog) + B (55 noticias) + C (9 blog) + E (95 glossary) = **316**. Built Spanish `dist/` routes = **316**. Missing: none. Extra Spanish: none. `/en/` is additive (119).

Spot-check: `dist/coleccion/colombia/index.html` still exists; `html lang="es"`; canonical `https://notofilia.com/coleccion/colombia/`; h1 still `Catálogo de Billetes de Colombia`.

### Check 2 — Placeholders

`scripts/check-unresolved-mustache.mjs` (wired into `npm run build`): **zero `{{…}}`** in 437 HTML files (435 Astro + 2 `oauth/` shells).

Adversarial grep of Astro HTML (excluding CSS `{}` / JSON-LD `{}` / legitimate JS):

- `[object Object]`: none
- `t('`: none in markup
- `nav.home` / `ui.*` keys: none (a `/buscar/` `PagefindUI === 'undefined'` / `ui.css` hit is JS, not a template leak)
- `interface-lang.js` / `#lang-es` buttons: none in `dist/`

### Check 3 — hreflang

For every `allPairs()` entry:

- Both `dist/` files exist.
- Both emit exactly `hreflang="es"` + `hreflang="en"` + `hreflang="x-default"`.
- Hrefs are absolute `https://notofilia.com/…`, byte-identical on both sides of the pair.
- `x-default` = Spanish URL.
- Counterpart files exist (no dangling loc).

Unpaired Spanish pages (196, e.g. fichas and individual noticias): **zero** hreflang tags. `/404`, `/en/404/`, `/buscar/`: none.

`/en/404/` is the only English HTML route not in `allPairs()` (ARCHITECTURE.md §8).

Example (`dist/index.html` / `dist/en/index.html`):

```html
<link rel="alternate" hreflang="es" href="https://notofilia.com/">
<link rel="alternate" hreflang="en" href="https://notofilia.com/en/">
<link rel="alternate" hreflang="x-default" href="https://notofilia.com/">
```

### Check 4 — Canonicals

Every indexable page self-canonicalizes. No EN canonical points at ES or vice versa. `/404` → `https://notofilia.com/404` (`noindex`). `/en/404/` → `https://notofilia.com/en/404/` (`noindex`). `og:url` matches canonical.

### Check 5 — `html lang`

Scripted over all 435 Astro HTML files: **zero exceptions**.

| File | `lang` |
|---|---|
| Root pages | `es` + `data-page-locale="es"` |
| `/en/` tree | `en` + `data-page-locale="en"` |
| `dist/404.html` | `es` (path-sniff is runtime, as specified) |
| `dist/en/404/index.html` | `en` |

### Check 6 — Sitemap

- `public/sitemap.xml` parses (`xmlns:xhtml` present) and is **byte-identical** to `dist/sitemap.xml`.
- 432 `<loc>`: 314 ES + 118 EN. Homepage `/` and `/en/` both priority `1.0`; `x-default` → Spanish.
- Every sitemap loc maps to a `dist/**/index.html` (or `dist/index.html`).
- Every indexable `dist/` page is in the sitemap. Excluded as specified: `/404`, `/buscar/`, `/en/404/`. `/en/search/` does not exist.
- News sitemap present (0 rows in the 48h window). `sitemap_index.xml` lists both.
- Static file server sample (10+ URLs from both trees) returned **HTTP 200**. `/en/coleccion/` returned **404** (no alias). This is file existence, not Cloudflare Pages status for unknown paths.

### Check 7 — EN translation sample (13 pages)

Chrome strings (`Saltar al contenido`, `Aviso de cookies`, `Todos los derechos…`, etc.) are **absent** from `dist/en/`. Skip links bake English. Cookie banner on `/en/` is `Cookie notice` / `Reject non-essential` / `Accept all`, privacy href `/en/privacy-cookies/`.

| Route | Title (len) | Meta desc (len) | h1 |
|---|---|---|---|
| `/en/` | Notofilia: Banknotes and Numismatics \| Catalog (46) | 92 | A private collection of historical banknotes and coins |
| `/en/collection/` | Virtual Collection of Banknotes \| Notofilia (43) | 71 | Virtual Collection: 215 banknotes and 7 coins from 33 countries |
| `/en/collection/colombia/` | Colombia Banknote Catalog \| Notofilia (37) | 138 | Colombia Banknote Catalog |
| `/en/collection/puerto-rico/` | Puerto Rico Banknote Catalog \| Notofilia (40) | 124 | Puerto Rico Banknote Catalog |
| `/en/collection/ecuador/` | Ecuador Banknote Catalog \| Notofilia (36) | 114 | Ecuador Banknote Catalog |
| `/en/glossary/` | Glossary of Numismatics and Notaphily · Notofilia (49) | 112 | Glossary of Numismatics and Notaphily |
| `/en/glossary/obverse/` | Obverse — Glossary · Notofilia (30) | 93 | Obverse |
| `/en/blog/` | Numismatics and Notaphily Blog \| Notofilia (42) | 145 | Numismatics and Notaphily Blog |
| `/en/blog/how-to-start-a-banknote-collection/` | How to Start a Banknote Collection · Notofilia (46) | 131 | How to Start a Banknote Collection |
| `/en/news/` | Numismatics and Notaphily News \| Notofilia (42) | 132 | Numismatics and Notaphily News |
| `/en/contact/` | Contact \| Notofilia (19) | 116 | Contact |
| `/en/editorial/` | Editorial policy and valuation \| Notofilia (42) | 136 | Editorial policy, sources, and valuation |
| `/en/privacy-cookies/` | Privacy and Cookie Policy \| Notofilia (37) | 143 | Privacy and Cookie Policy |

All 119 EN titles ≤60; all EN meta descriptions ≤160 (and ≤150 after HTML-entity decode). No page missing title/description.

Allowed Spanish on samples: `lang="es"` news titles/excerpts on `/en/news/`; `lang="es"` blog/noticia cards on `/en/`; Banco de la República / Simón Bolívar / catalog terms; glossary Spanish headwords marked `lang="es"`. Colombia hub body is English (“The Beginnings of Paper Money in Colombia”). Contact labels: Name, Email, Message.

All 119 EN pages: `og:locale=en_US` + `og:locale:alternate=es_ES` when paired. JSON-LD `inLanguage` is `en` on sampled EN documents (inventory *names* still Spanish — W2).

### Check 8 — Switcher

Present in static HTML as `<a class="site-header__lang-btn" href="…">`, not a `<button>`. Works with JS disabled.

| From | Switcher href | Notes |
|---|---|---|
| `/` | `/en/` | exact |
| `/en/` | `/` | exact |
| `/coleccion/` | `/en/collection/` | exact |
| `/coleccion/colombia/` | `/en/collection/colombia/` | exact (and reverse) |
| `/coleccion/puerto-rico/` | `/en/collection/puerto-rico/` | exact |
| `/coleccion/ecuador/` | `/en/collection/ecuador/` | exact |
| `/glosario/` | `/en/glossary/` | exact |
| `/glosario/anverso/` | `/en/glossary/obverse/` | exact |
| `/blog/` | `/en/blog/` | exact |
| `/blog/como-empezar-coleccion-billetes/` | `/en/blog/how-to-start-a-banknote-collection/` | exact |
| `/noticias/` | `/en/news/` | exact |
| `/contacto/` | `/en/contact/` | exact |
| `/editorial/` | `/en/editorial/` | exact |
| `/editorial/equipo/` | `/en/editorial/team/` | exact |
| `/politica-privacidad-cookies/` | `/en/privacy-cookies/` | exact |
| `/j-s-g-boggs/` | `/en/j-s-g-boggs/` | exact |
| `/noticias/moneda-2-euros-grace-kelly/` | `/en/news/` | section fallback (`data-i18n-fallback="section"`) — A6 |
| `/coleccion/ecuador/100-sucres-1993/` | `/en/collection/` | unpaired ficha → section |
| `/buscar/` | `/en/` | `/en/search/` unpaired → home |
| `/404` | `/en/` | home fallback |
| `/en/404/` | `/` | home fallback |

EN Collection nav is `/en/collection/` (A6), not the A3 Colombia-only href.

### Check 9 — Redirects

- `astro.config.mjs`: no `i18n` key; `compressHTML: false` still set; `trailingSlash: 'ignore'`.
- `functions/_middleware.js`: www→apex 301 only; `/en/*` misses may serve `/en/404/` HTML with HTTP 404. Comment: do not negotiate `Accept-Language` or geo. No `CF-IPCountry`.
- `public/_redirects`: no `/en/` rules, no `/en/coleccion/` alias.
- `dist/en/coleccion/` does not exist. HTTP sample of `/en/coleccion/` → 404.

### Check 10 — Regressions

- `WebVitals` / `notofilia_cookie_consent` / `/web-vitals.js` on both `/` and `/en/`. `src/client/web-vitals-bootstrap.js` sends `content_language: 'en'|'es'` from the path.
- Cookie banner on both trees; EN privacy link `/en/privacy-cookies/`; ES home privacy link `/politica-privacidad-cookies/`.
- EN catalogue hubs: `<picture>` + `srcset` counts match Spanish counterparts (Colombia 28/28 both sides). `catalog-zoom.js` + `data-zoom-dialog` count match (2/2 on Colombia hubs). Collection index and numismatics hubs have no zoom script on **either** locale (not an EN regression).
- No `rss.xml` / `atom.xml` / `feed.xml` in `dist/` (A5 decision).
- `compressHTML: false` still set.
- No `<meta name="keywords">` on EN pages.
- Hidden `data-lang-panel="en"` panels are gone from Spanish documents.

---

## Method (not committed)

QA scripts lived under `/tmp` (`a7-qa.mjs`, `a7-qa2.mjs`): walk `dist/`, parse AUDIT.md §1 tables, import `allPairs()` via Node type stripping (same path as `scripts/load-pairs.mjs`), compare hreflang/canonical/lang/sitemap/switcher.

Commands:

```bash
npm run check    # 0 errors
npm run build    # 435 pages; mustache check passed
```
