# A5 report — SEO plumbing / discovery

**Agent:** A5  
**Date:** 2026-08-18  
**Branch:** `cursor/feat-bilingual-en-72d4`  
**Binding docs:** `docs/i18n/ARCHITECTURE.md` §5 / §13, `docs/i18n/AUDIT.md` §5, A3 hreflang contract

Spanish root URLs are unchanged. English URLs are discovered from `allPairs()` in `src/i18n/pairs.ts` (A4 may append pairs while this agent runs). No RSS. No GA measurement ID invented. No Accept-Language / geo redirects.

---

## 1. What was implemented

### Sitemap (`scripts/generate-sitemap.mjs` + `scripts/load-pairs.mjs`)

- Prebuild still walks Spanish sources exactly as before (catalog JSON `path`, native pages, blog/noticias/logros, glossary).
- English `<loc>` values come from `allPairs()` (`pair.en`), loaded through `scripts/load-pairs.mjs` which **calls** `src/i18n/pairs.ts` via Node type stripping. The pair list is not duplicated.
- An English URL is emitted only when it is in `allPairs()` **and** `src/pages/en/` has a builder (`index.astro`, `*.astro`, `[slug].astro`, or `[...slug].astro`). Registry-only pairs (e.g. `/en/contact/` before that page exists) are not advertised as 404s.
- Reciprocal `xhtml:link` hreflang (`es`, `en`, `x-default` → Spanish) is attached only when **both** sides are in the sitemap. Matches BaseHead’s cluster shape. Unpaired Spanish URLs have no alternates.
- Omitted: `/buscar/`, `/en/search/`, `/404`, `/en/404/`.
- Homepage `/` priority `1.0`. English homepage `/en/` priority `1.0`, `changefreq` weekly. Other EN URLs inherit changefreq/priority from the Spanish counterpart when that loc exists.
- News sitemap: Spanish noticias stay `news:language` `es`. Paired English news articles under `src/content/noticias-en/` (with `pairEs`) would get `en`. `/en/news/` index is a regular sitemap URL, not Google News. This build: **0** articles in the 48-hour window (same as before A5).

`urlset` namespace: `xmlns:xhtml="http://www.w3.org/1999/xhtml"`.

### robots.txt

- Existing `Allow: /` and Disallows unchanged.
- Comment added: do not Disallow `/en`.
- No `Disallow: /en`.

### Structured data

- A5 does **not** own `BaseHead.astro`. A3 already emits `inLanguage` from page JSON-LD and `og:locale` from the `locale` prop.
- EN pages must keep passing `locale="en"` and JSON-LD `inLanguage: 'en'` (A3 contract). Sitemap does not fork JSON-LD.

### RSS

- **Not added.** Site remains sitemap-only. See DECISIONS.md and §4 below.

### Analytics / Web Vitals

- No gtag / GA4 ID in the repo; none invented.
- `src/client/web-vitals-bootstrap.js` now sends `content_language: 'en' | 'es'` (`/en` or `/en/…` → `en`).
- `functions/api/web-vitals.js` logs `content_language`.
- `WebVitals.astro` remains in BaseHead on both trees; comment documents the extra field.

### Cloudflare / 404

- `public/_redirects`: **no** language-negotiation rules and **no** new `/en/` aliases (including no `/en/coleccion/` → `/en/collection/`).
- `wrangler.jsonc`: no redirect / locale config.
- `functions/_middleware.js`: www→apex 301 unchanged. For `/en/*` misses (not `/en/404` itself), optionally serves prerendered `/en/404/` HTML via `env.ASSETS` with **HTTP 404**. No Accept-Language / geo logic.

---

## 2. Sitemap sample — ES/EN pairs

After `npm run build` (prebuild generated `public/sitemap.xml`, copied to `dist/`):

**416** `<url>` entries (**102** English). Pagefind indexed **416** pages (419 HTML − `/404` − `/buscar/` − `/en/404/`).

English locs at this prebuild: `/en/`, `/en/collection/` (+ colombia, ecuador, puerto-rico, numismatics), `/en/glossary/` + 95 terms. A4 is still landing more routes; the next prebuild will pick up new `pair.en` values that have a page builder.

### Homepage `/` ↔ `/en/`

```xml
<url>
  <loc>https://notofilia.com/</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://notofilia.com/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://notofilia.com/en/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://notofilia.com/" />
  <lastmod>2026-08-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
<url>
  <loc>https://notofilia.com/en/</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://notofilia.com/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://notofilia.com/en/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://notofilia.com/" />
  <lastmod>2026-08-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
```

### Collection hub `/coleccion/colombia/` ↔ `/en/collection/colombia/`

