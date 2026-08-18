# A6 report — language switcher & internal links

**Agent:** A6  
**Date:** 2026-08-18  
**Branch:** `cursor/feat-bilingual-en-72d4`  
**Binding docs:** `docs/i18n/ARCHITECTURE.md` §5, `docs/i18n/AUDIT.md` §3, A3/A4 reports

Spanish root URLs are unchanged. The same-URL “Idioma de la interfaz ES EN” pill is gone. The switcher is a server-rendered `<a href>` from `switchUrl()` in `src/i18n/pairs.ts`. No geo / Accept-Language redirects. No homepage JS that overrides a requested URL. No suggestion banner (skipped for CLS).

`npm run check` (astro check): **0 errors**. `npm run build`: **success**.

---

## 1. Fallback behavior (`switchUrl`)

Unchanged algorithm in `src/i18n/pairs.ts` (A3). The switcher never hardcodes counterparts.

1. **Exact pair** — `getPair(path)` hits → counterpart URL.
2. **Section index** — exact pair missing; longest `SECTION_INDEXES` prefix is itself paired → that section’s counterpart.
3. **Homepage** — otherwise `/` (target `es`) or `/en/` (target `en`). Never a 404.

When the href is not an exact pair, the link also gets `data-i18n-fallback="section"|"home"` and a `title` (“English version of this section” / “English homepage”, or the Spanish equivalents). No extra “(section)” visible label.

Examples after this build:

| From | EN (or ES) target | Why |
|---|---|---|
| `/` | `/en/` | exact home pair |
| `/en/` | `/` | exact home pair |
| `/coleccion/colombia/` | `/en/collection/colombia/` | exact collection pair |
| `/en/collection/colombia/` | `/coleccion/colombia/` | reverse |
| `/noticias/{slug}/` (unpaired article) | `/en/news/` | section `/noticias/` is paired |
| `/buscar/` | `/en/` | `/en/search/` is **not** paired (deferred); section prefix exists but `getPair('/buscar/')` is empty → home |
| `/404` | `/en/` | unpaired → home (`data-i18n-fallback="home"`) |
| `/en/404/` | `/` | unpaired → home |

---

## 2. Switcher HTML (from `dist/`)

Current locale is a `<span aria-current="page">`. The other language is the only `<a>`. Visible text is **ES** / **EN**; a visually hidden ` — Español` / ` — English` is **inside** the same element so the accessible name includes the visible letters (WCAG 2.5.3). `hreflang` + `lang` on the link. Group label is “Idioma” / “Language” (`role="group"`, not a nested `<nav>`). Tap targets `min-width`/`min-height` 44px. `:focus-visible` outline.

Astro `data-astro-cid-*` attributes omitted below for readability.

### Spanish homepage — `dist/index.html`

```html
<html lang="es" data-page-locale="es">
…
<div class="site-header__lang" role="group" aria-label="Idioma">
  <span class="site-header__lang-btn is-active" aria-current="page" lang="es">ES<span class="sr-only"> — Español</span></span>
  <a class="site-header__lang-btn" href="/en/" hreflang="en" lang="en">EN<span class="sr-only"> — English</span></a>
</div>
```

### English homepage — `dist/en/index.html`

```html
<html lang="en" data-page-locale="en">
…
<div class="site-header__lang" role="group" aria-label="Language">
  <a class="site-header__lang-btn" href="/" hreflang="es" lang="es">ES<span class="sr-only"> — Español</span></a>
  <span class="site-header__lang-btn is-active" aria-current="page" lang="en">EN<span class="sr-only"> — English</span></span>
</div>
```

Collection nav on that page: `<a class="site-header__coleccion-link" href="/en/collection/">Collection</a>`. Search form `action="/buscar/"` (honest; `/en/search/` still deferred).

### Colombia hub (exact pair)

`dist/coleccion/colombia/index.html`:

```html
<a class="site-header__lang-btn" href="/en/collection/colombia/" hreflang="en" lang="en">EN<span class="sr-only"> — English</span></a>
```

`dist/en/collection/colombia/index.html`:

```html
<a class="site-header__lang-btn" href="/coleccion/colombia/" hreflang="es" lang="es">ES<span class="sr-only"> — Español</span></a>
```

### Unpaired noticia (section fallback)

`dist/noticias/moneda-2-euros-grace-kelly/index.html`:

