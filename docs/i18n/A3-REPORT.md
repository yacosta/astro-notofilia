# A3 report — Routing & Infrastructure

**Agent:** A3  
**Date:** 2026-08-18  
**Branch:** `cursor/feat-bilingual-en-72d4`  
**Binding docs:** `docs/i18n/ARCHITECTURE.md` §12, `docs/i18n/AUDIT.md`

Spanish root URLs are unchanged. English lives under `/en/` via a manual `src/pages/en/` tree. There is no `i18n` key in `astro.config.mjs`.

---

## 1. Files changed

### New

| File | Role |
|---|---|
| `src/i18n/pairs.ts` | Pair registry (`Locale`, `PairKind`, `Pair`, `SEED_PAIRS`, `fromCatalog()`, `getPair`, `alternateUrl`, `allPairs`, `localeFromPath`, `switchUrl`, `normalizePath`) |
| `src/pages/en/index.astro` | English homepage |
| `src/pages/en/collection/[...slug].astro` | English catalog hubs from `data.i18n.en` |
| `src/pages/en/404.astro` | Optional English 404 document (`noindex`, not in `allPairs()`) |
| `docs/i18n/A3-REPORT.md` | This report |

### Schema / content (Colombia only)

| File | Change |
|---|---|
| `src/content.config.ts` | Optional `i18n.en` (`path`, `title`, `description`, optional `ogTitle` / `ogDescription` / `template` / `recordTitle` / `eyebrow`) |
| `src/lib/catalog-record.ts` | Optional `titleEn`, `altEn`, `groupEn`, `groupKickerEn` on cards; `altEn` on images |
| `src/content/catalog/colombia.json` | Added `i18n.en` + English card fields. Spanish `path` / `title` / `template` / card `href`s **unchanged**. Other catalog JSON **untouched**. |

### Head, layouts, Spanish callers

| File | Change |
|---|---|
| `src/components/BaseHead.astro` | Required `locale`. Self-canonical. Reciprocal hreflang + `og:locale` only when `getPair(path)` hits. Slot is extra links, not handwritten hreflang. Kept WebVitals, `<base href="/" />`. |
| `src/layouts/CatalogLayout.astro` | `locale` (default `'es'`), `html lang` + `data-page-locale`, skip `withI18nMarkup` on `en`, Colombia hub sort also for `/en/collection/colombia/` |
| `src/layouts/BlogLayout.astro` | `locale` default `'es'`, pass through to BaseHead / chrome |
| `src/pages/index.astro` | `locale="es"`; deleted slotted hreflang |
| `src/pages/coleccion/[...slug].astro` | `locale="es"` |
| `src/pages/coleccion/index.astro` | `locale="es"` |
| `src/pages/coleccion/numismatica/index.astro` | `locale="es"` |
| `src/pages/buscar/index.astro` | `locale="es"` |
| `src/pages/404.astro` | `locale="es"`, `noindex`, `/en/` path-sniff boot (lang + `data-en` paint + CTAs `/en/` and `/en/collection/colombia/`) |

### Chrome / cards (optional `locale`; pill kept)

| File | Change |
|---|---|
| `src/lib/ui-i18n.ts` | `export type Locale`, `t()`, `useTranslations()`. Special-case `cookiesBody` / `cookiesBodyEn`. No second dictionary. |
| `src/components/SiteHeader.astro` | Bake English via `t()` / `labelEn` when `locale="en"`. Brand → `/en/`. Collection → `/en/collection/colombia/` (only paired catalog hub). Pill `#lang-es` / `#lang-en` stays. |
| `src/components/SiteFooter.astro` | Same bake pattern |
| `src/components/CookieBanner.astro` | Same bake pattern |
| `src/components/PreFooter.astro` | Same bake pattern |
| `src/components/HomeHero.astro` | `locale`; English alts; same `/uploads/` srcset |
| `src/components/HomeStatsBar.astro` | `locale` |
| `src/components/HomeBrowseStrip.astro` | `locale`; Colombia CTA → `/en/collection/colombia/`; unpaired CTAs stay Spanish hrefs |
| `src/components/HomePostStrip.astro` | `locale`; Spanish post titles with `lang="es"` |
| `src/components/HomeLogrosStrip.astro` | `locale`; Spanish titles with `lang="es"` |
| `src/components/catalog/CatalogHubGrid.astro` | `locale`; EN visible strings from `*En` / `lookupEn`; href `alternateUrl(...) ?? href` |
| `src/components/catalog/CatalogBanknoteCard.astro` | Same |
| `src/components/catalog/CatalogRecordSurface.astro` | `locale` plumbing so EN hub chrome is English |
| `src/components/catalog/CatalogBreadcrumb.astro` | `locale` |
| `src/components/catalog/CatalogCitation.astro` | `locale` |
| `src/components/catalog/CatalogFeedback.astro` | `locale` |

