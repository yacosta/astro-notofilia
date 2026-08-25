# i18n audit — notofilia.com

**Date:** 2026-08-18  
**Auditor:** Agent A1 (Site Auditor)  
**Repo:** Astro 7.2 (`astro.config.mjs`), static output, Cloudflare Pages (`dist/` + `functions/`).  
**Site:** https://notofilia.com  
**Constraint:** Spanish stays at root URLs. English will live under `/en/` with translated slugs. This file is read-only relative to the rest of the tree (audit only).

**Non-negotiable:** do not rename, move, redirect, or delete existing Spanish routes.

---

## Snapshot

| Metric | Count | Notes |
|---|---|---|
| Built HTML routes | **316** | Includes `/404` and `/buscar/` |
| Sitemap URLs (`public/sitemap.xml`) | **314** | Omits `/404` and `/buscar/` (noindex) |
| Catalog collection JSON | **144** | `src/content/catalog/*.json` |
| Noticias (published) | **55** | `draft` none |
| Blog (published) | **9** | |
| Logros (published) | **0** | `placeholder.md` is `draft: true` |
| Glossary terms | **95** | all have `termEs` + `termEn` + `definitionEn` |
| Unique catalog path segments | **148** | including `coleccion` |
| ES→EN catalog dictionary keys | **5,427** | `src/i18n/catalog-es-en.json` (~1.2 MB) |
| Pagination | **none** | no `[page]` / `paginate()` |
| RSS / Atom | **none** | no `rss.xml` / `feed` |

**Sitemap arithmetic check:** 316 built HTML − `/404` − `/buscar/` = 314. Matches `public/sitemap.xml`.

---

## 1. Full route inventory

### 1.1 Astro page files (`src/pages/`)

There is **no** `src/pages/en/` tree today. All public HTML is Spanish-root.

| File | Built URL(s) | Content source | In sitemap? |
|---|---|---|---|
| `src/pages/index.astro` | `/` | Hardcoded Astro + `getPublishedPosts('noticias'\|'blog')` + `getCollectionStats()` + `FEATURED_ENTRIES` | yes (priority 1.0) |
| `src/pages/404.astro` | `/404` (Pages 404) | Hardcoded | **no** (`robots: noindex, follow`) |
| `src/pages/contacto.astro` | `/contacto/` | Hardcoded form (Web3Forms + Turnstile) | yes |
| `src/pages/politica-privacidad-cookies.astro` | `/politica-privacidad-cookies/` | Hardcoded ES + EN panels (`data-lang-panel`) | yes |
| `src/pages/j-s-g-boggs.astro` | `/j-s-g-boggs/` | Hardcoded HTML `template` string passed to `CatalogLayout` | yes |
| `src/pages/editorial/index.astro` | `/editorial/` | Hardcoded ES + EN panels | yes |
| `src/pages/editorial/equipo.astro` | `/editorial/equipo/` | Hardcoded ES + EN panels | yes |
| `src/pages/glosario/index.astro` | `/glosario/` | Collection `glosario` | yes |
| `src/pages/glosario/[slug].astro` | `/glosario/<id>/` × 95 | Collection `glosario`; `params.slug = entry.id` (filename) | yes |
| `src/pages/coleccion/index.astro` | `/coleccion/` | Hardcoded hub + `public/data/catalog-index.json` + `catalog-hub.ts` | yes |
| `src/pages/coleccion/numismatica/index.astro` | `/coleccion/numismatica/` | Hardcoded hub + coin catalog helpers (`coins-catalog.ts`) | yes |
| `src/pages/coleccion/[...slug].astro` | `/coleccion/<rest>/` × 144 | Collection `catalog`; slug = `page.data.path` minus `/coleccion/` prefix | yes (from JSON `path`) |
| `src/pages/buscar/index.astro` | `/buscar/` | Hardcoded Pagefind UI | **no** (intentional noindex) |
| `src/pages/[section]/index.astro` | `/blog/`, `/noticias/` | Collections via `COLLECTIONS`; **logros index excluded** | yes |
| `src/pages/[section]/[...slug].astro` | `/blog/<id>/` × 9, `/noticias/<id>/` × 55, `/logros/<id>/` if published | Markdown collections; `params.slug = post.id` | yes (drafts skipped) |

`getStaticPaths` for `[section]` only emits `blog` and `noticias` indexes (`logros` filtered out). Individual logros posts **would** build if a non-draft file existed. Today `src/content/logros/placeholder.md` is draft, so **zero** `/logros/<slug>/` pages. `public/_redirects` sends `/logros/` → `/` (301). Homepage strip is `/#logros-heading`.

**Trailing slash:** `astro.config.mjs` sets `trailingSlash: 'ignore'` and `build.format: 'directory'`. Canonicals in `BaseHead` use `absoluteUrl(path)` as passed by each page (almost all paths already end in `/`).

**`<base href="/">`:** emitted by `src/components/BaseHead.astro` on every document. Relative links resolve from the site root. This is load-bearing for nested routes today and will be a **risk for `/en/...` nested pages** if any relative hrefs remain.

### 1.2 Content collections (`src/content.config.ts`)

| Collection | Loader | Schema | URL pattern |
|---|---|---|---|
| `noticias` | `src/content/noticias/**/[^_]*.md` | `postSchema` + required `source` + `sourceUrl` | `/noticias/<filename>/` |
| `blog` | `src/content/blog/**/[^_]*.md` | `postSchema` | `/blog/<filename>/` |
| `logros` | `src/content/logros/**/[^_]*.md` | `postSchema` | `/logros/<filename>/` (none published) |
| `catalog` | `src/content/catalog/**/[^_]*.json` | `path`, `title`, `description`, SEO fields, `template`, `logic`, `record?` | **`data.path` is the URL**, not the filename |
| `glosario` | `src/content/glosario/**/[^_]*.md` | `termEs`, `termEn`, `definitionEn`, `category`, `source`, `seeAlso`, `aliases`, `wikipediaUrl?` | `/glosario/<filename>/` |

Catalog JSON `path` is constrained: `z.string().startsWith('/coleccion/').endsWith('/')`.

Catalog kinds in the 144 records: **106 banknote**, **16 profile**, **15 other** (hubs), **7 coin**.

### 1.3 Editorial slugs (complete)

**Blog (9):** `como-empezar-coleccion-billetes`, `como-identificar-billetes-falsos`, `diferencia-numismatica-notafilia`, `mylar-si-plastico-no-como-guardar-billetes`, `numeros-serie-especiales-billetes`, `origenes-banca-comercial-colombia-banca-libre`, `origenes-banca-comercial-puerto-rico`, `personajes-billetes-colombia`, `tres-imprentas-misterio-pie-imprenta-billetes-colombianos`.

**Noticias (55):** see Appendix B.

**Logros:** `placeholder` only (`draft: true`). Not built, not in sitemap.

**Glossary (95):** see Appendix E (filename = public slug).

**Catalog (144):** see Appendix A. Filename is **not** the URL (e.g. `colombia.json` → `/coleccion/colombia/`; `state-bank-new-brunswick--1-dolar.json` → `/coleccion/state-bank-new-brunswick/1-dolar/`).

### 1.4 Catalog hub paths (`src/lib/catalog-inventory.mjs` `HUB_PATHS`)

These are treated as hubs (not piece fichas) for inventory stats:

`/coleccion/billete-obsoleto-estados-unidos/`, `/coleccion/reserva-federal/`, `/coleccion/departamento-del-tesoro-de-ee-uu/`, `/coleccion/moneda-colonial/`, `/coleccion/colombia/`, `/coleccion/colombia/banca-libre/`, `/coleccion/colombia/emisiones-en-el-extranjero/`, `/coleccion/colombia/siglo-pasado/` *(native Astro page)*, `/coleccion/colombia/banco-de-la-republica/` *(native Astro page)*, `/coleccion/puerto-rico/`, `/coleccion/ecuador/`, `/coleccion/moneda-colonial-espanola/`, `/coleccion/numismatica/` *(native Astro page, not a catalog JSON)*, `/coleccion/polimero-mundial/`, `/coleccion/pop-art/`, `/coleccion/certificados-de-pago-militar/`, `/coleccion/emisiones-promocionales/`, `/coleccion/food-coupons-usda/`.

`/coleccion/` itself is a native Astro page, not a catalog JSON entry.

### 1.5 `public/` extra HTML / machine routes (not Astro pages)

| Path | Source | Indexed? |
|---|---|---|
| `/robots.txt` | `public/robots.txt` | n/a |
| `/sitemap.xml` | prebuild `scripts/generate-sitemap.mjs` | listed in robots |
| `/sitemap_index.xml` | same | listed |
| `/news-sitemap.xml` | same (noticias ≤ 48 h) | listed |
| `/llms.txt`, `/llms-full.txt` | `scripts/generate-llms-txt.mjs` | Allow |
| `/llm.txt`, `/llm-full.txt` | aliases of the above | Allow |
| `/openapi.json` | static | Allow |
| `/data/catalog-index.json` | `scripts/generate-catalog-index.mjs` | machine |
| `/indexnow-key.txt`, `/a3190f98-e644-4a96-bda0-fa87530608ef.txt` | IndexNow | n/a |
| `/.well-known/mcp.json`, `mcp/server-card.json`, `jwks.json`, `agent-index.json`, key txt | agent/OAuth | mixed |
| `/oauth/authorize/`, `/oauth/claim/` | `public/oauth/*/index.html` | **noindex**; `robots.txt` Disallow `/oauth/` |
| `/support.js` | legacy dc-runtime (still shipped) | not HTML |
| `/catalog-zoom.js`, `/coleccion-hub.js`, `/webmcp.js`, `/web-vitals.js` | public JS | not HTML |
| `/pagefind/` | generated at `npm run build` (`scripts/run-pagefind.mjs`) | search index |
| Fonts OFL txt under `/uploads/fonts/` | licenses | n/a |

**No leftover `public/*.dc.html`.** Legacy shells live in `legacy/catalog-dc/` and `legacy/dc-shells/` (not published). `robots.txt` still Disallows `/BanknoteCard.dc.html`, `/SiteHeader.dc.html`, `/SiteFooter.dc.html` as a historical safety net. `scripts/run-pagefind.mjs` parks those names out of the Pagefind index if they ever appear in `dist/`.

**No RSS.** `scripts/generate-sitemap.mjs` is the only URL inventory for crawlers.

### 1.6 `scripts/` generators that emit public URLs

| Script | When | Output |
|---|---|---|
| `scripts/generate-sitemap.mjs` | `prebuild` | `public/sitemap.xml`, `news-sitemap.xml`, `sitemap_index.xml` |
| `scripts/generate-catalog-index.mjs` | `prebuild` | `public/data/catalog-index.json` (Spanish `path` fields) |
| `scripts/generate-llms-txt.mjs` | `prebuild` | `llms.txt` / `llms-full.txt` + aliases; documents ES-only content + chrome toggle |
| `scripts/build-client-runtime.mjs` | `prebuild` | client bundles |
| `scripts/run-pagefind.mjs` | after `astro build` | `dist/pagefind/` |
| `scripts/check-unresolved-mustache.mjs` | after build | fail if `{{…}}` in `dist/**/*.html` |
| `scripts/check-placeholders.mjs` | `check:ci` | fail if `{{…}}` in dist, catalog JSON templates, sitemaps, llms |
| `scripts/submit-indexnow.mjs` | manual `npm run indexnow` | IndexNow ping |

Sitemap discovery is **manual, not `@astrojs/sitemap`**. It reads catalog JSON `path`, walks markdown dirs, and hardcodes native routes. It does **not** walk `src/pages/` generically. `/buscar/` is omitted on purpose.

### 1.7 Cloudflare Pages `functions/` (dynamic, not static HTML)

Mounted at the Pages edge; `robots.txt` Disallows `/api/` and `/mcp`.

