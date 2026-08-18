# i18n architecture — notofilia.com

**Status:** binding (Phase 1, Agent A2)
**Date:** 2026-08-18
**Stack:** Astro `^7.2.2`, static output, Cloudflare Pages (`wrangler.jsonc` → `dist/` + `functions/`)
**Config that must not change for i18n:** `trailingSlash: 'ignore'`, `compressHTML: false`, `build.format: 'directory'` (`astro.config.mjs`).

Spanish stays at today’s root URLs. English is a second, partial tree under `/en/` with **translated slugs**. Untranslated pages have no English URL and no `en` hreflang. Never ship machine-translated stubs.

---

## 1. Decision: manual `/en/` tree — do not enable Astro `i18n`

**Chosen approach:** a plain `src/pages/en/` directory plus a pair registry. **Do not add an `i18n` key to `astro.config.mjs`.** Not even `routing: 'manual'`.

### Why built-in Astro i18n cannot deliver translated slugs here

Fetched and checked against Astro 7 (not 4/5):

- [Internationalization (i18n) Routing](https://v7.docs.astro.build/en/guides/internationalization/)
- [Add i18n features (recipe)](https://v7.docs.astro.build/en/recipes/i18n/)
- [Configuration reference — `i18n`](https://docs.astro.build/en/reference/configuration-reference/#i18n)
- [Internationalization API (`astro:i18n`)](https://v7.docs.astro.build/en/reference/modules/astro-i18n/)

Astro’s built-in router **prefixes the same path**. The docs require the file tree and the URL tree to match per locale:

- `src/pages/about.astro` → `/about/`
- `src/pages/fr/about.astro` → `/fr/about/`

`prefixDefaultLocale: false` plus `defaultLocale: 'es'` would therefore produce:

| Spanish file | Spanish URL (kept) | English file Astro would expect | English URL Astro would generate |
|---|---|---|---|
| `src/pages/coleccion/index.astro` | `/coleccion/` | `src/pages/en/coleccion/index.astro` | `/en/coleccion/` |
| `src/pages/noticias/...` | `/noticias/` | `src/pages/en/noticias/...` | `/en/noticias/` |

That is **not** `/en/collection/` or `/en/news/`. `getRelativeLocaleUrl('en', 'coleccion')` would also emit `/en/coleccion/`. Astro does not remap path segments.

The official recipe for **translated routes** is a **hand-rolled map** (`routes.fr.services = 'prestations-de-service'`), not the `i18n` config ([recipe: Translate Routes](https://v7.docs.astro.build/en/recipes/i18n/#translate-routes)). That recipe still assumes you own the files at the translated paths.

This repo already has the Spanish tree at the root (`src/pages/coleccion/`, `src/pages/[section]/`, `src/pages/glosario/`, …). Enabling the i18n router on top of that is how Spanish URLs get rewritten. See §11.

### What A3 actually implements for “routing”

Create files under `src/pages/en/`. Leave `astro.config.mjs` without `i18n`. File-based routing plus `getStaticPaths` is enough.

`src/pages/[section]/index.astro` only emits `blog` and `noticias`. A static `src/pages/en/` directory wins over that dynamic param. **Never** add `'en'` to `COLLECTIONS` in `src/lib/collections.ts`.

---

## 2. URL rules

### Canonical shape

- Store and emit paths **with a trailing slash**, except the Spanish homepage which is `/`.
- English homepage canonical is `/en/` (not `/en`).
- `trailingSlash: 'ignore'` + `build.format: 'directory'` already emits `path/index.html`, so Cloudflare Pages serves both `/en` and `/en/`. **Canonicals, hreflang, sitemap, and internal links always use the slashed form.**
- Match existing helpers: `scripts/generate-sitemap.mjs` `add()` and catalog `path` fields already normalize to a trailing slash.
- Keep `<base href="/" />` in `src/components/BaseHead.astro` so nested `/en/...` pages resolve `/uploads/`, `/support.js`, and header links from the origin root.

### Section-segment map (binding)

Leaf slugs (piece ids, post ids, glossary terms) come from content + `docs/i18n/AUDIT.md` §6 when that table exists. **Section prefixes are fixed here:**

| Spanish prefix | English prefix | Notes |
|---|---|---|
| `/` | `/en/` | Homepages |
| `/coleccion/` | `/en/collection/` | Hub + records |
| `/coleccion/numismatica/` | `/en/collection/numismatics/` | Coins hub |
| `/noticias/` | `/en/news/` | Index + posts |
| `/blog/` | `/en/blog/` | Same word; still prefixed with `/en/` |
| `/logros/{slug}/` | `/en/milestones/{slug}/` | No Spanish index (homepage strip; `/logros/` already 301s in `public/_redirects`) |
| `/glosario/` | `/en/glossary/` | Index + terms |
| `/editorial/` | `/en/editorial/` | |
| `/contacto/` | `/en/contact/` | |
| `/buscar/` | `/en/search/` | Utility; stays `noindex`; not in sitemap |
| `/politica-privacidad-cookies/` | `/en/privacy-cookies/` | |
| `/j-s-g-boggs/` | `/en/j-s-g-boggs/` | Proper noun; do not translate |

A3 reference pair (must exist in the registry):

- `/` ↔ `/en/`
- `/coleccion/colombia/` ↔ `/en/collection/colombia/`

Proper nouns and catalog identifiers (Colombia, Cartagena, Pick/Friedberg/HT numbers, NGC/PCGS) stay unchanged inside slugs and body copy. Glossary English slugs are `slugify(termEn)` from `src/content/glosario/` (existing `slugifyGlossary` in `src/lib/glossary.ts`).

### Partial coverage

An English URL exists only when a pair is registered **and** the English page is a complete translation (title, meta description, headings, body, alt, JSON-LD). Missing counterpart → no `/en/` route, no `hreflang` cluster. Spanish URL unchanged.

No geo redirects. No `Accept-Language` redirects. Do not use `Astro.preferredLocale` (that API exists only with Astro i18n anyway). A later dismissible suggestion banner is the maximum.

---

## 3. Content strategy

Partial coverage is the default. Do **not** put English files inside Spanish collection globs (`src/content/blog/**`, `noticias/**`, `logros/**`, `catalog/**` JSON ids). `src/content.config.ts` uses `glob({ pattern: '**/[^_]*.md' })` / `*.json` — a nested `en/` folder would be ingested as extra Spanish entries.

### Catalog (one JSON entry, optional English block)

Keep the single `catalog` collection (`src/content/catalog/*.json`, `path` always `/coleccion/.../`). Add an **optional** `i18n.en` object on the same entry when that record is translated:

```ts
i18n: z.object({
  en: z.object({
    path: z.string().startsWith('/en/').endsWith('/'),
    title: z.string(),
    description: z.string(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    /** Required to publish EN for astro-hub / astro-static pages. Human-authored HTML. */
    template: z.string().optional(),
    recordTitle: z.string().optional(),
    eyebrow: z.string().optional(),
  }),
}).optional()
```

Extend hub cards with optional `titleEn`, `altEn`, `groupEn`, `groupKickerEn`. Images (`image`, `imageWebp`, `src`, `srcWebp`) stay shared.

**Do not duplicate catalog JSON.** Record ids, citations, honesty fields, and scans live once. English is overlay copy + a translated `path`.

Publishing rule: `i18n.en` is absent → no English route. `i18n.en` present without a real English `template` on `astro-hub` / `astro-static` → **do not publish** (that would wrap Spanish body in English chrome, which is forbidden). `render: 'primary'` pages may omit `template` and instead translate structured `record` fields (`titleEn`, `contextEn`, `altEn`).

Spanish `template` HTML is never `set:html`’d on an English URL.

A3 is allowed to add `i18n.en` **only** on `src/content/catalog/colombia.json` (the reference hub). That includes a human-authored English hub narrative (the current Spanish `template` is a long Independencia → Banco de la República essay). Reuse phrases from `src/i18n/catalog-es-en.json` where they already exist; do not machine-translate the rest.

Card `href`s on the English hub: `alternateUrl(card.href, 'en') ?? card.href`. Untranslated fichas keep their Spanish URLs. That is partial coverage, not a stub.

### Editorial posts (A4+, not A3)

Parallel collections, not locale subfolders and not `titleEn` on the Spanish file as the body:

| Spanish | English |
|---|---|
| `src/content/blog/` | `src/content/blog-en/` |
| `src/content/noticias/` | `src/content/noticias-en/` |
| `src/content/logros/` | `src/content/logros-en/` |

English schema = existing `postSchema` plus `pairEs: z.string()` (Spanish path, e.g. `/noticias/some-slug/`). English filename/slug may differ. Register the pair only when the English markdown is complete. Spanish glob and `getPublishedPosts()` stay unchanged.

### Glossary (already bilingual)

Keep one file per term in `src/content/glosario/` (`termEs`, `termEn`, `definitionEn`, Spanish body). Future English term pages render `termEn` + `definitionEn` at `/en/glossary/{slugify(termEn)}/` and pair with `/glosario/{id}/`. A3 does not build this.

### Shared UI / glossary dictionary

`src/lib/ui-i18n.ts` (`UI`, `GLOSSARY_CATEGORY_EN`, `METADATA_LABEL_EN`, …) plus `src/content/glosario/` are the canonical ES↔EN word lists for chrome and numismatic terms. `src/lib/html-i18n.ts` + `src/i18n/catalog-es-en.json` remain the **Spanish-page** phrase overlay for the existing client toggle. English URL pages do not rely on `data-i18n` for their primary copy.

---

## 4. String / UI translation

**Evolve `src/lib/ui-i18n.ts`. Do not add a second dictionary** such as `src/i18n/ui.ts`.

Add:

```ts
export type Locale = 'es' | 'en';

export function t(key: keyof typeof UI, locale: Locale): string
```

`t()` reads the existing `{ es, en }` entries. Special-case the two unpaired strings (`cookiesBody` / `cookiesBodyEn`) so callers still use `t('cookiesBody', locale)`.

Add `useTranslations(locale)` as `const t = (key) => t(key, locale)` if needed by Astro components.

English pages pass `locale="en"` into header/footer/catalog chrome and call `t(key, locale)` at build time so the HTML source is English (crawlers, no-JS, a11y). Do not wrap those English strings in `data-i18n` on `/en/` pages — the current toggle would fight baked English.

Spanish pages keep today’s `data-i18n` / `src/client/interface-lang.js` behavior until A6 replaces the same-URL toggle with a link switcher. **A3 does not replace that toggle.**

`localeFromPath(pathname)` lives in the pair module (below), not in a third place.

---

## 5. Pair registry — one source, three consumers

**Module:** `src/i18n/pairs.ts`

This is the only map of ES URL ↔ EN URL. Consumers:

1. `BaseHead` hreflang
2. Language switcher (A6; A3 may call the helpers for nav hrefs on the two reference pages)
3. Sitemap (A5: `scripts/generate-sitemap.mjs` imports this module — A3 does not edit the sitemap script)

### Shape

```ts
export type Locale = 'es' | 'en';

export type PairKind =
  | 'home'
  | 'collection'  // hubs under /coleccion/ and /en/collection/
  | 'catalog'     // individual fichas
  | 'news'
  | 'blog'
  | 'milestones'
  | 'glossary'
  | 'static';

export type Pair = {
  /** Spanish pathname, trailing slash (`/` for home). */
  es: string;
  /** English pathname, trailing slash (`/en/` for home). */
  en: string;
  kind: PairKind;
};
```

A3 seeds **exactly** these pairs (plus any other page A3 actually ships in English):

```ts
{ es: '/', en: '/en/', kind: 'home' }
{ es: '/coleccion/colombia/', en: '/en/collection/colombia/', kind: 'collection' }
```

Later agents **append** pairs as they publish translations. Prefer generating catalog/post/glossary pairs from content (`i18n.en.path`, `pairEs`, glossary slugs) so the array cannot drift. A3 may start with a handwritten `SEED_PAIRS` constant and a `fromCatalog()` that reads `i18n.en`.

### APIs (binding)

All path arguments are normalized (strip query/hash; add trailing slash; `/en` → `/en/`).

| Function | Behavior |
|---|---|
| `getPair(pathname)` | Pair where `es` or `en` equals the path; else `undefined`. |
| `alternateUrl(pathname, locale)` | `pair[locale]` or `undefined` — **no fallback**. Used for hreflang (omit the tag when undefined). |
| `allPairs()` | Every pair. Sitemap + tests. |
| `localeFromPath(pathname)` | `'en'` if path is `/en/` or starts with `/en/`; else `'es'`. |
| `switchUrl(pathname, locale)` | Exact alternate if paired; else section index if that index is paired; else homepage of `locale` (`/` or `/en/`). Used by the switcher so it never 404s. |

Section fallback examples (once those indexes are paired):

- `/coleccion/ecuador/` + `en` → `/en/collection/` if that pair exists, else `/en/`
- `/en/news/some-post/` + `es` → `/noticias/some-post/` if paired, else `/noticias/`, else `/`

Until `/en/collection/` exists, `switchUrl('/coleccion/ecuador/', 'en')` returns `/en/`.

Build a `Map` for `es` and a `Map` for `en`. Duplicate `es` or `en` paths **throw at module init** (fail the build). Every `en` value must start with `/en/`.

A3 (and later) must not hardcode counterpart URLs in layouts, sitemap, or the switcher.

---

## 6. Head / SEO contract

Evolve `src/components/BaseHead.astro`. Keep the current props; add locale + alternates. Layouts set `<html lang>`.

### `BaseHead` props

| Prop | Role |
|---|---|
| `title` | `<title>` (still ≤60 chars via `titleTag()`; English titles use the same helper) |
| `description` | meta description (≤150 via `metaDescription()`) |
| `path` | **this** page’s pathname (with slash). Canonical = `absoluteUrl(path)`. Self-referencing. Never point canonical at the other language. |
| `locale` | `'es' \| 'en'` — required. Drives `og:locale` (`es_ES` / `en_US`). |
| `robots` | unchanged |
| `ogType`, `ogTitle`, `ogDescription`, `ogImage` | unchanged |
| `jsonLd` | caller passes graph with `inLanguage` matching `locale` |
| `author`, `loadDcRuntime` | unchanged |
| default slot | extra links only; **do not** keep per-page handwritten hreflang once BaseHead owns the cluster |

**Remove** the ad-hoc `<link rel="alternate" hreflang="es">` currently slotted from `src/pages/index.astro` and `src/layouts/CatalogLayout.astro`. BaseHead emits the cluster itself:

```
getPair(path) present:
  <link rel="alternate" hreflang="es" href="{absoluteUrl(pair.es)}" />
  <link rel="alternate" hreflang="en" href="{absoluteUrl(pair.en)}" />
  <link rel="alternate" hreflang="x-default" href="{absoluteUrl(pair.es)}" />

getPair(path) absent:
  no hreflang tags (canonical only)
```

`x-default` is **always the Spanish URL**. Unpaired Spanish pages: canonical only, no lone `x-default` and no lone `hreflang="es"` (today’s homepage/catalog self-tags without `en` go away on those pages until they are paired; the two A3 pairs are paired, so they get the full cluster).

Also emit `og:locale:alternate` for the other locale when a pair exists.

`WebVitals` stays in BaseHead on **both** trees. Language for analytics is the path (`/en/...`). A3 does not touch GA, consent, or `functions/`.

### `html lang`

Every document that A3/A4 introduce under `/en/` must have:

```html
<html lang="en" data-page-locale="en">
```

Spanish pages stay `lang="es"` (add `data-page-locale="es"` when touching a layout so A6 can read it).

Layouts that currently hardcode `lang="es"` (`src/layouts/CatalogLayout.astro`, `src/layouts/BlogLayout.astro`, plus standalone pages) take a `locale` prop. **English URL pages flip `html lang` to `en`.** This supersedes the CLAUDE.md line that forbade flipping `lang` until a full `/en/` tree existed — that tree now exists as a partial, real translation, and the document language must match the URL.

Known conflict (A3 does not fix the script; A6 must): `src/client/interface-lang.js` currently does `document.documentElement.lang = 'es'` on every page. Built HTML for `/en/` is still `lang="en"` (what crawlers see). After JS, AT users on `/en/` would hear `es` until A6 respects `data-page-locale` / `localeFromPath`. A3 acceptance is **source HTML in `dist/`**, not post-toggle DOM.

---

## 7. Route tree A3 creates

```
src/pages/en/index.astro
src/pages/en/collection/[...slug].astro
```

Optional noindex helper (not in sitemap, not a pair): `src/pages/en/404.astro` — see §8.

`src/pages/en/collection/[...slug].astro` mirrors `src/pages/coleccion/[...slug].astro` but:

- `getStaticPaths` **only** entries with `data.i18n?.en`
- `params.slug` from `i18n.en.path` (`'/en/collection/colombia/'` → `'colombia'`)
- renders `CatalogLayout` with `locale="en"`, English title/description/jsonLd, English `template`, Spanish `template` unused
- `path={page.data.i18n.en.path}`

Do **not** introduce `src/pages/[lang]/...` — it would collide with `[section]`.

Reuse `CatalogLayout.astro` + `CatalogHubGrid` / media. Pass `locale`. Do not fork the layout into `CatalogLayoutEn.astro`.

Homepage: `src/pages/en/index.astro` is a real English page (English `<title>`, description, `h1`, definitions, JSON-LD `inLanguage: 'en'`). Reuse `HomeHero`, `HomeStatsBar`, `HomeBrowseStrip`, etc. with a `locale` prop rather than copying markup. Hero `alt` must be English. Collection CTAs that have no EN counterpart link to Spanish URLs (honest). News/blog strips: do not invent English titles; either omit in A3 or list Spanish posts with `lang="es"` on the title and Spanish hrefs. Definitions of numismatics/notaphily already have curated English in `src/pages/index.astro` — bake those via `t()` / existing copy, do not run them through a translator.

---

## 8. 404 under `/en/`

Cloudflare Pages serves a **single** `404.html` (from `src/pages/404.astro`) for every miss. That file is prerendered; `Astro.url` at build time is `/404`, so it cannot know the request was `/en/missing`.

**Binding:**

1. Keep `src/pages/404.astro` as the Pages 404 document (`robots: noindex`). Canonical path stays `/404` (or omit from sitemap — already omitted).
2. Add a **404-only** inline boot (not a replacement of `interface-lang.js`) that reads `location.pathname`: if it starts with `/en/`, set `document.documentElement.lang = 'en'`, paint existing `data-en` strings (the 404 already has them), and point CTAs at `/en/` and, if paired, `/en/collection/colombia/` (else `/en/`).
3. Optional later (A6 / functions): `functions/_middleware.js` already logs 404s. It may `fetch('/en/404/')` and return that HTML for `/en/*` misses. A3 must **not** add Accept-Language logic there. A3 may add `src/pages/en/404.astro` (`noindex`, not in `allPairs()`) as the document that middleware would serve.

No `/en/404/` in the sitemap. No hreflang on 404.

---

## 9. Trailing slashes (consistency)

| Surface | Rule |
|---|---|
| Pair registry | always slashed (`/en/collection/colombia/`) |
| `BaseHead` `path` | same |
| In-page `href` | same (`href="/en/"`, not `href="/en"`) |
| Sitemap (A5) | same normalization as today’s `add()` |
| `public/_redirects` | when A5/A6 add English aliases, list both slash variants like existing Spanish rules |

Do not set `trailingSlash: 'always'` — that is a site-wide behavior change. `ignore` + directory output already matches current Spanish URLs.

---

## 10. Catalog images, srcset, lightbox

English catalog pages reuse the same `/uploads/` files, `<picture>`, `srcset`, `CatalogMedia.astro`, and `/catalog-zoom.js`. Do not change widths, WebP/JPEG fallbacks, or lightbox markup.

Translated **alt** only:

- `catalogImageSchema`: optional `altEn`
- hub cards: optional `altEn`
- `CatalogMedia` already computes `altEn` via `lookupEn()` — on `locale === 'en'` use `altEn ?? lookupEn(alt) ?? alt` as the **visible** `alt` (not a `data-en` swap)
- Hero/homepage: English `alt` on `/en/`

There is no `cdn-cgi/image` usage in this repo today; local responsive WebP is the pipeline. Do not introduce a second image host as part of i18n.

`withI18nMarkup()` stays on **Spanish** catalog HTML only. English pages render English `template` / Astro components; they must not wrap Spanish templates in `data-i18n`.

Mustache guard: `scripts/check-unresolved-mustache.mjs` scans all `dist/**/*.html`. English templates must ship fully rendered. No `{{...}}`, no leftover `t('nav.home')` in HTML.

---

## 11. Risks if A3 enables Astro `i18n` anyway

Do not. If it happens, these are the failure modes:

1. **Spanish URLs move or 404.** `prefixDefaultLocale: true` makes unprefixed routes 404 unless fallback is on ([docs](https://v7.docs.astro.build/en/guides/internationalization/#prefixdefaultlocale-true)). `redirectToDefaultLocale: true` can 302 `/` to `/es/` and destroy every indexed Spanish URL.
2. **Wrong English slugs.** Default i18n yields `/en/coleccion/`, `/en/noticias/` — not the translated tree. Search Console would see a duplicate Spanish-slug tree under `/en/`.
3. **Middleware rewrites missing `/en/*` to Spanish.** `i18n.fallback` “ensures that a page is built in `src/pages/fr/` for every page that exists in `src/pages/es/`” and can **rewrite** Spanish HTML onto the English URL (`fallbackType: "rewrite"`) ([docs](https://v7.docs.astro.build/en/guides/internationalization/#fallback)). That publishes Spanish body at `/en/...` — forbidden, and it would look like a translation to crawlers.
4. **Localized-URL verification.** Astro’s i18n middleware “verifies that a localized URL corresponds to a valid route” ([docs](https://v7.docs.astro.build/en/guides/internationalization/#routing-logic)). `/en/collection/` may be treated as invalid because the default-locale file is `coleccion`, not `collection`.
5. **Accept-Language temptation.** `Astro.preferredLocale` is documented for on-demand pages. Using it for redirects is forbidden by product rules.
6. **Collision with `[section]`.** A locale folder named `en` plus a dynamic `[section]` is easy to mis-wire so `/en/` becomes a blog section.
7. **`getRelativeLocaleUrl` lies.** Helpers would generate `/en/coleccion/` links in nav, bypassing the pair registry.

`routing: 'manual'` only disables that middleware; it does not add translated slugs. Skip the whole `i18n` config.

---

## 12. File-by-file plan for Agent A3

A3 scope: routing (manual tree only), pair registry, `t()`, shared SEO head, `html lang`, **one** English homepage and **one** English catalogue hub. A3 does **not** translate remaining content, does **not** edit `scripts/generate-sitemap.mjs` / `robots.txt` / GA, and does **not** replace the ES/EN pill toggle.

### Ordered work

1. **`src/i18n/pairs.ts`** (new)
   - Types, `SEED_PAIRS`, `getPair`, `alternateUrl`, `allPairs`, `localeFromPath`, `switchUrl`, duplicate-path guard.
   - Acceptance: importing the module in `astro check` / a tiny node test lists exactly the A3 pairs; `getPair('/en/collection/colombia')` (no slash) resolves; `alternateUrl('/contacto/', 'en')` is `undefined`.

2. **`src/lib/ui-i18n.ts`**
   - Export `Locale`, `t()`, keep `UI` as the dictionary.
   - Acceptance: `t('home', 'en') === 'Home'`; `t('home', 'es') === 'Inicio'`; no new parallel `ui.ts`.

3. **`src/content.config.ts` + `src/content/catalog/colombia.json`**
   - Optional `i18n.en` on catalog schema.
   - Human English hub copy + `path: '/en/collection/colombia/'` on Colombia only.
   - Acceptance: `astro check` passes; other catalog JSON unchanged.

4. **`src/components/BaseHead.astro`**
   - `locale` prop; canonical from `path`; hreflang cluster from `getPair(path)`; `og:locale` / `og:locale:alternate`; keep `WebVitals`, `<base href="/">`, fonts, robots.
   - Delete slotted duplicate hreflang from homepage + CatalogLayout (those files in later steps).
   - Acceptance: unpaired pages in `dist/` have `<link rel="canonical">` and **zero** `hreflang`; paired pages have `es`, `en`, `x-default` → Spanish URL; canonical is self.

5. **`src/layouts/CatalogLayout.astro`**
   - `locale` prop (default `'es'`); `<html lang={locale} data-page-locale={locale}>`; pass `locale` into BaseHead; on `en` inject `i18n.en.template` (not Spanish `template`); skip `withI18nMarkup` for `en`.
   - Acceptance: Spanish `/coleccion/colombia/` HTML in `dist/` is unchanged in `lang` and canonical path; English page does not contain the Spanish h1 “Catálogo de Billetes de Colombia”.

6. **`src/pages/en/collection/[...slug].astro`** (new)
   - `getStaticPaths` from catalog entries with `i18n.en`.
   - English JSON-LD (`inLanguage: 'en'`, EN URLs in breadcrumbs; `hasPart` may still point at Spanish fichas).
   - Acceptance: `dist/en/collection/colombia/index.html` exists; `html lang="en"`; canonical `https://notofilia.com/en/collection/colombia/`; images still `<picture>` + same `/uploads/` srcs; `/catalog-zoom.js` still loaded if the layout loads it today; no `{{`.

7. **`src/pages/en/index.astro`** (new) + minimal `locale` plumbing on Home* components as needed
   - English title/description/JSON-LD; `lang="en"`; pair `/` ↔ `/en/`.
   - Acceptance: `dist/en/index.html` is English in `<title>`, `h1`, meta description; hreflang cluster present; hero srcset untouched.

8. **`src/pages/index.astro` + `src/pages/coleccion/[...slug].astro`**
   - Pass `locale="es"` into BaseHead; stop slotting manual hreflang; do not change Spanish `path`s.
   - Acceptance: Spanish homepage canonical still `https://notofilia.com/`; `html lang="es"`; no redirect from `/` to `/en/`.

9. **`src/pages/404.astro`**
   - 404-only `/en/` path sniff for copy + CTA hrefs (see §8). Do not rewrite `interface-lang.js`.
   - Acceptance: `dist/404.html` still `noindex`; includes the boot script; Spanish 404 copy still in the HTML source.

10. **QA (required)**
    - `npm run check` (`astro check`)
    - `npm run build` (includes mustache guard)
    - Inspect `dist/en/index.html` and `dist/en/collection/colombia/index.html`
    - Confirm `dist/coleccion/colombia/index.html` still exists at the same path
    - Confirm no `i18n` key in `astro.config.mjs`

### A3 must not

- Translate other catalog JSON, blog, noticias, glossary routes
- Edit `scripts/generate-sitemap.mjs`, `public/robots.txt`, GA / `WebVitals` loading rules
- Replace `#lang-es` / `#lang-en` with a link switcher
- Add Cloudflare redirects from `/en/coleccion/` (that URL must simply 404 until someone registers a pair — do not alias it to `/en/collection/`)
- Enable Astro `i18n` in config

---

## 13. What later agents consume

| Agent | Consumes | Adds |
|---|---|---|
| **A4 (content)** | Section-segment map (§2), catalog `i18n.en`, parallel `*-en` collections, glossary `termEn` slugs, `t()` for chrome, “no stubs” rule | Real translations; **appends pairs** via content fields, not a second map |
| **A5 (discovery)** | `allPairs()` | English `<url>` entries + `xhtml:link` hreflang in `scripts/generate-sitemap.mjs`; both trees; still no `/buscar/`; news sitemap language field stays `es` for Spanish noticias and `en` for English news when those exist |
| **A6 (switcher)** | `switchUrl()`, `getPair()`, `localeFromPath()`, `data-page-locale` | Replace same-URL pill with links to the counterpart (or section/home fallback). Fix `interface-lang.js` so it never forces `html lang="es"` on `/en/` pages. Still no Accept-Language redirects. |

A5/A6 must not invent pairs. If a URL is missing from `allPairs()`, it is unpaired.

---

## 14. Implementation notes (non-negotiable recap)

- Spanish root URLs are immutable.
- No Astro `i18n` config.
- One registry: `src/i18n/pairs.ts`.
- One chrome dictionary: `src/lib/ui-i18n.ts` + `t()`.
- Reciprocal `es` + `en` + `x-default`→Spanish **only** when `getPair()` hits.
- Self-canonical always.
- `html lang` matches the URL locale.
- Partial coverage; human English only.
- GA: keep `WebVitals`; path distinguishes language.
- Images/lightbox/srcset: reuse, translate alt only.
- QA on `dist/` HTML, not the dev server.
