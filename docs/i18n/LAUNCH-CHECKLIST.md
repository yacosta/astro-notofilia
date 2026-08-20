# Launch checklist — bilingual `/en/`

Human steps after merging `cursor/feat-bilingual-en-72d4` (intent: `feat/bilingual-en`).

QA (`docs/i18n/QA-REPORT.md`): **0 blockers**. Spanish root URLs unchanged. English tree is partial on purpose.

---

## 1. Merge and deploy

1. Merge the PR into `main`.
2. Deploy to a **Cloudflare Pages preview** first, then production (existing Worker/Pages project — do not rename the production Worker).
3. Confirm preview `/` still 200s with `html lang="es"` and `/en/` 200s with `html lang="en"`.
4. Confirm a Spanish catalog URL such as `/coleccion/colombia/` did not 301 to `/en/...`.

## 2. Google Search Console

1. Submit the updated sitemap (`https://notofilia.com/sitemap_index.xml` and `https://notofilia.com/sitemap.xml`).
2. URL Inspection on one live `/en/` URL (homepage and `/en/collection/colombia/`).
3. In rendered HTML, confirm:
   - no `{{…}}` / untranslated keys (this site has been burned by placeholders before)
   - `<link rel="canonical">` is the English URL
   - hreflang `es` + `en` + `x-default` → the Spanish URL
4. Do **not** set a GSC International Targeting “site language” that would imply the whole domain is English.

## 3. Cloudflare dashboard (manual — do not add these)

From A5 (`docs/i18n/A5-REPORT.md`):

| Item | Action |
|---|---|
| Bulk Redirects / Transform Rules on `Accept-Language` | **Do not add.** |
| Country / geo redirect to `/en/` | **Do not add.** |
| `/en/coleccion/` → `/en/collection/` alias | **Do not add** (that path should 404). |
| www → apex | Already OK (host-only). |

Repo already: no language-negotiation in `public/_redirects` or `functions/_middleware.js`. `/en/*` misses may serve `/en/404/` HTML with HTTP 404.

## 4. Analytics

There is **no GA4 measurement ID** in the repo. Cookie consent still gates `notofilia:cookies-accepted`. Web Vitals POST `/api/web-vitals` with `path` and `content_language` (`en` if the path is `/en` or `/en/…`).

When GA4 is added:

- Segment English as `page_path` starts with `/en/`, **or** a `content_language` custom dimension (`en` | `es`).
- Keep GA behind cookie consent.

## 5. Two weeks post-launch

1. GSC → International targeting / hreflang errors (or the current equivalent report).
2. Coverage of `/en/` (indexed vs discovered vs excluded).
3. Confirm Spanish URLs did not drop as duplicates of `/en/` counterparts.
4. Spot-check that unpaired fichas/noticias still have **no** hreflang.

## 6. Known deferred work (not launch blockers)

See `docs/i18n/TRANSLATION-TODO.md`:

- 61 individual noticias
- ~144 catalog fichas
- Remaining hubs (US obsolete, Federal Reserve, polymer, etc.)
- `/en/search/` (header search still posts to `/buscar/`)
- Collection-hub filter option labels still use Spanish `catalog-index.json` keys on `/en/collection/`