| Function | Route |
|---|---|
| `functions/_middleware.js` | all requests: www→apex 301, security headers, optional markdown Accept |
| `functions/api/catalog.js` | `GET /api/catalog` — reads `/data/catalog-index.json` |
| `functions/api/comments/[slug].js` | comments API |
| `functions/api/web-vitals.js` | `POST /api/web-vitals` |
| `functions/api/health.js` | health |
| `functions/api/csp-report.js` | CSP report-only sink |
| `functions/api/oauth/token.js`, `revoke.js` | OAuth |
| `functions/api/agent/identity.js`, `identity/claim.js`, `events.js` | agent |
| `functions/mcp.js` | `/mcp` |

These return JSON, not locale HTML. `/api/catalog` currently exposes Spanish `path`/`title`/`description`. An English catalog will need either a parallel index or a `lang` query — **do not change the existing JSON shape without a versioned field**, or Spanish clients (hub filters) break.

### 1.8 Redirects that must keep working (`public/_redirects`)

Hundreds of 301s from legacy `.dc.html` / `.dc` catalog documents, WordPress `/the-hagerstown-bank/`, glossary hash-era slugs, `/logros/` → `/`, duplicate noticia, `/coleccion/monedas/` → `/coleccion/numismatica/`, pop-art-rency paths, food-coupon aliases.

**i18n implication:** all destinations are Spanish root URLs. Adding `/en/` must **not** rewrite these. Do not add language-negotiation redirects (guardrail in `AGENTS.md`).

`functions/_middleware.js` also 301s `www.notofilia.com` → `notofilia.com` (host only).

---

## 2. Content model map

### 2.1 Where page text lives

| Surface | Location | Fields / notes |
|---|---|---|
| Editorial posts | `src/content/{blog,noticias,logros}/*.md` | Frontmatter: `title`, `publishedAt`, `excerpt`, `source`, `sourceUrl`, `cover*`, `keywords[]` (on-site search only), `relatedLinks[]` (**Spanish hrefs**), valuation (`claimKind`…), `draft`. **Body is Spanish Markdown.** |
| Glossary | `src/content/glosario/*.md` | Frontmatter bilingual; **Spanish definition = Markdown body**; English definition = `definitionEn` |
| Catalog records | `src/content/catalog/*.json` | `title`, `description`, `keywords[]`, `og*`, `jsonLd`, `template` (frozen HTML, Spanish), `logic` (legacy JS string), `record` structured model (`src/lib/catalog-record.ts`) |
| Catalog hub copy | `src/lib/catalog-hub.ts` | `FEATURED_ENTRIES` / `RECENT_PIECES` already have `titleEn` / `descriptionEn` |
| Collection chrome | `src/lib/collections.ts` `COLLECTIONS` | `label`/`heading`/`intro`/`emptyMessage`/`backLabel` + `*En` twins; JSON-LD names still Spanish |
| Nav | `src/lib/nav.ts` | `label` + optional `labelEn`; **several links lack `labelEn`** (falls back to `lookupEn()`) |
| UI dictionary | `src/lib/ui-i18n.ts` | `UI.*` es/en pairs; `GLOSSARY_CATEGORY_EN`; `METADATA_LABEL_EN`; `STATUS_LABEL_EN`; `CLAIM_*_EN` |
| Catalog phrase dictionary | `src/i18n/catalog-es-en.json` | 5,427 exact Spanish strings → English; used by `html-i18n.ts` |
| Claims (ES) | `src/lib/claims.ts` | `CLAIM_LABELS`, `CLAIM_DEFAULT_NOTES` (Spanish) |
| Dates | `src/lib/dates.ts` | `formatDate*Es` / `*En` |
| Stats | `src/lib/stats.ts` + `catalog-inventory.mjs` | `formatStatsEs` / `formatStatsEn`; `INVENTORY_VOCABULARY_*` |
| Editorial identity | `src/lib/editorial.ts` | names, `/editorial/` URLs (Spanish) |
| Homepage hero alts | `src/pages/index.astro` `heroes[]` | Spanish `alt` only |
| Logros strip | `src/components/HomeLogrosStrip.astro` | hardcoded cards with `titleEn`/`descriptionEn`; **image alts Spanish only** |
| Privacy / editorial bodies | page `.astro` files | duplicated ES/EN via `data-lang-panel` |
| Catalog templates | JSON `template` | large Spanish HTML; `withI18nMarkup()` injects `data-i18n`/`data-en` at render |
| Post EN body | `PostArticle.astro` | `translateMarkdown(post.body)` → hidden `data-lang-panel="en"`; **only if dictionary has paragraph matches** |

**There is no English markdown collection.** English editorial body is either (a) a hidden panel built from the 5,427-key phrase dictionary, or (b) a hand-duplicated `data-lang-panel="en"` block on a few legal/policy pages. Dictionary coverage for long-form blog/noticias is incomplete by design (exact paragraph match).

### 2.2 Schema fields (collections)

**`postSchema`** (`src/content.config.ts`): `title`, `publishedAt`, `excerpt`, optional `source`/`sourceUrl`/`cover`/`coverAlt`/`coverCaption`/`coverFit`/`keywords`/`relatedLinks`/`updatedAt`/`reviewedBy`/`corrections`/`claimKind`/`claimNote`/`claimCurrency`/`claimValuationDate`/`claimEvidenceUrl`/`claimEvidenceLabel`/`primarySources`/`draft`.

**No `titleEn` / `excerptEn` / `bodyEn` fields.** i18n for posts is dictionary lookup + `data-i18n` on title/excerpt when `lookupEn()` hits.

**Glossary schema:** `termEs`, `termEn`, `definitionEn` (all required), `category` enum (Spanish labels), `source` `site|suggested`, `seeAlso[]` (Spanish term names), `aliases[]` (legacy slugs), `wikipediaUrl?`.

**Catalog `record`:** `id` (e.g. `NF.colombia.…`), `kind`, `title`, breadcrumb names (Spanish), image `alt` (Spanish), metadata labels via `HONESTY_FIELD_LABELS` (Spanish: Tirada, Variedades conocidas, …), `context.*` markdown/HTML Spanish, `related[].href` Spanish paths.

### 2.3 UI chrome string owners

| Chrome | File | Mechanism |
|---|---|---|
| Skip link, header, drawer, search, ES/EN pill | `SiteHeader.astro` + `nav.ts` + `interface-lang.js` | `data-i18n` / `data-en` |
| Footer copyright, policy links, stats | `SiteFooter.astro` | `data-i18n` |
| Newsletter / social | `PreFooter.astro`, `SocialLink.astro` | `data-i18n`; social `aria-label` + `labelEn` |
| Cookies | `CookieBanner.astro` | `data-i18n` |
| Editorial layout skip + shell | `BlogLayout.astro` | `data-i18n` |
| Catalog layout skip | `CatalogLayout.astro` | `UI.skipMain` |
| Article chrome | `PostArticle.astro`, `PostCollectionIndex.astro`, `ClaimCallout.astro`, `SourceCredit.astro`, `Comments.astro` | `UI` + `data-i18n` |
| Catalog record chrome | `src/components/catalog/*.astro` | `UI` + `METADATA_LABEL_EN` |
| Homepage sections | `HomeHero`, `HomeStatsBar`, `HomeBrowseStrip`, `HomePostStrip`, `HomeLogrosStrip` | `data-i18n` |
| Search page Pagefind copy | `buscar/index.astro` inline `translations.es/en` | JS, listens to `data-interface-lang` |

### 2.4 Hardcoded Spanish in components / layouts / nav (thorough)

Many strings already have `data-en`. The table below flags **visible Spanish that is either the source-of-truth chrome or missing a twin**. “Paired” = has `data-i18n`/`data-en` or `labelEn`. “Unpaired” = Spanish only in the shipped HTML (toggle cannot swap it).

| File | Example string | Paired? |
|---|---|---|
| `src/lib/nav.ts` | `'Inicio'`, `'Colección'`, `'Guías para coleccionistas'`, `'Noticias numismáticas'`, `'Glosario'`, `'Sobre Notofilia'`, `'Contacto'` | yes (`labelEn`) |
| `src/lib/nav.ts` | `'Pop-art currency'` | already EN; no `labelEn` |
| `src/lib/nav.ts` | group `'Colombia'`, `'Puerto Rico'` | no `labelEn` (same in EN; OK) |
| `src/components/SiteHeader.astro` | `aria-label` for main nav / drawer / search | paired via `isEn` |
| `src/components/SiteHeader.astro` | `'Numismática y Notafilia'`, `'Colección'`, `'Buscar'`, `'Abrir menú'`, `'Cerrar menú'`, `'Menú del sitio'` | paired |
| `src/components/SiteFooter.astro` | `'Todos los derechos reservados.'`, `'Política editorial y valoración'`, `'Colección Virtual:'`, `'Página diseñada por'` | paired |
| `src/components/PreFooter.astro` | `'Boletín'`, `'Suscríbase para recibir noticias…'`, `'Nombre'`, `'Correo electrónico'`, `'Suscribirse'` | paired |
| `src/components/CookieBanner.astro` | `'Aviso de cookies'`, cookie body, `'Rechazar no esenciales'`, `'Aceptar todas'` | paired |
| `src/components/HomeHero.astro` | `'Una colección privada de billetes y monedas históricas'` | paired |
| `src/components/HomeHero.astro` | `'Pausar diapositivas'` (initial button text) | **unpaired in HTML**; JS in `index.astro` swaps via `data-interface-lang` |
| `src/components/HomeBrowseStrip.astro` | `'Explorar por país o colección'`, `'Ver el catálogo completo'` | paired |
| `src/components/HomeLogrosStrip.astro` | `'Logros del Mes — Colección Virtual'`, `'Explorar la colección'` | paired |
| `src/components/HomeLogrosStrip.astro` | `imageAlt: 'Anverso y reverso del MPC…'` (4 alts) | **unpaired** |
| `src/components/HomePostStrip.astro` | `'Leer más →'` | paired |
| `src/components/HomeStatsBar.astro` | `'Estadísticas de la colección'` | paired |
| `src/components/PostArticle.astro` | `'Fuentes primarias'`, `'Historial de correcciones'`, `'Sigue explorando'`, `'Política editorial, fuentes y valoración'`, `'(se abre en una pestaña nueva)'` | paired |
| `src/components/PostArticle.astro` | correction `c.text`, `relatedLinks` descriptions | **unpaired unless dictionary hits** |
| `src/components/ClaimCallout.astro` | `'Sobre este valor'`, `'Tipo de cifra:'`, `'Moneda:'` | paired |
| `src/components/ClaimCallout.astro` | default `evidenceLabel = 'Evidencia de remate o fuente primaria'` | **unpaired** if passed through |
| `src/components/Comments.astro` | `'Comentarios'`, `'Nombre'`, `'Enviar comentario'`, `'Cargando comentarios…'` | paired |
| `src/components/Comments.astro` | JS status strings `'Aún no hay comentarios publicados.'` etc. | paired in JS map |
| `src/components/NewWindowHint.astro` | `' (se abre en una pestaña nueva)'` | paired |
| `src/components/SourceCredit.astro` | `'Fuente:'` | paired (`UI.fuente`) |
| `src/components/catalog/CatalogBreadcrumb.astro` | `'Migas de pan'` | paired |
| `src/components/catalog/CatalogMedia.astro` | `'Ampliar imagen de la pieza'` | paired (`data-i18n-target="aria-label"`, `UI.enlargeAria.en`) |
| `src/components/catalog/CatalogRecordSurface.astro` | `aria-label="Registro estructurado de la ficha"` | **unpaired** |
| `src/components/catalog/CatalogCitation.astro` | copy-status JS `'Cita copiada al portapapeles.'` | paired in JS via `data-interface-lang` |
| `src/components/catalog/CatalogFeedback.astro` | `'Reportar un error…'`, `'Formulario de contacto'` | paired (`UI`) |
| `src/layouts/BlogLayout.astro` | `'Saltar al contenido'` | paired |
| `src/layouts/CatalogLayout.astro` | skip link via `UI.skipMain` | paired |
| `src/lib/collections.ts` | `'Volver al Blog'`, `'Noticias de Numismática y Notafilia'`, … | paired `*En` for chrome; JSON-LD `jsonLdName` Spanish only |
| `src/lib/claims.ts` | `'Precio de venta (anuncio)'`, long notes | EN twins in `ui-i18n.ts` |
| `src/lib/catalog-record.ts` | `UNCONFIRMED_VALUE = 'no confirmado'`; `HONESTY_FIELD_LABELS` | EN via `METADATA_LABEL_EN` / `UI.unconfirmed` |
| `src/lib/catalog-jsonld.ts` | `'Disponibilidad'`, `'No está a la venta — colección privada documentada'`, `'Tipo de ficha'` | **unpaired** (structured data, Spanish only) |
| `src/pages/index.astro` | hero `alt` strings (`'Primer plano de un billete de 5 quetzales…'`) | **unpaired** |
| `src/pages/contacto.astro` | form labels `'Nombre'`, `'Mensaje'`; success/error JS keyed by `data-interface-lang` | mostly paired |
| `src/pages/glosario/index.astro` | `'Buscar en el glosario'`, `'Todas'`, category chips | paired via `UI` / `GLOSSARY_CATEGORY_EN` |
| `src/client/site-header.js` | `'No se pudo cargar la búsqueda. Ir a /buscar/'` | paired in JS; **hardcodes `/buscar/` path** |
| `src/client/interface-lang.js` | `'Idioma de la interfaz'` / `'Interface language'` | hardcoded in JS |