```xml
<url>
  <loc>https://notofilia.com/coleccion/colombia/</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://notofilia.com/coleccion/colombia/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://notofilia.com/en/collection/colombia/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://notofilia.com/coleccion/colombia/" />
  <lastmod>2026-08-14</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://notofilia.com/en/collection/colombia/</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://notofilia.com/coleccion/colombia/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://notofilia.com/en/collection/colombia/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://notofilia.com/coleccion/colombia/" />
  <lastmod>2026-08-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Unpaired example: `/contacto/` is in the sitemap with **no** `xhtml:link` (A4 registered `/en/contact/` in `SEED_PAIRS` but there is not yet `src/pages/en/contact.astro`). `/blog/` likewise has no EN builder yet.

---

## 3. robots.txt

`Allow: /` covers `/en/`. Disallows remain `/oauth/`, `/api/`, `/mcp`, `/mcp/`, and archived `.dc.html` fragments. Comment states not to Disallow `/en`.

---

## 4. RSS decision

There is **no** RSS/Atom feed today (AUDIT §1.5 / §5.4). **Do not add RSS as part of i18n.**

The site stays sitemap-only. If a feed is added later:

| Feed | Language |
|---|---|
| `/rss.xml` | Spanish |
| `/en/rss.xml` | English |

Do **not** invent a combined bilingual feed.

Logged in `docs/i18n/DECISIONS.md` (Phase 3 A5).

---

## 5. GA / analytics notes

**Finding (AUDIT §5.5, still true):** no `gtag.js`, no `G-XXXX`, no `googletagmanager.com` in source. Privacy policy and CookieBanner mention GA4; consent key is `notofilia_cookie_consent`. First-party RUM is Web Vitals → `POST /api/web-vitals`.

**Do not invent a measurement ID.**

Once GA4 is actually injected (Astro snippet **or** Cloudflare Zaraz / dashboard):

1. **Path prefix (no code change):** GA4 content group or filter `page_location` / `page_path` starts with `/en/` vs not.
2. **Recommended custom dimension:** `content_language` = `en` | `es`, from `localeFromPath(location.pathname)` or `document.documentElement.dataset.pageLocale`. Web Vitals already send this field; reuse the same rule when gtag lands (`content_language: location.pathname === '/en' \|\| location.pathname.startsWith('/en/') ? 'en' : 'es'`).
3. Cookie banner already gates analytics on `notofilia:cookies-accepted`. Keep GA behind that event; do not fire on `/en/` without consent.

WebVitals is loaded from BaseHead on both trees.

---

## 6. Cloudflare dashboard items for the human

**Repo is sufficient. Likely no dashboard change.** Confirm / do **not** add:

| Item | Action |
|---|---|
| Bulk Redirects / Transform Rules on `Accept-Language` | **Do not add.** Product rule: no language negotiation. |
| Country / geo redirect to `/en/` | **Do not add.** |
| `/en/coleccion/` → `/en/collection/` alias | **Do not add.** That URL should 404 until a pair exists. |
| www → apex | Already OK in `functions/_middleware.js` (and typically at the zone). Keep host-only. |
| Single Pages 404 | `dist/404.html` remains the global miss document. Middleware may swap body to `/en/404/` HTML for `/en/*` misses while keeping status 404. Requires `env.ASSETS` (Pages default). If ASSETS is missing, Spanish `404.html` still has A3’s `/en/` path-sniff boot. |
| Cloudflare Web Analytics / Zaraz GA | If enabled in the dashboard, `/en/` paths inherit it. Segment by path prefix until a measurement ID lives in the repo. |

`wrangler.jsonc` has no i18n or redirect keys. `public/_redirects` is legacy 301s to **Spanish** canonicals only.

---

## 7. Verification

```bash
npm run build   # prebuild runs generate-sitemap.mjs; mustache guard passed
```

| Check | Result |
|---|---|
| `npm run build` | Pass. 419 HTML pages; Pagefind 416; sitemap 416. |
| `/` ↔ `/en/` xhtml cluster | Present; `x-default` → `https://notofilia.com/`; both priority 1.0. |
| `/coleccion/colombia/` ↔ `/en/collection/colombia/` | Reciprocal `es` / `en` / `x-default`→Spanish. |
| `robots.txt` allows `/en/` | `Allow: /`; no `Disallow: /en`. |
| `_redirects` language negotiation | None. No `/en/` aliases. |
| `/buscar/`, `/en/404/` in sitemap | Absent. |
| News sitemap | Empty window (0 rows); generator still emits `news:language` `es` or `en` per loc when articles qualify. |

### Files touched (A5)

| File | Change |
|---|---|
| `scripts/load-pairs.mjs` | **New.** Imports `allPairs()` from `src/i18n/pairs.ts`. |
| `scripts/generate-sitemap.mjs` | EN locs + `xhtml:link`; news language; omit noindex. |
| `public/robots.txt` | Comment only. |
| `functions/_middleware.js` | Optional `/en/404/` HTML for `/en/*` misses. |
| `src/client/web-vitals-bootstrap.js` | `content_language`. |
| `functions/api/web-vitals.js` | Log `content_language`. |
| `src/components/WebVitals.astro` | Comment. |
| `docs/i18n/DECISIONS.md` | Append Phase 3 A5. |
| `docs/i18n/A5-REPORT.md` | This report. |
| `public/sitemap.xml`, `news-sitemap.xml`, `sitemap_index.xml`, `web-vitals.js` | Prebuild output. |

**Not edited (A4 / A3):** `src/i18n/pairs.ts`, `BaseHead.astro`, `src/pages/**` (no new pages), content collections, catalog JSON, `public/_redirects`.

### Note for A4

`SEED_PAIRS` currently includes `/en/blog/`, `/en/news/`, `/en/contact/`, `/en/editorial/`, `/en/privacy-cookies/`, `/en/j-s-g-boggs/` before those Astro files exist. Sitemap waits for the builder. **BaseHead still emits hreflang from `getPair()`** on those Spanish pages — prefer registering a pair only when the English route actually builds, so head and sitemap stay aligned.