### Docs / tests

| File | Change |
|---|---|
| `CLAUDE.md` | English URL pages **must** use `lang="en"`; Spanish stays `lang="es"` |
| `e2e/catalog-phase3.spec.ts` | Unpaired ficha expects **zero** hreflang (old contract was a lone self-tag) |
| `docs/i18n/DECISIONS.md` | Phase 2 A3 entry appended |

**Not edited (A5 / A6 / A4):** `astro.config.mjs`, `scripts/generate-sitemap.mjs`, `public/robots.txt`, `src/client/interface-lang.js`, WebVitals loading, other catalog JSON, `public/_redirects`. Build-time writes to `public/sitemap_index.xml` / `public/news-sitemap.xml` / `public/data/catalog-index.json` were reverted so A3 does not ship A5-owned artifacts.

---

## 2. Reference-page pattern for A4 / A5

Copy these two pages. Do not invent a second pair map.

### A4 — add an English catalog page

1. On the existing Spanish catalog JSON, add `i18n.en`:
   - `path` starting with `/en/` and ending with `/` (section map in ARCHITECTURE.md §2)
   - `title` (≤60, brand the same way the Spanish title does)
   - `description` (≤150, English search terms: banknote / notaphily, not *billetes*)
   - Human-authored `template` for hubs/static pages: same HTML/CSS as Spanish `template`, visible text translated, `lang="en"` on the wrapper, `data-pagefind-meta` url = the English path
   - Optional `ogTitle` / `ogDescription` / `recordTitle` / `eyebrow`
2. On hub cards: `titleEn` / `altEn` / `groupEn` / `groupKickerEn`. Keep Spanish `href` until the ficha itself has `i18n.en`.
3. Do **not** edit `src/i18n/pairs.ts`. `fromCatalog()` registers the pair at module init. Duplicate conflicting `es`/`en` paths throw.
4. Route: `src/pages/en/collection/[...slug].astro` already emits every catalog entry with `i18n.en`. For other sections, add `src/pages/en/<english-prefix>/[...slug].astro` with the same `getStaticPaths` filter (`data.i18n?.en`, prefix from the English path). Put prefix **inside** `getStaticPaths` (Astro isolates that function).
5. Render `CatalogLayout` with `locale="en"` and pass **`i18n.en.template`**, never Spanish `template`. JSON-LD: `inLanguage: 'en'`, English breadcrumb URLs; `hasPart` may still point at Spanish fichas.
6. Unpaired links stay Spanish (honest partial coverage). Never publish Spanish body at an English URL.
7. Editorial later: parallel `blog-en` / `noticias-en` / `logros-en` collections; extend the registry with a content-derived `fromPosts()` analogue — still one map.

### A4 — add an English static page (homepage-style)

Follow `src/pages/en/index.astro`:

- `BaseHead` with `locale="en"` and English `path`
- `<html lang="en" data-page-locale="en">`
- Reuse chrome (`SiteHeader`, `SiteFooter`, …) with `locale="en"` so crawlers see baked English
- Keep the ES/EN pill until A6
- Skip link + `main#main-content`
- Seed or content-derived pair so BaseHead emits the hreflang cluster

### A5 — sitemap

- Import `allPairs()` from `src/i18n/pairs.ts`. Do not invent pairs.
- Paired URLs: English `<url>` + reciprocal `xhtml:link` hreflang (`es`, `en`, `x-default` → Spanish).
- Unpaired Spanish URLs: no `en` hreflang (canonical only, matching BaseHead).
- Do not edit BaseHead, robots, or GA in A3’s wake beyond the sitemap script A5 owns.

---

## 3. Deviations from ARCHITECTURE.md (with justification)