**`src/lib/nav.ts` is the shared nav source** for `SiteHeader` and `SiteFooter`. hrefs are Spanish hubs (`/coleccion/`, `/nosotros/`, `/blog/`, `/noticias/`, `/glosario/`, `/contacto/`). `SiteHeader` maps them with `alternateUrl`; do not list individual catalog records in the menu.

### 2.5 Inline / data-file Spanish outside components

- `public/llms.txt` and generator copy: Spanish editorial language statement.
- `public/data/catalog-index.json`: Spanish country names, titles, paths (hub filters use `pais=Estados Unidos`).
- `public/oauth/*/index.html`: `'Autorización de agentes · Notofilia'` (noindex).
- Catalog JSON `template` blobs: thousands of Spanish sentences (partially wrapped at build by `withI18nMarkup`).

---

## 3. Current language-toggle implementation

**UX:** header pill **ES | EN** labeled “Idioma de la interfaz” / “Interface language”. Same URL. Document language **stays `lang="es"`**. This will be removed in Phase 4 and replaced with real `/en/` URLs.

### 3.1 How it works

1. **`src/client/interface-lang.js`** (loaded from `SiteHeader.astro`):
   - Storage key: `localStorage['notofilia-interface-lang']` (`es` | `en`).
   - Buttons: `#lang-es`, `#lang-en`; label `#interface-lang-label`.
   - Sets `document.documentElement.lang = 'es'` **always**.
   - Sets `document.documentElement.setAttribute('data-interface-lang', lang)`.
   - Collects all `[data-i18n]` nodes. On first run, copies current `innerHTML` (or a named attribute via `data-i18n-target`) into `data-es`.
   - For `en`, writes `data-en` into innerHTML or the target attribute; sets `lang="en"` on the node.
   - Toggles `[data-lang-panel]` siblings: shows `data-lang-panel="<lang>"`, `hidden` on the other.
   - Dispatches `notofilia:interface-lang` with `{ lang }`.
   - Calls `window.__notofiliaHeroMotion.syncLabels()` if present.

2. **`data-i18n` + `data-en`:** Spanish is the HTML text node; English is an attribute. Crawlers that do not run JS see Spanish (good for root URLs). English is still **present in the HTML** as attributes and as hidden panels.

3. **`data-lang-panel`:** used for long duplicated bodies:
   - `src/pages/editorial/index.astro`
   - `src/pages/editorial/equipo.astro`
   - `src/pages/politica-privacidad-cookies.astro` (also reads `data-interface-lang` / localStorage in page script)
   - `src/components/PostArticle.astro` — ES = rendered Markdown; EN = `translateMarkdown(post.body)` HTML, `hidden` until toggle

4. **`src/lib/html-i18n.ts`:** server-only. Loads `src/i18n/catalog-es-en.json`. `withI18nMarkup(html)` wraps matching text nodes in `<span data-i18n data-en="…">`. Used by `CatalogLayout` on every catalog `template`. `lookupEn()` / `i18nPair()` / `translateMarkdown()` used across hub, nav, posts.

5. **`src/lib/ui-i18n.ts`:** typed chrome dictionary for components that cannot embed a literal `data-en`.

6. **Consumers of `data-interface-lang` (not only the toggle script):**
   - `src/pages/index.astro` hero pause/resume labels
   - `src/pages/contacto.astro` form status
   - `src/pages/politica-privacidad-cookies.astro` panel init
   - `src/pages/buscar/index.astro` Pagefind `translations`
   - `src/client/site-header.js` empty/error search copy
   - `src/components/catalog/CatalogCitation.astro` clipboard status
   - `src/client/glossary-filter.js` (live status: `'Mostrando los N términos…'` / `'Showing all N glossary terms.'`; listens to `notofilia:interface-lang`)

### 3.2 Every file involved (toggle + swap surface)

**Core**

- `src/client/interface-lang.js`
- `src/components/SiteHeader.astro` (pill markup + script includes)
- `src/lib/ui-i18n.ts`
- `src/lib/html-i18n.ts`
- `src/i18n/catalog-es-en.json`

**Layouts / pages that emit `data-i18n` or `data-lang-panel`**

- `src/layouts/BlogLayout.astro`, `src/layouts/CatalogLayout.astro`
- `src/pages/index.astro`, `404.astro`, `contacto.astro`, `politica-privacidad-cookies.astro`
- `src/pages/editorial/index.astro`, `editorial/equipo.astro`
- `src/pages/glosario/index.astro`, `glosario/[slug].astro`
- `src/pages/coleccion/index.astro`, `coleccion/numismatica/index.astro`
- `src/pages/buscar/index.astro`
- `src/pages/[section]/index.astro` (via `PostCollectionIndex`)
- `src/pages/[section]/[...slug].astro` (via `PostArticle`)
- `src/pages/j-s-g-boggs.astro` (template HTML; i18n only if dictionary wraps via `CatalogLayout`)

**Components**

- `SiteFooter.astro`, `PreFooter.astro`, `CookieBanner.astro`, `SocialLink.astro`
- `HomeHero.astro`, `HomeStatsBar.astro`, `HomeBrowseStrip.astro`, `HomePostStrip.astro`, `HomeLogrosStrip.astro`
- `PostArticle.astro`, `PostCollectionIndex.astro`, `ClaimCallout.astro`, `SourceCredit.astro`, `Comments.astro`, `NewWindowHint.astro`
- `src/components/catalog/*` (`CatalogBreadcrumb`, `CatalogMedia`, `CatalogMetadata`, `CatalogContext`, `CatalogRelated`, `CatalogCitation`, `CatalogFeedback`, `CatalogHubGrid`, `CatalogRecordSurface`, `CatalogBanknoteCard`)

**Supporting libs**

- `src/lib/nav.ts`, `catalog-hub.ts`, `collections.ts`, `glossary.ts`, `stats.ts`, `dates.ts`, `claims.ts`

**Client scripts**

- `src/client/site-header.js`, `glossary-filter.js`, plus inline scripts in `index.astro`, `buscar/index.astro`, `contacto.astro`, `politica-privacidad-cookies.astro`, `CatalogCitation.astro`

**Docs / LLM**

- `scripts/generate-llms-txt.mjs` and `public/llms.txt` describe the chrome-only toggle explicitly (no `/en/` hreflang).

### 3.3 What Googlebot sees today

- `html lang="es"` on every page.
- Canonical = Spanish URL.
- `hreflang` only on homepage and catalog layout: `es` + `x-default` → **same Spanish URL**. No `en`.
- English exists in `data-en` attributes and `hidden` EN panels. Hidden EN article bodies are in the DOM for posts when `translateMarkdown` finds matches.
- Toggle JS does not run for typical crawlers → Spanish is the indexed language. **Risk if a future change server-renders EN on the Spanish URL.**

---

## 4. Existing glossary infrastructure

### 4.1 Location and format

- Collection: `glosario` in `src/content.config.ts`
- Files: `src/content/glosario/<slug>.md` (95 files)
- Routes: `/glosario/` index; `/glosario/<slug>/` term pages (`src/pages/glosario/[slug].astro`)
- Helpers: `src/lib/glossary.ts`
- Filter UI: `src/client/glossary-filter.js`
- Category EN map: `GLOSSARY_CATEGORY_EN` in `src/lib/ui-i18n.ts`

**Per term:**

```yaml
termEs: "Anverso"
termEn: "Obverse"
definitionEn: "The front face of a banknote…"
category: "Diseño"   # enum: Coleccionismo | Conservación | Disciplina | Diseño | Emisión | Monedas y divisas | Producción
source: "site"       # or "suggested"
seeAlso: ["Reverso"] # Spanish names or slugs; validated at build
aliases: []          # extra slugs that 301 to this term
wikipediaUrl: "https://es.wikipedia.org/wiki/…"  # optional
```

Spanish definition = Markdown **body** (`definitionEs(entry) = entry.body.trim()`).

**Slug strategy:** public URL = **filename** (`entry.id`), not `slugify(termEs)`. `slugifyGlossary()` exists to match **legacy hash ids** and `seeAlso` fragments. Index cards still expose `glossaryAnchor(entry) = slugify(termEs)` for `/glosario/#c-day` style links.

**Aliases (3 terms) + `public/_redirects`:**

| Alias | Canonical |
|---|---|
| `/glosario/pick-number/` | `/glosario/pick/` |
| `/glosario/catalogo-friedberg/` | `/glosario/friedberg/` |
| `/glosario/sin-circular-unc/` | `/glosario/billete-sin-circular/` |

JSON-LD: `DefinedTermSet` on the index; `DefinedTerm` on each term with `name=termEs`, `alternateName=termEn`, `inLanguage: 'es'`.

### 4.2 Counts and reuse as ES↔EN dictionary

- **95 terms**, all required to have `termEn` + `definitionEn`.
- Mix of `source: site` (catalog vocabulary) and `source: suggested` (international collecting terms).
- **There is no standalone term `billete`.** Closest: `notafilia` (Notaphily), plus compounds (`billete-alterado`, `billete-provisional`, …). Use glossary for domain words; do not invent a `billete` slug unless a term file is added.

**Sample mappings (requested + core):**

| termEs | termEn | ES slug | Proposed EN slug |
|---|---|---|---|
| Anverso | Obverse | `anverso` | `obverse` |
| Reverso | Reverse | `reverso` | `reverse` |
| Notafilia | Notaphily | `notafilia` | `notaphily` |
| Numismática | Numismatics | `numismatica` | `numismatics` |
| Viñeta | Vignette | `vineta` | `vignette` |
| Filigrana | Watermark | `filigrana` | `watermark` |
| Polímero | Polymer | `polimero` | `polymer` |
| Specimen | Specimen | `specimen` | `specimen` (keep) |
| Pick number | Pick number | `pick` | `pick` (do **not** translate) |
| Catálogo Friedberg | Friedberg catalog | `friedberg` | `friedberg` |
| Banca libre | Free banking | `banca-libre` | `free-banking` |
| Error de impresión | Printing error | `error-de-impresion` | `printing-error` |
| Cospel | Cospel | `cospel` | `cospel` — **termEn not anglicized** (see `planchuela` → Planchet) |
| Escripofilia | Escripofilia | `escripofilia` | should be `scripophily` — **dictionary bug** |
| Cordoncillo | Cordoncillo | `cordoncillo` | **termEn = Spanish** |

**Reuse rules for `/en/`:**

1. Treat `termEs` ↔ `termEn` as the canonical numismatic lexicon (per `AGENTS.md`).
2. EN glossary URLs should use slugified `termEn` (Appendix E), with redirects from any English guesses.
3. Do **not** translate Pick, Friedberg, Tyvek, Guilloche, Intaglio, Specimen, currency names that are identical (Peso, Quetzal, Ringgit, Tenge, Kwacha).
4. `seeAlso` currently resolves to **Spanish** `/glosario/<id>/`. English pages need a locale-aware resolver.
5. JSON-LD on EN terms must flip `inLanguage` to `en` and swap `name`/`alternateName`.