```html
<a class="site-header__lang-btn" href="/en/news/" hreflang="en" lang="en" title="English version of this section" data-i18n-fallback="section">EN<span class="sr-only"> — English</span></a>
```

### 404 (home fallback)

`dist/404.html` (`path="/404"`):

```html
<a class="site-header__lang-btn" href="/en/" hreflang="en" lang="en" title="English homepage" data-i18n-fallback="home">EN<span class="sr-only"> — English</span></a>
```

`dist/en/404/index.html` (`path="/en/404/"`):

```html
<a class="site-header__lang-btn" href="/" hreflang="es" lang="es" title="Inicio en español" data-i18n-fallback="home">ES<span class="sr-only"> — Español</span></a>
```

---

## 3. Old toggle removed

- Deleted `src/client/interface-lang.js`. Nothing else imported it. It is **not** in `dist/` JS and is not referenced from the header.
- `#lang-es` / `#lang-en` **buttons** are gone (grep on `dist/` is empty).
- No script forces `document.documentElement.lang = 'es'`. The only remaining assignment is the Spanish `404.astro` `/en/` path-sniff boot, which sets `lang` **and** `data-page-locale` to `'en'` when the request path starts with `/en/` (kept per mission). Built `/en/` HTML is already `lang="en"`; leftover JS no longer overwrites it.
- `data-i18n` attributes on Spanish pages were **left in place** (inert without the toggle; crawlers already see Spanish text).

### Hidden EN panels dropped (English lives under `/en/`)

| Spanish page | Removed | English URL |
|---|---|---|
| `src/pages/editorial/index.astro` | `data-lang-panel="en"` block | `/en/editorial/` |
| `src/pages/editorial/equipo.astro` | same | `/en/editorial/team/` |
| `src/pages/politica-privacidad-cookies.astro` | EN article + panel-toggle script | `/en/privacy-cookies/` |
| `src/components/PostArticle.astro` | hidden `translateMarkdown` English panel on Spanish posts | Spanish article = Spanish body only |

### `notofilia:interface-lang` / `data-interface-lang` listeners

Scripts now read `document.documentElement.lang` or `data-page-locale`. No localStorage language override.

Touched: `src/client/site-header.js`, `src/client/glossary-filter.js`, `public/coleccion-hub.js`, `CatalogCitation.astro`, `CatalogMedia.astro`, `Comments.astro`, `src/pages/index.astro` (hero labels), `contacto.astro`, `buscar/index.astro`. EN collection / glossary pages no longer set `data-interface-lang="en"`.

---

## 4. Header, footer, and EN internal links

`SiteHeader` takes required `path` (same pathname as BaseHead). Layouts (`BlogLayout`, `CatalogLayout`) and standalone pages pass it.

**`hrefFor` on EN pages:** `alternateUrl(pathPart, 'en') ?? href`, preserving `?` and `#`.

- Collection CTA: `/en/collection/` (A4 pair), **not** `/en/collection/colombia/`.
- `/#logros-heading` → `/en/#logros-heading`.
- Blog, news, glossary, contact, numismatics, Colombia, Puerto Rico, Ecuador, J.S.G. Boggs: paired English hrefs.
- Unpaired catalog fichas stay Spanish (honest).
- Search `action` stays `/buscar/` on both trees.

Chrome that already took `locale`, now using `alternateUrl` for EN hrefs:

- `CookieBanner.astro` → `/en/privacy-cookies/`
- `SiteFooter.astro` → `/en/editorial/`, `/en/privacy-cookies/`
- `CatalogFeedback.astro` → `/en/contact/`, `/en/editorial/#corrections`
- `HomeBrowseStrip.astro`, `HomeLogrosStrip.astro`, `HomeHero.astro` → collection via `alternateUrl('/coleccion/', 'en')`
- `SourceCredit.astro` + `NewWindowHint.astro` — locale-aware; EN homepage “Source:” / “(opens in a new tab)”
- `BlogLayout.astro` skip link: `t('skip', locale)` — EN pages bake **Skip to content** (`dist/en/blog/…`).

Audited A4 EN pages (collection index, glossary, blog, contact, editorial, privacy, Boggs, news index, homepage strips): header/footer/drawer hrefs go to EN pairs. Links from EN to a Spanish-only ficha or noticia remain allowed.

---