| Deviation | Why |
|---|---|
| EN Collection nav points at `/en/collection/colombia/`, not `/coleccion/` or unpaired `/en/collection/` | Allowed by the A3 brief. Collection **index** is unpaired in A3; Colombia is the only English catalog page. Documented in `SiteHeader.astro`. |
| Optional `src/pages/en/404.astro` | ARCHITECTURE.md §8 / §12.9: allowed as the document later middleware could `fetch`. `noindex`, not in `allPairs()`. |
| `locale` plumbing on PreFooter, CatalogRecordSurface, Breadcrumb, Citation, Feedback | Required so `/en/` HTML is not Spanish chrome. Still optional props; Spanish pages unchanged. |
| `e2e/catalog-phase3.spec.ts` unpaired hreflang assertion | Old test expected a lone self `hreflang="es"`. New SEO contract: unpaired = **zero** hreflang. |
| `Locale` type in both `pairs.ts` and `ui-i18n.ts` | `ui-i18n.ts` does not import `pairs.ts`, so chrome that only needs `t()` does not load every catalog JSON at module init. Values are identical (`'es' \| 'en'`). |
| EN homepage omits `SearchAction` | No `/en/search/` yet. ARCHITECTURE.md allows omitting `potentialAction` if it would be misleading. JSON-LD still `inLanguage: 'en'`. |
| Identical seed + catalog pairs merge instead of throwing | Colombia is both a seed pair and `i18n.en.path`. Same `{es,en,kind}` is a no-op merge; **conflicting** duplicates still throw. Lets A4 add `i18n.en` without deleting the seed. |
| `interface-lang.js` still forces `html lang="es"` after hydration | Known conflict, A6. A3 acceptance is `dist/` source HTML (`lang="en"` on `/en/` pages). |

No architectural improvisation: no Astro `i18n` config, no geo redirects, no `/en/coleccion/` alias, no Spanish URL renames, no sitemap/robots/GA edits, pill not replaced.

---

## 4. Verification

### Commands

```bash
npm run check    # astro check
npm run build    # includes mustache guard
```

Plus a Node sanity import of `src/i18n/pairs.ts` and inspection of `dist/`.

### Results (2026-08-18)

**`npm run check`:** 0 errors.

**`npm run build`:** success. 319 pages (316 Spanish + `/en/`, `/en/collection/colombia/`, `/en/404/`). Mustache guard passed. Pagefind discovered `es` + `en`.

**Pair registry (module init):**

- `allPairs()` length **2**: `/` ↔ `/en/` (`home`); `/coleccion/colombia/` ↔ `/en/collection/colombia/` (`collection`)
- `getPair('/en/collection/colombia')` (no trailing slash) resolves
- `alternateUrl('/contacto/', 'en')` is `undefined`
- `t('home', 'en') === 'Home'`

**`dist/` files:**

| Path | Status |
|---|---|
| `dist/en/index.html` | exists |
| `dist/en/collection/colombia/index.html` | exists |
| `dist/coleccion/colombia/index.html` | exists (Spanish path unchanged) |
| `dist/en/404/index.html` | exists, `noindex` |

**`astro.config.mjs`:** no `i18n` key. `compressHTML: false` kept.

**hreflang (paired — full cluster, `x-default` → Spanish):**

- `/` and `/en/`: `es` → `https://notofilia.com/`, `en` → `https://notofilia.com/en/`, `x-default` → `https://notofilia.com/`
- `/coleccion/colombia/` and `/en/collection/colombia/`: `es` → `https://notofilia.com/coleccion/colombia/`, `en` → `https://notofilia.com/en/collection/colombia/`, `x-default` → `https://notofilia.com/coleccion/colombia/`

**hreflang (unpaired — zero tags):** `dist/contacto/index.html` has canonical only. `dist/404.html` has `noindex` and no hreflang.

**English Colombia hub:** `html lang="en"`. Title `Colombia Banknote Catalog | Notofilia` (37 chars). h1 `Colombia Banknote Catalog`. Does **not** contain the Spanish h1 “Catálogo de Billetes de Colombia”. Canonical `https://notofilia.com/en/collection/colombia/`. `og:locale` `en_US` + alternate `es_ES`.

**English homepage:** `html lang="en"`. Title `Notofilia: Banknotes and Numismatics | Catalog` (≤60). Meta description English, ≤150. h1 `A private collection of historical banknotes and coins`. JSON-LD `inLanguage: "en"`. Hero still `/uploads/` + `<picture>` + `srcset`. `<base href="/" />` present. No `<meta name="keywords">`. No `{{` / `[object Object]`.

**Images:** English pages reuse `/uploads/` sources, `<picture>` / `srcset`, and catalog-zoom from the existing layout. Alt text is English (`titleEn` / `altEn` / hero `altEn`).

**Spanish homepage:** `html lang="es"`, canonical `https://notofilia.com/`, no redirect to `/en/`.