Full 95-row table: **Appendix E**.

---

## 5. SEO surface

### 5.1 `<head>` ownership

**Single emitter:** `src/components/BaseHead.astro`, imported by:

- `BlogLayout.astro` (editorial, glossary, contact, privacy, editorial policy)
- `CatalogLayout.astro` (catalog JSON pages + Boggs)
- Direct: `index.astro`, `coleccion/index.astro`, `coleccion/numismatica/index.astro`, `buscar/index.astro`, `404.astro`

**Always emitted:** charset, viewport, `<base href="/" />`, font preloads, `<title>`, `meta description`, `meta author` (default `EDITORIAL_TEAM.name` = Yezid Acosta), `meta robots`, `link rel=canonical` via `absoluteUrl(path)`, favicon, Open Graph (`og:type`, `og:site_name=Notofilia`, **`og:locale=es_ES` hardcoded**), `og:title/description/url/image`, Twitter summary_large_image, optional JSON-LD script, `WebVitals.astro`.

**Not emitted:** `<meta name="keywords">` (correct; keywords stay in catalog JSON for search). No `og:locale:alternate`. No `hreflang` in BaseHead itself — callers may slot extras.

**hreflang today:**

| Page type | Tags |
|---|---|
| Homepage | `hreflang=es` + `x-default` → `https://notofilia.com/` |
| Catalog layout | `hreflang=es` + `x-default` → that page’s Spanish canonical |
| BlogLayout pages (blog, noticias, glosario, contacto, editorial, privacy) | **none** |
| Colección hub / numismática hub | **none** (not using CatalogLayout’s extra links) |
| `/en/` | does not exist |

`x-default` currently points at Spanish. After `/en/` ships, `x-default` should remain Spanish (primary), with reciprocal `es`/`en` **only when a counterpart exists** (`AGENTS.md`).

**Canonical:** always the Spanish path passed in. `og:url` = canonical. Self-referencing. Do not point Spanish canonicals at `/en/`.

### 5.2 Title / description helpers

`src/lib/posts.ts`: `titleTag()` suffixes ` · Notofilia` and truncates ≤ 60 chars; `metaDescription()` ≤ 150. Used for posts and glossary titles. Homepage / hubs pass literal titles into BaseHead.

### 5.3 Structured data (JSON-LD)

| Page | Builder | Types |
|---|---|---|
| `/` | inline in `index.astro` | `Organization`, `WebSite` (**`inLanguage: ['es','en']` already**), `WebPage`, `SearchAction` → `/buscar/?q={search_term_string}` |
| Blog/noticias indexes | `collectionIndexJsonLd` | `CollectionPage` + `ItemList`; breadcrumbs “Inicio” |
| Posts | `articleJsonLd` | `NewsArticle` or `BlogPosting`; `inLanguage: 'es'`; `publishingPrinciples` → `/editorial/` |
| Glossary index | `glossaryIndexJsonLd` | `BreadcrumbList` + `DefinedTermSet` `inLanguage: 'es'` |
| Glossary term | `glossaryTermJsonLd` | `DefinedTerm` `inLanguage: 'es'` |
| Catalog | JSON `jsonLd` + `enrichCatalogJsonLd` | `CreativeWork` + `additionalProperty` (never `Product`); hubs may add `ItemList`; Spanish property names (`Disponibilidad`, `Tipo de ficha`) |
| Contact | inline | `ContactPage` `inLanguage: 'es'` |
| Editorial | inline | `WebPage` `inLanguage: 'es'` + `Person` |
| Boggs | inline | `Person`, `ImageObject` (Spanish jobTitle/description) |

**SEO risk:** `WebSite.inLanguage: ['es','en']` claims English documents that do not exist as URLs. Either wait until `/en/` exists or keep `es` only until pairs ship.

### 5.4 Sitemap / robots / news

- Generator: `scripts/generate-sitemap.mjs` (prebuild). **Not** an Astro integration.
- `public/robots.txt`: `Allow: /`; Disallow `/oauth/`, `/api/`, `/mcp`; Sitemap index + xml + news.
- News sitemap: `news:language` = **`es`**; only noticias with `publishedAt` in last 48 hours.
- Lastmod preservation: reads previous `sitemap.xml` so dates are not clobbered.
- `/buscar/` omitted.

English URLs will need a second urlset (or xhtml:link alternates). Do not replace Spanish `<loc>` values.

### 5.5 Analytics / GA snippet

**Finding:** there is **no `gtag.js` / `G-XXXX` / `googletagmanager.com` snippet in this repo.** Privacy copy and the cookie banner **talk about GA4**, and `AGENTS.md` says not to degrade existing GA tagging.

What **does** exist:

- `CookieBanner.astro` — consent key `localStorage['notofilia_cookie_consent']` = `accepted` | `rejected`; event `notofilia:cookies-accepted`.
- `WebVitals.astro` — after accept, loads `/web-vitals.js` → POST `/api/web-vitals` (first-party, not GA).
- Privacy page documents GA4 cookies `_ga` / `_ga_*` and **Cloudflare Web Analytics** (cookie-free). No `cloudflareinsights.com` beacon in source either (may be injected at the Cloudflare dashboard).

**Implication for `/en/`:** if GA is injected at the edge/dashboard, new `/en/` paths should inherit it. If GA was removed from the Astro source accidentally, restoring it is out of this audit’s write scope — flag for the orchestrator. Cookie banner links to `/politica-privacidad-cookies/` (Spanish).

### 5.6 Other SEO-adjacent

- Pagefind indexes built `dist/` HTML (Spanish). EN pages will need a second index or `data-pagefind-meta` language filters.
- `data-pagefind-ignore` on search UI, cookie chrome, 404 body, oauth.
- IndexNow key files in `public/`.
- Open Graph locale locked to `es_ES`; EN pages need `en_US` (or `en`) + `og:locale:alternate`.

---

## 6. Slug translation table (draft)

**Rules used**

- Prefix every English URL with `/en/`.
- Translate **route segments** that are common nouns / section names.
- Keep **proper nouns**: person names, bank/issuer legal names (`banco-de-la-republica`, `banco-de-caldas`, …), place names that match English (`colombia`, `chile`, `nepal`), series codes (`serie-681`), years, denominations that are currency words (`peso`, `sucre`, `escudo`), catalog identifiers (Pick, Friedberg, Haxby, KM, Restrepo). **No `HT-33` appears in this catalog.**
- Country names: use standard English where the Spanish slug differs (`estados-unidos` → `united-states` in segment names; `islas-salomon` → `solomon-islands`; `kazajistan` → `kazakhstan`; `catar` → `qatar`; `suazilandia` → `eswatini`; `rumania` → `romania`; `papua-nueva-guinea` → `papua-new-guinea`; `republica-dominicana` → `dominican-republic`; `malasia` → `malaysia`). `Colombia` stays `colombia`.
- `perfil-*` → `profile-*` (translate the word “perfil” only).
- Number words in US-note slugs: `un-dolar` → `one-dollar`, `veinte-dolares` → `twenty-dollars`, `cien-dolares` → `one-hundred-dollars`, `sello-rojo` → `red-seal`.
- Glossary EN slugs = `slugify(termEn)`.

### 6.1 Site-wide segments

| ES segment | EN segment | Notes |
|---|---|---|
| *(root)* `/` | `/en/` | English homepage |
| `coleccion` | `collection` | glossary: collection / notaphily catalog |
| `numismatica` | `numismatics` | glossary `numismatica` |
| `noticias` | `news` | |
| `blog` | `blog` | same |
| `logros` | `milestones` | matches `labelEn` “Monthly milestones”; index currently 301s to `/` |
| `glosario` | `glossary` | |
| `buscar` | `search` | noindex utility |
| `contacto` | `contact` | |
| `nosotros` | `about` | About the project |
| `estados-unidos` | `united-states` | Country hub under collection |
| `espana` | `spain` | Country hub under collection |
| `editorial` | `editorial` | same |
| `equipo` | `team` | `/editorial/equipo/` → `/en/editorial/team/` |
| `politica-privacidad-cookies` | `privacy-cookies` | |
| `j-s-g-boggs` | `j-s-g-boggs` | proper noun |

**Example pairs**

| ES (do not change) | Proposed EN |
|---|---|
| `/` | `/en/` |
| `/coleccion/colombia/` | `/en/collection/colombia/` |
| `/coleccion/numismatica/` | `/en/collection/numismatics/` |
| `/noticias/` | `/en/news/` |
| `/blog/` | `/en/blog/` |
| `/glosario/` | `/en/glossary/` |
| `/glosario/anverso/` | `/en/glossary/obverse/` |
| `/buscar/` | `/en/search/` |
| `/contacto/` | `/en/contact/` |
| `/nosotros/` | `/en/about/` |
| `/coleccion/estados-unidos/` | `/en/collection/united-states/` |
| `/coleccion/espana/` | `/en/collection/spain/` |
| `/editorial/` | `/en/editorial/` |
| `/editorial/equipo/` | `/en/editorial/team/` |
| `/politica-privacidad-cookies/` | `/en/privacy-cookies/` |
| `/j-s-g-boggs/` | `/en/j-s-g-boggs/` |

### 6.2 High-traffic catalog hubs (also in Appendix A)

| ES | EN |
|---|---|
| `/coleccion/billete-obsoleto-estados-unidos/` | `/en/collection/obsolete-united-states-banknotes/` |
| `/coleccion/certificados-de-pago-militar/` | `/en/collection/military-payment-certificates/` |
| `/coleccion/polimero-mundial/` | `/en/collection/world-polymer/` |
| `/coleccion/moneda-colonial-espanola/` | `/en/collection/spanish-colonial-coinage/` |
| `/coleccion/moneda-colonial/` | `/en/collection/colonial-paper-money/` |
| `/coleccion/reserva-federal/` | `/en/collection/federal-reserve/` |
| `/coleccion/departamento-del-tesoro-de-ee-uu/` | `/en/collection/us-department-of-the-treasury/` |
| `/coleccion/emisiones-promocionales/` | `/en/collection/promotional-issues/` |
| `/coleccion/colombia/banca-libre/` | `/en/collection/colombia/free-banking/` |
| `/coleccion/colombia/emisiones-en-el-extranjero/` | `/en/collection/colombia/issues-printed-abroad/` |
| `/coleccion/colombia/siglo-pasado/` | `/en/collection/colombia/last-century/` |
| `/coleccion/colombia/banco-de-la-republica/` | `/en/collection/colombia/banco-de-la-republica/` |
| `/coleccion/pop-art/` | `/en/collection/pop-art/` |
| `/coleccion/food-coupons-usda/` | `/en/collection/usda-food-coupons/` |
| `/coleccion/puerto-rico/` | `/en/collection/puerto-rico/` |
| `/coleccion/ecuador/` | `/en/collection/ecuador/` |
| `/coleccion/filipinas/` | `/en/collection/philippines/` |
| `/coleccion/estados-unidos/` | `/en/collection/united-states/` |
| `/coleccion/espana/` | `/en/collection/spain/` |

### 6.3 Do-not-translate tokens

- Country: Colombia, Chile, Nepal, Ecuador, Puerto Rico, Filipinas / Philippines (as names).
- Issuers: Banco de la República, Banco de Caldas, Citizens Bank of Louisiana, Ringling Bros., USDA, MPC, Federal Reserve (as names in titles; URL segment `reserva-federal` **is** translated above).
- People: Simón Bolívar, Felipe V, Carlos III, J.S.G. Boggs, Jefe/Chief Ouray, etc.
- Catalog IDs: Pick `#…`, Friedberg `FR-…`, Haxby, Schwan, Shafer, KM, Restrepo, NGC/PCGS grades.
- Materials/brands already English: Tyvek, Specimen, Pop-art, Giori.
- Currency names kept in slugs when they are the unit: `pesos`, `sucres`, `escudo`, `quetzales`, `ringgit`, `tenge`.

Complete catalog / noticias / blog / glossary tables: **Appendices A–E** below.

---

## 7. Risk list

### 7.1 Spanish URL breakage (highest)