## 5. 404

- Spanish `src/pages/404.astro` keeps the `/en/` path-sniff boot. Collection CTA on the EN 404 uses `alternateUrl('/coleccion/', 'en')` → `/en/collection/`.
- Switcher: `/404` → `/en/`; `/en/404/` → `/`. Middleware may still serve `/en/404/` for `/en/*` misses (A5); no Accept-Language logic added.

---

## 6. Tests

- Deleted `e2e/interface-lang.spec.ts`.
- Added `e2e/language-switcher.spec.ts`: `<a href>` counterparts, noticia → `/en/news/`, 404 both trees, no localStorage, `html lang="en"` not overwritten, Collection nav, search `action`.
- `e2e/noticias-fuente.spec.ts`: Spanish “Fuente:” stays; EN news index link is `/en/news/`.

Playwright was not run in this environment (preview-based). Acceptance is built `dist/` HTML.

---

## 7. Files changed

**Removed**

- `src/client/interface-lang.js`
- `e2e/interface-lang.spec.ts`

**Added**

- `e2e/language-switcher.spec.ts`
- `docs/i18n/A6-REPORT.md` (this file)

**Header / chrome**

- `src/components/SiteHeader.astro`
- `src/client/site-header.js`
- `src/layouts/BlogLayout.astro`
- `src/layouts/CatalogLayout.astro`
- `src/components/CookieBanner.astro`
- `src/components/SiteFooter.astro`
- `src/components/HomeBrowseStrip.astro`
- `src/components/HomeHero.astro`
- `src/components/HomeLogrosStrip.astro`
- `src/components/HomePostStrip.astro`
- `src/components/SourceCredit.astro`
- `src/components/NewWindowHint.astro`
- `src/components/PostArticle.astro`
- `src/components/Comments.astro`
- `src/components/catalog/CatalogCitation.astro`
- `src/components/catalog/CatalogFeedback.astro`
- `src/components/catalog/CatalogMedia.astro`

**Pages**

- `src/pages/index.astro`, `src/pages/en/index.astro`
- `src/pages/404.astro`, `src/pages/en/404.astro`
- `src/pages/buscar/index.astro`, `src/pages/contacto.astro`
- `src/pages/coleccion/index.astro`, `src/pages/coleccion/numismatica/index.astro`
- `src/pages/en/collection/index.astro`, `src/pages/en/collection/numismatics/index.astro`
- `src/pages/en/glossary/index.astro`
- `src/pages/editorial/index.astro`, `src/pages/editorial/equipo.astro`
- `src/pages/politica-privacidad-cookies.astro`

**Other**

- `src/client/glossary-filter.js`
- `public/coleccion-hub.js`
- `e2e/noticias-fuente.spec.ts`
- `docs/i18n/TRANSLATION-TODO.md` (chrome leftovers: Collection nav / skip / Todos are done; search still deferred)
- `docs/i18n/DECISIONS.md` (Phase 4 A6 entry)

`pairs.ts` was not edited. A6 consumes `switchUrl` / `getPair` / `alternateUrl` only.

---

## 8. Verification checklist

- [x] `npm run check` and `npm run build` pass.
- [x] `dist/index.html` and `dist/en/index.html`: switcher is `<a href>`, not a button. ES home → `/en/`; EN home → `/`.
- [x] Colombia ES → `/en/collection/colombia/` and reverse.
- [x] Unpaired Spanish noticia → `/en/news/` (`data-i18n-fallback="section"`).
- [x] `interface-lang.js` not in dist / not referenced.
- [x] `html lang="en"` on EN pages; no leftover JS sets `lang="es"`.
- [x] EN Collection nav → `/en/collection/`.
- [x] Search stays `/buscar/`.
- [x] CookieBanner / footer privacy on EN → `/en/privacy-cookies/`.
- [x] BlogLayout EN skip → “Skip to content”.
- [x] No suggestion banner. No auto-redirects.

---

## 9. Not done (out of scope / deferred)

- `/en/search/` still does not exist; switcher from `/buscar/` falls back to `/en/` (section index `/en/search/` is unpaired).
- Individual noticias and unpaired fichas remain Spanish URLs from EN pages (A4 deferral).
- Optional dismissible language-suggestion `<aside>`: **skipped** (CLS).
- `data-i18n` attributes remain on Spanish chrome (inert).