1. **Rewriting `catalog` JSON `path` fields** — they *are* the Spanish URLs. English must be a parallel map, not a mutation of `path`.
2. **Changing `src/pages/` file names or `[section]` ids** (`noticias`, `blog`, `coleccion`).
3. **`relatedLinks` in markdown** — hardcoded `/coleccion/…`, `/glosario/…`, `/blog/…`. English pages need translated hrefs; Spanish files must keep Spanish hrefs.
4. **`public/_redirects`** — hundreds of legacy 301s to Spanish canonicals. A catch-all `/en` rule that prepends language would destroy them if mis-ordered.
5. **Hub query URLs** — `/coleccion/?pais=Estados%20Unidos#explorar` is used in nav. Filter values are Spanish country names from `catalog-index.json`. English hub must not retarget this Spanish query string.
6. **`<base href="/">`** — nested `/en/collection/colombia/…` pages will resolve relative assets/links against `/`. Any remaining relative hrefs (legacy templates) can skip `/en/`.
7. **`/logros/` 301 to `/`** — do not invent `/en/milestones/` as a replacement for a Spanish index that does not exist without an explicit product decision.
8. **Internal JS paths** — `site-header.js` links to `/buscar/`; search form `action="/buscar/"`; cookie policy `href="/politica-privacidad-cookies/"`; feedback `href="/contacto/"`. All must become locale-aware **without** changing the Spanish defaults.

### 7.2 Unrendered-placeholder / crawler bugs (historical)

Site previously shipped unrendered Mustache to Googlebot. Current guards:

- `scripts/check-unresolved-mustache.mjs` scans `dist/**/*.html` for `{{…}}` (wired into `npm run build`).
- `scripts/check-placeholders.mjs` also scans catalog JSON `template` + `record`, sitemaps, llms.
- Catalog `template` is passed through `withI18nMarkup` and injected with `set:html` — **Mustache is not evaluated by Astro**. `support.js` (dc-runtime) still exists in `public/` and still understands Mustache internally, but CatalogLayout sets `loadDcRuntime={false}`.

**Residual patterns to watch:**

| Pattern | Where | Risk |
|---|---|---|
| `{{ … }}` | `public/support.js` (skipped by checks); must **never** appear in `dist/**/*.html` | Google indexes raw braces |
| `<sc-for>` | catalog templates; `check-placeholders` fails the build if present | unexpanded note loops |
| `{expr}` / `define:vars={{ … }}` | Astro `define:vars={{ slug }}` in Comments/CatalogMedia — **compile-time**, OK | do not confuse with Mustache |
| `set:html={catalogShell}` / `set:html={bodyEnHtml}` | CatalogLayout, PostArticle | XSS-class injection; EN HTML must be sanitized like today |
| `data-en` with unescaped quotes | `html-i18n.ts` `escapeAttr` | broken attributes if a new writer skips escaping |
| Dictionary miss → Spanish left in EN panel | `translateMarkdown` returns original paragraph | **English URL with Spanish body** (quality / cloaking-adjacent). Prefer TRANSLATION-TODO over shipping. |
| Hidden `data-lang-panel="en"` on Spanish URLs | PostArticle, editorial, privacy | extra language in DOM; keep `hidden` until toggle dies; do not server-show EN on ES URLs |
| `innerHTML` swap | `interface-lang.js` | fine for chrome; dangerous if `data-en` ever contains unsanitized user text |
| Zoom dialogs without `hidden` | `check-placeholders` layout linter | overlays covering fichas (indexed as empty/broken) |
| `og:locale=es_ES` on a future `/en/` page | BaseHead hardcoded | wrong locale signal |
| `WebSite.inLanguage: ['es','en']` | homepage JSON-LD | claims EN without EN URLs |
| Pagefind indexing both languages as one corpus | `run-pagefind.mjs` | mixed-language results on `/buscar/` |
| `generate-sitemap.mjs` unaware of `/en/` | prebuild | English URLs never submitted; or worse, Spanish locs overwritten |
| `llms.txt` still saying there is no `/en/` | generator copy | stale machine docs after launch |
| Client-only EN | current toggle | OK for now; **must not** be the EN implementation (crawlers miss it) |

### 7.3 Top 5 risks (executive)

1. **Mutating Spanish `path` / page files / redirects / relatedLinks** while adding `/en/` — breaks GSC, IndexNow, and inbound `.dc.html` 301s.
2. **Shipping English pages that still contain Spanish body** (`translateMarkdown` misses, catalog template unwraps, unpaired strings) — same class of crawler-quality failure as unrendered placeholders.
3. **hreflang / canonical / sitemap inconsistency** — today `x-default` = Spanish self; `WebSite.inLanguage` already lists `en`; BlogLayout has no hreflang. Easy to create duplicate-language clusters.
4. **Catalog dual rendering** (frozen Spanish `template` + `withI18nMarkup` + optional Astro `record` chrome) — EN catalog cannot be a second innerHTML swap; needs real translated templates or a `record`-first render with translated fields. dc-runtime `support.js` still shipped.
5. **Hub filters, Pagefind, `catalog-index.json`, `/api/catalog`, `<base href="/">`, and nav hrefs** are Spanish-path assumptions baked into JS and prebuild scripts — silent 404s on `/en/` if forgotten.

### 7.4 Toggle removal (Phase 4) pitfalls

- Do not leave `data-interface-lang` listeners half-alive (hero, Pagefind, comments, citation copy).
- Do not keep `hidden` EN panels on Spanish documents once `/en/` counterparts exist (duplicate content).
- Replace the pill with a link to the **paired URL from the registry**, not a JS swap.
- Keep `localStorage` key unused or migrate once — stale `en` in storage must not flip Spanish pages.

---

## Implementation notes for later agents

- Pair registry must be the single source for hreflang, switcher, and sitemap (`AGENTS.md`). This audit’s Appendix tables are the **draft slug list**, not yet the registry.
- QA on **built `dist/` HTML**, not `astro dev`.
- No Accept-Language / geo redirects.
- Reuse glossary `termEn` for specialist vocabulary; reuse `catalog-es-en.json` as a phrase memory, not as a substitute for real EN documents.
- `npm run build` already fails on Mustache in HTML — keep that gate.

---

## Appendix index

- **A** — 144 catalog ES→EN paths  
- **B** — 55 noticias slugs  
- **C** — 9 blog slugs  
- **D** — logros (draft)  
- **E** — 95 glossary term mappings  

---
### A. Catalog paths (144) — ES URL → proposed EN URL
| Kind | ES path | Proposed EN path | Keep / notes |
|---|---|---|---|
| banknote | `/coleccion/adrian-insurance-michigan/2-dolares/` | `/en/collection/adrian-insurance-michigan/2-dollars/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/billete-obsoleto-estados-unidos/` | `/en/collection/obsolete-united-states-banknotes/` | hub/other |
| banknote | `/coleccion/certificado-de-oro-10-dolares-1928/` | `/en/collection/gold-certificate-10-dollars-1928/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/certificados-de-pago-militar/1-dolar-serie-681/` | `/en/collection/military-payment-certificates/1-dollar-series-681/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/certificados-de-pago-militar/10-dolares-serie-641/` | `/en/collection/military-payment-certificates/10-dollars-series-641/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/certificados-de-pago-militar/20-dolares-serie-692/` | `/en/collection/military-payment-certificates/20-dollars-series-692/` | catalog IDs stay untranslated in copy |
| profile | `/coleccion/certificados-de-pago-militar/perfil-jefe-ouray/` | `/en/collection/military-payment-certificates/profile-chief-ouray/` | proper-noun profile: translate `perfil` only |
| other | `/coleccion/certificados-de-pago-militar/` | `/en/collection/military-payment-certificates/` | hub/other |
| banknote | `/coleccion/cien-dolares-minneapolis-1929/` | `/en/collection/one-hundred-dollars-minneapolis-1929/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/cien-dolares-sello-rojo-1966/` | `/en/collection/one-hundred-dollars-red-seal-1966/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/citizens-bank-of-louisiana/5-dolares/` | `/en/collection/citizens-bank-of-louisiana/5-dollars/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/city-bank-new-haven/5-dolares/` | `/en/collection/city-bank-new-haven/5-dollars/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/2000-pesos-1996-error-mariposa/` | `/en/collection/colombia/2000-pesos-1996-butterfly-error/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/2000-pesos-error-corte-descentrado/` | `/en/collection/colombia/2000-pesos-off-center-cut-error/` | translated |
| banknote | `/coleccion/colombia/2000-pesos-error-mariposa/` | `/en/collection/colombia/2000-pesos-butterfly-error/` | translated |
| other | `/coleccion/colombia/banca-libre/` | `/en/collection/colombia/free-banking/` | hub/other |
| other | `/coleccion/colombia/siglo-pasado/` | `/en/collection/colombia/last-century/` | hub/other |
| other | `/coleccion/colombia/banco-de-la-republica/` | `/en/collection/colombia/banco-de-la-republica/` | hub/other; issuer name kept |
| banknote | `/coleccion/colombia/banco-colombiano-guatemala-1-peso-1900/` | `/en/collection/colombia/banco-colombiano-guatemala-1-peso-1900/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-antioquia-libranza-10-centavos-1900/` | `/en/collection/colombia/banco-de-antioquia-warrant-10-centavos-1900/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-barranquilla-50-centavos-1900/` | `/en/collection/colombia/banco-de-barranquilla-50-centavos-1900/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-caldas-1-peso-1919/` | `/en/collection/colombia/banco-de-caldas-1-peso-1919/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-colombia-1-peso-oro-1919/` | `/en/collection/colombia/banco-de-colombia-1-peso-oro-1919/` | issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-1-peso-specimen/` | `/en/collection/colombia/banco-de-la-republica-1-peso-specimen/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-10-pesos-oro/` | `/en/collection/colombia/banco-de-la-republica-10-pesos-oro/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-10-pesos-oro-1943/` | `/en/collection/colombia/banco-de-la-republica-10-pesos-oro-1943/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-100-pesos-oro/` | `/en/collection/colombia/banco-de-la-republica-100-pesos-oro/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-1000-pesos/` | `/en/collection/colombia/banco-de-la-republica-1000-pesos/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-10000-pesos-specimen/` | `/en/collection/colombia/banco-de-la-republica-10000-pesos-specimen/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-2-pesos-oro/` | `/en/collection/colombia/banco-de-la-republica-2-pesos-oro/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-200-pesos-oro-specimen/` | `/en/collection/colombia/banco-de-la-republica-200-pesos-oro-specimen/` | issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/` | `/en/collection/colombia/banco-de-la-republica-2000-pesos-oro/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/` | `/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango/` | catalog IDs stay untranslated in copy; artist name kept; P-458b progressive proof |
| banknote | `/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso/` | `/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso/` | catalog IDs stay untranslated in copy; artist name kept; P-458b face-incomplete progressive proof |
| banknote | `/coleccion/colombia/banco-de-la-republica-5-pesos-plata-1941/` | `/en/collection/colombia/banco-de-la-republica-5-pesos-plata-1941/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-50-pesos-oro-specimen/` | `/en/collection/colombia/banco-de-la-republica-50-pesos-oro-specimen/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-500-pesos-oro-specimen/` | `/en/collection/colombia/banco-de-la-republica-500-pesos-oro-specimen/` | issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-5000-pesos-oro-specimen/` | `/en/collection/colombia/banco-de-la-republica-5000-pesos-oro-specimen/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-50000-pesos/` | `/en/collection/colombia/banco-de-la-republica-50000-pesos/` | issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-republica-medio-peso-oro-specimen/` | `/en/collection/colombia/banco-de-la-republica-half-peso-oro-specimen/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-la-union-5-10-pesos-1883/` | `/en/collection/colombia/banco-de-la-union-5-10-pesos-1883/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-medellin-50-centavos/` | `/en/collection/colombia/banco-de-medellin-50-centavos/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-oriente-5-pesos-1888/` | `/en/collection/colombia/banco-de-oriente-5-pesos-1888/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-pamplona-10-pesos-1884/` | `/en/collection/colombia/banco-de-pamplona-10-pesos-1884/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-panama-1-5-pesos/` | `/en/collection/colombia/banco-de-panama-1-5-pesos/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/` | `/en/collection/colombia/banco-de-rio-hacha-5-pesos-1883/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-del-cauca-1-5-pesos-1888/` | `/en/collection/colombia/banco-del-cauca-1-5-pesos-1888/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-del-norte-5-pesos-1882/` | `/en/collection/colombia/banco-del-norte-5-pesos-1882/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-hipotecario-5-pesos-1881/` | `/en/collection/colombia/banco-hipotecario-5-pesos-1881/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-internacional-1-peso-1884/` | `/en/collection/colombia/banco-internacional-1-peso-1884/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-nacional-25-pesos-1895/` | `/en/collection/colombia/banco-nacional-25-pesos-1895/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/banco-union-cartagena-1-peso-1880s/` | `/en/collection/colombia/banco-union-cartagena-1-peso-1880s/` | catalog IDs stay untranslated in copy; issuer name kept |
| banknote | `/coleccion/colombia/boyaca-libranza-500-pesos-1883/` | `/en/collection/colombia/boyaca-warrant-500-pesos-1883/` | translated |
| banknote | `/coleccion/colombia/cartagena-1-real-1813/` | `/en/collection/colombia/cartagena-1-real-1813/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/departamento-de-antioquia-centavos/` | `/en/collection/colombia/departamento-de-antioquia-centavos/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/colombia/emisiones-en-el-extranjero/` | `/en/collection/colombia/issues-printed-abroad/` | hub/other |
| banknote | `/coleccion/colombia/estado-soberano-cauca-5-pesos-1882/` | `/en/collection/colombia/sovereign-state-cauca-5-pesos-1882/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/estado-soberano-cundinamarca-1-peso-1870/` | `/en/collection/colombia/sovereign-state-cundinamarca-1-peso-1870/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/estado-soberano-panama-3-pesos-1865/` | `/en/collection/colombia/sovereign-state-panama-3-pesos-1865/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/nueva-granada-1-peso-1861/` | `/en/collection/colombia/new-granada-1-peso-1861/` | catalog IDs stay untranslated in copy |
| profile | `/coleccion/colombia/perfil-antonio-narino/` | `/en/collection/colombia/profile-antonio-narino/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/colombia/perfil-aristides-fernandez/` | `/en/collection/colombia/profile-aristides-fernandez/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/colombia/perfil-francisco-de-paula-santander/` | `/en/collection/colombia/profile-francisco-de-paula-santander/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/colombia/perfil-german-gutierrez-de-pineres/` | `/en/collection/colombia/profile-german-gutierrez-de-pineres/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/colombia/perfil-rafael-nunez/` | `/en/collection/colombia/profile-rafael-nunez/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/colombia/perfil-simon-bolivar/` | `/en/collection/colombia/profile-simon-bolivar/` | proper-noun profile: translate `perfil` only |
| banknote | `/coleccion/colombia/republica-1904-serie/` | `/en/collection/colombia/republic-1904-series/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/republica-1910-1915-emisiones/` | `/en/collection/colombia/republic-1910-1915-issues/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/republica-bolivar-1-2-pesos-1882/` | `/en/collection/colombia/republica-bolivar-1-2-pesos-1882/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/colombia/vicente-villa-e-hijos-5-pesos/` | `/en/collection/colombia/vicente-villa-e-hijos-5-pesos/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/colombia/` | `/en/collection/colombia/` | hub/other |
| other | `/coleccion/departamento-del-tesoro-de-ee-uu/` | `/en/collection/us-department-of-the-treasury/` | hub/other |
| banknote | `/coleccion/diez-dolares-1934-distritos/` | `/en/collection/ten-dollars-1934-districts/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/ecuador/100-sucres-1993/` | `/en/collection/ecuador/100-sucres-1993/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/ecuador/` | `/en/collection/ecuador/` | hub/other |
| banknote | `/coleccion/filipinas/1-peso-victory-series-66/` | `/en/collection/philippines/1-peso-victory-series-66/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/filipinas/2-pesos-victory-series-66/` | `/en/collection/philippines/2-pesos-victory-series-66/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/filipinas/5-pesos-victory-series-66/` | `/en/collection/philippines/5-pesos-victory-series-66/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/filipinas/serie-victory-no-66/` | `/en/collection/philippines/victory-series-no-66/` | series hub; Victory Series No. 66 stays untranslated in copy |
| other | `/coleccion/filipinas/` | `/en/collection/philippines/` | hub/other |
| banknote | `/coleccion/emisiones-promocionales/food-coupon-1-dolar-2000/` | `/en/collection/promotional-issues/food-coupon-1-dollar-2000/` | translated |
| banknote | `/coleccion/emisiones-promocionales/food-coupon-10-dolares-2000/` | `/en/collection/promotional-issues/food-coupon-10-dollars-2000/` | translated |
| banknote | `/coleccion/emisiones-promocionales/food-coupon-2-dolares-1967/` | `/en/collection/promotional-issues/food-coupon-2-dollars-1967/` | translated |
| banknote | `/coleccion/emisiones-promocionales/food-coupon-5-dolares-2000/` | `/en/collection/promotional-issues/food-coupon-5-dollars-2000/` | translated |
| banknote | `/coleccion/emisiones-promocionales/food-coupon-50-centavos-1967/` | `/en/collection/promotional-issues/food-coupon-50-cents-1967/` | translated |
| other | `/coleccion/emisiones-promocionales/` | `/en/collection/promotional-issues/` | hub/other |
| other | `/coleccion/food-coupons-usda/` | `/en/collection/usda-food-coupons/` | hub/other |
| banknote | `/coleccion/giori-press-test-note/` | `/en/collection/giori-press-test-note/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/giori-press-test-note-lincoln-memorial-uniface/` | `/en/collection/giori-press-test-note-lincoln-memorial-uniface/` | Rothberg RGMB1/0NSU and Giori/Magna stay untranslated |
| banknote | `/coleccion/hagerstown-bank-maryland/` | `/en/collection/hagerstown-bank-maryland/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/moneda-colonial/nueva-jersey-6-chelines-1776/` | `/en/collection/colonial-paper-money/new-jersey-6-shillings-1776/` | catalog IDs stay untranslated in copy |
| profile | `/coleccion/moneda-colonial/perfil-alexander-hamilton/` | `/en/collection/colonial-paper-money/profile-alexander-hamilton/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/moneda-colonial/perfil-andrew-jackson/` | `/en/collection/colonial-paper-money/profile-andrew-jackson/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/moneda-colonial/perfil-benjamin-franklin/` | `/en/collection/colonial-paper-money/profile-benjamin-franklin/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/moneda-colonial/perfil-george-washington/` | `/en/collection/colonial-paper-money/profile-george-washington/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/moneda-colonial/perfil-thomas-jefferson/` | `/en/collection/colonial-paper-money/profile-thomas-jefferson/` | proper-noun profile: translate `perfil` only |
| banknote | `/coleccion/moneda-colonial/provincia-de-pensilvania/` | `/en/collection/colonial-paper-money/province-of-pennsylvania/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/colombia/santa-marta-1-4-real-1820/` | `/en/collection/colombia/santa-marta-quarter-real-1820/` | catalog IDs (KM, Restrepo) stay untranslated in copy |
| coin | `/coleccion/ducado-oro-utrecht-1761/` | `/en/collection/1761-utrecht-gold-ducat/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/` | `/en/collection/spanish-colonial-coinage/1-escudo-carlos-iii-1774/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1787/` | `/en/collection/spanish-colonial-coinage/1-escudo-carlos-iii-1787/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/1-escudo-carlos-iv-1802/` | `/en/collection/spanish-colonial-coinage/1-escudo-carlos-iv-1802/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1811/` | `/en/collection/spanish-colonial-coinage/1-escudo-fernando-vii-1811/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/` | `/en/collection/spanish-colonial-coinage/1-escudo-fernando-vii-1820/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/2-escudos-carlos-iv-1791/` | `/en/collection/spanish-colonial-coinage/2-escudos-carlos-iv-1791/` | catalog IDs stay untranslated in copy |
| coin | `/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/` | `/en/collection/spanish-colonial-coinage/2-escudos-felipe-v-bogota/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/moneda-colonial-espanola/` | `/en/collection/spanish-colonial-coinage/` | hub/other |
| other | `/coleccion/moneda-colonial/` | `/en/collection/colonial-paper-money/` | hub/other |
| banknote | `/coleccion/polimero-mundial/bangladesh-10-taka-2000/` | `/en/collection/world-polymer/bangladesh-10-taka-2000/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/brazil-10-reais-2000/` | `/en/collection/world-polymer/brazil-10-reais-2000/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/brunei-ringgit/` | `/en/collection/world-polymer/brunei-ringgit/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/bulgaria-20-leva-2005/` | `/en/collection/world-polymer/bulgaria-20-leva-2005/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/catar-100-riyals/` | `/en/collection/world-polymer/qatar-100-riyals/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/chile-1000-2000-pesos/` | `/en/collection/world-polymer/chile-1000-2000-pesos/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/china-100-yuan-2000/` | `/en/collection/world-polymer/china-100-yuan-2000/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/costa-rica-20-1000-colones/` | `/en/collection/world-polymer/costa-rica-20-1000-colones/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/guatemala-1-5-quetzales/` | `/en/collection/world-polymer/guatemala-1-5-quetzales/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/haiti-1-2-50-gourdes/` | `/en/collection/world-polymer/haiti-1-2-50-gourdes/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/honduras-20-lempiras-2008/` | `/en/collection/world-polymer/honduras-20-lempiras-2008/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/hong-kong-10-dolares-2007/` | `/en/collection/world-polymer/hong-kong-10-dollars-2007/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/islas-salomon-2-dolares-2001/` | `/en/collection/world-polymer/solomon-islands-2-dollars-2001/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/kazajistan-1000-tenge/` | `/en/collection/world-polymer/kazakhstan-1000-tenge/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/malasia-ringgit/` | `/en/collection/world-polymer/malaysia-ringgit/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/mexico-20-50-100-pesos/` | `/en/collection/world-polymer/mexico-20-50-100-pesos/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/mozambique-20-50-100-meticais/` | `/en/collection/world-polymer/mozambique-20-50-100-meticais/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/nepal-10-rupias-2005/` | `/en/collection/world-polymer/nepal-10-rupees-2005/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/nicaragua-10-20-cordobas/` | `/en/collection/world-polymer/nicaragua-10-20-cordobas/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/nigeria-naira/` | `/en/collection/world-polymer/nigeria-naira/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/oman-5-rials-2010/` | `/en/collection/world-polymer/oman-5-rials-2010/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/papua-nueva-guinea-kina/` | `/en/collection/world-polymer/papua-new-guinea-kina/` | catalog IDs stay untranslated in copy |
| profile | `/coleccion/polimero-mundial/perfil-malietoa-tanumafili-ii/` | `/en/collection/world-polymer/profile-malietoa-tanumafili-ii/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/polimero-mundial/perfil-manuel-rodriguez/` | `/en/collection/world-polymer/profile-manuel-rodriguez/` | proper-noun profile: translate `perfil` only |
| banknote | `/coleccion/polimero-mundial/republica-dominicana-20-pesos-2009/` | `/en/collection/world-polymer/dominican-republic-20-pesos-2009/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/rumania-lei/` | `/en/collection/world-polymer/romania-lei/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/samoa-2-tala/` | `/en/collection/world-polymer/samoa-2-tala/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/sri-lanka-200-rupias-1998/` | `/en/collection/world-polymer/sri-lanka-200-rupees-1998/` | translated |
| banknote | `/coleccion/polimero-mundial/suazilandia-emalangeni/` | `/en/collection/world-polymer/eswatini-emalangeni/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/taiwan-50-dolares/` | `/en/collection/world-polymer/taiwan-50-dollars/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/polimero-mundial/zambia-kwacha/` | `/en/collection/world-polymer/zambia-kwacha/` | catalog IDs stay untranslated in copy |
| other | `/coleccion/polimero-mundial/` | `/en/collection/world-polymer/` | hub/other |
| banknote | `/coleccion/pop-art/donald-trump-mugshot/` | `/en/collection/pop-art/donald-trump-mugshot/` | kept |
| banknote | `/coleccion/pop-art/life-is-beautiful-spray-cans/` | `/en/collection/pop-art/life-is-beautiful-spray-cans/` | kept |
| banknote | `/coleccion/pop-art/lionel-messi-leo/` | `/en/collection/pop-art/lionel-messi-leo/` | kept |
| banknote | `/coleccion/pop-art/pele-bicycle-kick-the-king/` | `/en/collection/pop-art/pele-bicycle-kick-the-king/` | kept |
| banknote | `/coleccion/pop-art/warhol-basquiat/` | `/en/collection/pop-art/warhol-basquiat/` | kept |
| other | `/coleccion/pop-art/` | `/en/collection/pop-art/` | hub/other |
| banknote | `/coleccion/puerto-rico/billete-de-canje-1-peso-1895/` | `/en/collection/puerto-rico/exchange-note-1-peso-1895/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/puerto-rico/junta-central-cuba-1869/` | `/en/collection/puerto-rico/junta-central-cuba-1869/` | catalog IDs stay untranslated in copy |
| profile | `/coleccion/puerto-rico/perfil-alejandro-ramirez/` | `/en/collection/puerto-rico/profile-alejandro-ramirez/` | proper-noun profile: translate `perfil` only |
| profile | `/coleccion/puerto-rico/perfil-jose-morales-lemus/` | `/en/collection/puerto-rico/profile-jose-morales-lemus/` | proper-noun profile: translate `perfil` only |
| banknote | `/coleccion/puerto-rico/republica-de-cuba-1-peso-1869/` | `/en/collection/puerto-rico/republic-of-cuba-1-peso-1869/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/puerto-rico/tesoreria-nacional-25-pesos-1813/` | `/en/collection/puerto-rico/national-treasury-25-pesos-1813/` | translated |
| other | `/coleccion/puerto-rico/` | `/en/collection/puerto-rico/` | hub/other |
| banknote | `/coleccion/reserva-federal/cien-dolares-1990-cleveland/` | `/en/collection/federal-reserve/one-hundred-dollars-1990-cleveland/` | translated |
| other | `/coleccion/reserva-federal/` | `/en/collection/federal-reserve/` | hub/other |
| banknote | `/coleccion/ringling-bros-50-aniversario-baraboo/` | `/en/collection/ringling-bros-50th-anniversary-baraboo/` | translated |
| banknote | `/coleccion/state-bank-new-brunswick/1-dolar/` | `/en/collection/state-bank-new-brunswick/1-dollar/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/un-dolar-norte-africa-1935a/` | `/en/collection/one-dollar-north-africa-1935a/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/un-dolar-sello-rojo-1928/` | `/en/collection/one-dollar-red-seal-1928/` | catalog IDs stay untranslated in copy |
| banknote | `/coleccion/veinte-dolares-hawaii-1934/` | `/en/collection/twenty-dollars-hawaii-1934/` | catalog IDs stay untranslated in copy |

### B. Noticias (55 published) — slug ES → EN
| ES slug | Proposed EN slug | Title |
|---|---|---|
| `al-sur-del-mundo-subasta-2500-piezas` | `al-sur-del-mundo-auction-2500-lots` | Al Sur del Mundo subasta más de 2.500 piezas |
| `bank-al-maghrib-moneda-27-anos-mohamed-vi` | `bank-al-maghrib-27-years-mohamed-vi-coin` | Bank Al-Maghrib acuña moneda por los 27 años de Mohamed VI |
| `banxico-medallas-dinosaurios-casa-moneda` | `banxico-dinosaur-medals-mint` | Banxico vende medallas con dinosaurios: precios y compra |
| `bessent-moneda-250-anos-independencia-eeuu` | `bessent-250-years-us-independence-coin` | Bessent anuncia una moneda conmemorativa por los 250 años de EE. UU. |
| `billete-10000-pesos-lazaro-cardenas-canje` | `10000-pesos-lazaro-cardenas-exchange` | Billete de 10.000 pesos: Banxico explica el canje |
| `billete-2-dolares-serie-baja` | `2-dollar-bill-low-serial` | El billete de $2 con serie L00000002A que vale más de US$5.000 |
| `billete-20000-chile-serie-anverso-falla` | `chile-20000-peso-note-obverse-error` | El $20.000 chileno que puede valer hasta $200.000 |
| `billete-50000-pesos-colombia-valor` | `colombia-50000-peso-note-value` | El billete de $50.000 que puede valer más de un millón |
| `billetes-1-dolar-coleccionistas` | `1-dollar-bills-for-collectors` | Qué debes revisar en billetes de $1 para saber si vale miles de dólares para los |
| `billetes-2-dolares-7-detalles` | `2-dollar-bills-7-details` | 7 detalles que podrían hacer que un billete de $2 valga mucho para los coleccion |
| `billetes-mexicanos-coleccionables` | `collectible-mexican-banknotes` | ¿Tienes alguno? Estos son los billetes mexicanos coleccionables a detalle |
| `casa-moneda-condorito-fichas-conmemorativas` | `mint-condorito-commemorative-tokens` | Casa de Moneda homenajea a Condorito con fichas |
| `casa-museo-cecilio-acosta-muestra-bandera-numismatica` | `casa-museo-cecilio-acosta-numismatic-flag-exhibit` | Casa Museo Cecilio Acosta: bandera y numismática |
| `centenario-otras-8-monedas-valen-fortuna` | `centennial-and-8-other-coins-worth-a-fortune` | El centenario y otras 8 monedas que hoy podrían valer una fortuna |
| `coleccionistas-chaquenos-preservan-memoria` | `chaco-collectors-preserve-memory` | Los coleccionistas chaqueños que preservan la memoria en cada pieza |
| `convencion-sociedad-numismatica-saltillo-2026` | `numismatic-society-convention-saltillo-2026` | Saltillo: convención numismática el 15 y 16 de agosto |
| `encuentro-coleccionistas-la-plata-2026` | `collectors-meeting-la-plata-2026` | La Plata sede de encuentro de coleccionistas |
| `exhibicion-peso-independiente-ohiggins-talca` | `exhibition-independent-peso-ohiggins-talca` | Exhiben en Talca el peso independiente de 1817 |
| `expo-coleccionismo-moneda-argentina-corrientes` | `collecting-expo-argentina-corrientes` | Cien años de moneda argentina en Corrientes |
| `flowing-hair-1794-valor-85-millones` | `flowing-hair-1794-valued-at-8-5-million` | Flowing Hair 1794: el dólar que llega a US$8,5 millones |
| `gobierno-monedas-oro-cerdo-iberico` | `government-iberian-pig-gold-coins` | España autoriza 5.000 monedas de oro del cerdo ibérico |
| `iii-encuentro-numismatico-arequipa-2026` | `iii-numismatic-meeting-arequipa-2026` | Arequipa exhibe 390 piezas en su III Encuentro Numismático |
| `jornadas-nacionales-numismatica-la-plata-2026` | `national-numismatic-days-la-plata-2026` | La Plata sede de las XLVI Jornadas Nacionales de Numismática |
| `legado-tren-oro-renacimiento-forint-hungria` | `gold-train-legacy-forint-hungary-renaissance` | Legado del tren de oro y el forint en Budapest |
| `luis-lanza-ceca-valor-moneda-antigua` | `luis-lanza-mint-value-of-old-coins` | Ceca, fecha y conservación: claves del valor numismático |
| `man-239-monedas-numismatica-andalusi` | `man-239-andalusi-numismatic-coins` | El Museo Arqueológico Nacional incorpora 239 monedas de gran relevancia a su col |
| `medalla-sistema-solar-heptagonal` | `heptagonal-solar-system-medal` | Medalla heptagonal del Sistema Solar |
| `moneda-10-pesos-octogonal-chile` | `chile-octagonal-10-pesos` | La moneda octogonal de $10 chilena que se cotiza en más de $500.000 |
| `moneda-100-pesos-estado-mexico-primera-fase` | `100-pesos-estado-de-mexico-first-phase` | Tras aumento de la plata, ¿cuánto vale la moneda de $100 del Estado de México, p |
| `moneda-2-escudos-chile-1971-caupolican` | `chile-2-escudos-1971-caupolican` | La moneda chilena de 2 escudos que puede valer $2 millones |
| `moneda-2-euros-grace-kelly` | `2-euro-grace-kelly-coin` | ¿Vale 1.000 euros la moneda de 2 € que llevas en la cartera? |
| `moneda-20-bicentenario-independencia-4-millones` | `20-peso-independence-bicentennial-4-million` | El $20 del Bicentenario se anuncia hasta en $4 millones |
| `moneda-20-tenochtitlan-banorte-73000` | `20-peso-tenochtitlan-banorte-73000` | Tenochtitlan 2021: Ámbito habla de hasta $73.000 |
| `moneda-500-chile-doble-fecha-2000` | `chile-500-peso-double-date-2000` | La moneda de $500 con doble fecha 2000 |
| `moneda-500-chile-rara-ensayos` | `rare-chile-500-peso-patterns` | Monedas de $500 chilenas de hasta $2 millones |
| `moneda-campeones-mundo-plata-edicion-limitada` | `world-champions-limited-silver-coin` | Moneda de plata por los campeones del mundo |
| `moneda-carausius-east-west-rail` | `carausius-coin-east-west-rail` | Hallan una moneda de Carausius en el East West Rail |
| `moneda-chipre-salamina-2500-anos` | `cyprus-salamis-coin-2500-years` | Una moneda chipriota de 2.500 años ilumina el antiguo comercio con Israel |
| `moneda-eeuu-1796-valor-185-millones` | `us-1796-coin-valued-at-18-5-million` | La moneda de EE.UU. que puede alcanzar un valor de US$1,85 millones: qué la hace |
| `moneda-trump-250-aniversario-primeras` | `trump-coin-250th-anniversary-first-strikes` | EE. UU. acuña monedas con Trump por el 250.º aniversario |
| `moneda-vaticano-papa-leon-xiv` | `vatican-coin-pope-leo-xiv` | Vaticano emite euros con la imagen del Papa León XIV |
| `monedas-100-chilenas-copihues-coleccionistas` | `chilean-100-peso-copihue-coins-collectors` | Monedas de $100 chilenas de hasta $800 mil |
| `monedas-25-centavos-valen-fortuna` | `25-cent-coins-worth-a-fortune` | Monedas de 25 centavos que podrían valer una fortuna |
| `monedas-anos-60-valen-150000` | `1960s-coins-worth-150000` | 10 monedas de los años 60 que pueden valer más de US$150.000 |
| `monedas-eeuu-podrian-valer-143750` | `us-coins-could-be-worth-143750` | 10 monedas de EE.UU. que podrían valer hasta US$143.750 |
| `monedas-guatemala-quetzal-plata-pagos-electronicos` | `guatemala-quetzal-silver-coins-electronic-payments` | Del quetzal de plata a los pagos electrónicos |
| `monedas-mexicanas-valen-miles-pesos` | `mexican-coins-worth-thousands-of-pesos` | Monedas mexicanas que cotizan miles en catálogos |
| `monedas-oro-robadas-museo-albacete-valor` | `stolen-gold-coins-albacete-museum-value` | Monedas de oro robadas en Albacete: 200.000 € |
| `monedas-spiderman-plata-999-relieve-3d` | `spiderman-999-silver-3d-coins` | Monedas de Spider-Man en plata .999 y relieve 3D |
| `muestra-billetes-antiguos-tabasco-septiembre` | `exhibition-old-banknotes-tabasco-september` | Tabasco exhibirá billetes del Banco de Tabasco en septiembre |
| `mundial-2026-moneda-conmemorativa-espana` | `world-cup-2026-commemorative-coin-spain` | España acuñará una moneda por la victoria en el Mundial 2026 |
| `numismatica-encuentro-coleccionistas-pereira` | `numismatic-collectors-meeting-pereira` | Numismática reúne colecciones de todo el país en Pereira |
| `paysandu-primer-encuentro-numismatico` | `paysandu-first-numismatic-meeting` | Paysandú tuvo su primer encuentro numismático |
| `primera-casa-moneda-filadelfia-firstival` | `first-philadelphia-mint-firstival` | Filadelfia celebra la primera Casa de Moneda de EE. UU. |
| `tesoro-monedas-andalusies-cordoba-man` | `andalusi-coin-hoard-cordoba-man` | Córdoba y el tesoro andalusí que refuerza al MAN |

### C. Blog (9 published) — slug ES → EN
| ES slug | Proposed EN slug | Title |
|---|---|---|
| `como-empezar-coleccion-billetes` | `how-to-start-a-banknote-collection` | Cómo empezar una colección de billetes |
| `como-identificar-billetes-falsos` | `how-to-identify-counterfeit-banknotes` | Cómo identificar billetes falsos: elementos de seguridad |
| `diferencia-numismatica-notafilia` | `difference-between-numismatics-and-notaphily` | Diferencia entre numismática y notafilia |
| `mylar-si-plastico-no-como-guardar-billetes` | `mylar-yes-plastic-no-how-to-store-banknotes` | Mylar sí, plástico no: cómo guardar tus billetes |
| `numeros-serie-especiales-billetes` | `fancy-serial-numbers-on-banknotes` | Números de serie especiales: por qué algunos billetes valen más |
| `origenes-banca-comercial-colombia-banca-libre` | `origins-of-commercial-banking-in-colombia-free-banking` | Orígenes de la banca comercial en Colombia: la banca libre, 1870-1886 |
| `origenes-banca-comercial-puerto-rico` | `origins-of-commercial-banking-in-puerto-rico` | Orígenes de la banca comercial en Puerto Rico |
| `personajes-billetes-colombia` | `figures-on-colombia-banknotes` | Personajes en los billetes de Colombia |
| `tres-imprentas-misterio-pie-imprenta-billetes-colombianos` | `three-printers-imprint-mystery-colombian-banknotes` | ¿Tres imprentas? Pies de imprenta colombianos |

### D. Logros (1 file, draft — not built)
| File | draft | Title |
|---|---|---|
| `placeholder` | `true` | Placeholder — no publicar |

### E. Glossary (95 terms) — ES slug → EN slug from `termEn`
| ES slug | termEs | termEn | Proposed EN slug | category | source |
|---|---|---|---|---|---|
| `abrasiones` | Abrasiones | Abrasions | `abrasions` | Conservación | suggested |
| `acumulacion` | Acumulación | Accumulation | `accumulation` | Coleccionismo | suggested |
| `anepigrafico` | Anepigráfico | Anepigraphic | `anepigraphic` | Diseño | suggested |
| `anverso` | Anverso | Obverse | `obverse` | Diseño | site |
| `apareamiento-de-troqueles` | Apareamiento de troqueles | Die Marriage | `die-marriage` | Coleccionismo | suggested |
| `banca-libre` | Banca libre | Free banking | `free-banking` | Emisión | site |
| `banco-emisor` | Banco emisor | Issuing bank / authority | `issuing-bank-authority` | Emisión | site |
| `billete-alterado` | Billete alterado | Altered Note | `altered-note` | Coleccionismo | suggested |
| `billete-de-banco-obsoleto` | Billete de banco obsoleto | Obsolete Bank Notes | `obsolete-bank-notes` | Emisión | suggested |
| `billete-de-reemplazo-estrella` | Billete de reemplazo (estrella) | Replacement (star) note | `replacement-star-note` | Coleccionismo | suggested |
| `billete-mula` | Billete mula | Mule Notes | `mule-notes` | Coleccionismo | suggested |
| `billete-provisional` | Billete provisional | Provisional note | `provisional-note` | Emisión | suggested |
| `billete-sin-circular` | Sin circular (UNC) | Uncirculated (UNC) | `uncirculated-unc` | Conservación | suggested |
| `billete-web` | Billete web | Web Notes | `web-notes` | Producción | suggested |
| `billon` | Billón | Billon | `billon` | Producción | suggested · same-as-ES |
| `c-day` | C-Day | Conversion Day | `conversion-day` | Emisión | site |
| `cedula-hipotecaria` | Cédula hipotecaria | Mortgage bond / certificate | `mortgage-bond-certificate` | Emisión | site |
| `cordoncillo` | Cordoncillo | Cordoncillo | `cordoncillo` | Diseño | suggested · same-as-ES termEn=termEs |
| `cospel` | Cospel | Cospel | `cospel` | Producción | suggested · same-as-ES termEn=termEs |
| `curso-legal` | Curso legal | Legal tender | `legal-tender` | Emisión | site |
| `desmonetizado` | Desmonetizado | Demonetized | `demonetized` | Emisión | site |
| `deuda-flotante` | Deuda flotante | Floating debt note | `floating-debt-note` | Emisión | site |
| `diez-milesimas-10-mils` | Diez milésimas (10 mils) | 10 Mil | `10-mil` | Producción | suggested |
| `dispositivo-opticamente-variable-ovd` | Dispositivo ópticamente variable (OVD) | Optically variable device (OVD) | `optically-variable-device-ovd` | Diseño | site |
| `dracma` | Dracma | Drachm | `drachm` | Monedas y divisas | suggested |
| `emalangeni-lilangeni` | Emalangeni (Lilangeni) | Emalangeni (Lilangeni) | `emalangeni-lilangeni` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `emision-conmemorativa` | Emisión conmemorativa | Commemorative issue | `commemorative-issue` | Emisión | site |
| `ensayador` | Ensayador | Assayer | `assayer` | Producción | suggested |
| `epq-calidad-de-papel-excepcional` | EPQ (Calidad de Papel Excepcional) | EPQ (Exceptional Paper Quality) | `epq-exceptional-paper-quality` | Conservación | suggested |
| `error-de-impresion` | Error de impresión | Printing error | `printing-error` | Coleccionismo | site |
| `escala-sheldon` | Escala Sheldon | Sheldon Scale | `sheldon-scale` | Conservación | suggested |
| `escripofilia` | Escripofilia | Escripofilia | `escripofilia` | Disciplina | suggested · same-as-ES termEn=termEs |
| `escudo-de-armas` | Escudo de armas | Coat of arms | `coat-of-arms` | Diseño | site |
| `estado-basal` | Estado basal | Basal State | `basal-state` | Conservación | suggested |
| `estado-soberano` | Estado soberano | Sovereign state issue | `sovereign-state-issue` | Emisión | site |
| `exonumia` | Exonumia | Exonumia | `exonumia` | Disciplina | suggested · same-as-ES termEn=termEs |
| `extremadamente-fino-ebc-ef` | Extremadamente Fino (EBC/EF) | Extremely Fine (EF) | `extremely-fine-ef` | Conservación | suggested |
| `faja` | Faja | Strap | `strap` | Producción | suggested |
| `fajo-ladrillo` | Fajo (ladrillo) | Brick | `brick` | Producción | suggested |
| `filigrana` | Filigrana | Watermark | `watermark` | Diseño | site |
| `firma` | Firma | Signature | `signature` | Diseño | site |
| `friedberg` | Catálogo Friedberg | Friedberg catalog | `friedberg-catalog` | Coleccionismo | site |
| `guilloche` | Guilloché | Guilloche | `guilloche` | Diseño | site · same-as-ES |
| `hilo-de-seguridad` | Hilo de seguridad | Security thread | `security-thread` | Diseño | site |
| `intaglio` | Intaglio | Intaglio printing | `intaglio-printing` | Producción | site |
| `kopek` | Kopek | Kopek | `kopek` | Monedas y divisas | suggested · same-as-ES termEn=termEs |
| `kwacha` | Kwacha | Kwacha | `kwacha` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `leu-lei` | Leu / Lei | Leu / Lei | `leu-lei` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `leyenda` | Leyenda | Legend | `legend` | Diseño | suggested |
| `litografia` | Litografía | Lithography | `lithography` | Producción | site |
| `macuquina-cob` | Macuquina (cob) | Cobs | `cobs` | Producción | suggested |
| `marcas-de-ajuste` | Marcas de ajuste | Adjustment Marks | `adjustment-marks` | Producción | suggested |
| `marcas-de-bolsa` | Marcas de bolsa | Bag Marks | `bag-marks` | Conservación | suggested |
| `marcas-de-funda-de-album` | Marcas de funda de álbum | Album Slide Marks | `album-slide-marks` | Conservación | suggested |
| `microimpresion` | Microimpresión | Microprinting | `microprinting` | Diseño | site |
| `monedas-antiguas` | Monedas antiguas | Ancients | `ancients` | Coleccionismo | suggested |
| `notafilia` | Notafilia | Notaphily | `notaphily` | Disciplina | site |
| `numeracion-especial` | Numeración especial | Fancy Serial Number | `fancy-serial-number` | Coleccionismo | suggested |
| `numeracion-radar` | Numeración radar | Radar Note | `radar-note` | Coleccionismo | suggested |
| `numeracion` | Numeración | Serial numbering | `serial-numbering` | Diseño | site |
| `numismatica` | Numismática | Numismatics | `numismatics` | Disciplina | site |
| `orla` | Orla | Border / frame | `border-frame` | Diseño | site |
| `papel-moneda-fraccionario` | Papel moneda fraccionario | Fractional Currency | `fractional-currency` | Emisión | suggested |
| `patina` | Pátina | Toning | `toning` | Conservación | suggested |
| `peso` | Peso | Peso | `peso` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `pick` | Pick number | Pick number | `pick-number` | Coleccionismo | site · termEn=termEs |
| `planchuela` | Planchuela | Planchet | `planchet` | Producción | suggested |
| `pliegue-de-fabrica` | Pliegue de fábrica | As-made Crease | `as-made-crease` | Producción | suggested |
| `polimero` | Polímero | Polymer | `polymer` | Producción | site |
| `quetzal` | Quetzal | Quetzal | `quetzal` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `real` | Real | Real | `real` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `recocido` | Recocido | Annealing | `annealing` | Producción | suggested |
| `registro-perfecto` | Registro perfecto | See-through register | `see-through-register` | Diseño | site |
| `resello` | Resello | Countermark | `countermark` | Emisión | suggested |
| `retrato` | Retrato | Portrait | `portrait` | Diseño | site |
| `reverso` | Reverso | Reverse | `reverse` | Diseño | site |
| `ringgit` | Ringgit | Ringgit | `ringgit` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `roseton` | Rosetón | Rosette | `rosette` | Diseño | site |
| `serie` | Serie | Series | `series` | Coleccionismo | site |
| `sin-circular-brillante-bu` | Sin circular brillante (BU) | Brilliant Uncirculated (BU) | `brilliant-uncirculated-bu` | Conservación | suggested |
| `sobresello` | Sobresello | Overprint | `overprint` | Emisión | site |
| `specimen` | Specimen | Specimen | `specimen` | Coleccionismo | site · same-as-ES termEn=termEs |
| `superficies-alteradas` | Superficies alteradas | Altered Surfaces | `altered-surfaces` | Conservación | suggested |
| `sustrato-hibrido` | Sustrato híbrido | Hybrid substrate | `hybrid-substrate` | Producción | site |
| `sustrato` | Sustrato | Substrate | `substrate` | Producción | site |
| `tala` | Tala | Tālā | `tala` | Monedas y divisas | site · same-as-ES |
| `talla-dulce` | Talla dulce | Steel/copper engraving | `steel-copper-engraving` | Producción | site |
| `tasado` | Tasado | Appraised | `appraised` | Coleccionismo | suggested |
| `tenge` | Tenge | Tenge | `tenge` | Monedas y divisas | site · same-as-ES termEn=termEs |
| `tinta-fluorescente-uv` | Tinta fluorescente UV | UV fluorescent ink | `uv-fluorescent-ink` | Producción | site |
| `tinta-iridiscente` | Tinta iridiscente | Iridescent / metallic ink | `iridescent-metallic-ink` | Producción | site |
| `tyvek` | Tyvek | Tyvek | `tyvek` | Producción | site · same-as-ES termEn=termEs |
| `vale-al-portador` | Vale al portador | Bearer note | `bearer-note` | Emisión | site |
| `ventana-transparente` | Ventana transparente | Clear window | `clear-window` | Diseño | site |
| `vineta` | Viñeta | Vignette | `vignette` | Diseño | site |
