# i18n decisions log

Running log of choices for the bilingual `/en/` architecture. Agents append
entries; do not rewrite history — add a new dated item instead.

## 2026-08-18 — Phase 0 (orchestrator)

- **Branch:** `cursor/feat-bilingual-en-72d4` (Cloud Agent naming requirement).
  Intent matches the orchestration prompt's `feat/bilingual-en`.
- **Base:** `main` at `fb06fbd` (`Merge pull request #137`).
- **AGENTS.md:** created at repo root with the bilingual i18n guardrails.
- **Stack snapshot:** Astro `^7.2.2`, static output, Cloudflare Pages (`dist/` +
  `functions/`). Current language UX is a same-URL client-side toggle
  (`data-i18n`, `src/client/interface-lang.js`, `src/lib/ui-i18n.ts`,
  `src/lib/html-i18n.ts`) — document language stays `lang="es"`.
- **Non-negotiable:** Spanish root URLs must not change, redirect, or break.
- **No geo / Accept-Language redirects.** Optional dismissible suggestion only.
- **QA truth:** built `dist/` HTML, not the dev server.

## 2026-08-18 — Phase 1 A2 (i18n architect)

- **Routing:** manual `src/pages/en/` tree. Do **not** add Astro `i18n` to
  `astro.config.mjs` (`prefixDefaultLocale: false` still prefixes the *same*
  slug → `/en/coleccion/`, not `/en/collection/`). Docs:
  https://v7.docs.astro.build/en/guides/internationalization/
- **Slugs:** section map in `docs/i18n/ARCHITECTURE.md` §2; A3 seed pair
  `/coleccion/colombia/` ↔ `/en/collection/colombia/`.
- **Content:** catalog keeps one JSON entry + optional `i18n.en`; editorial
  later uses parallel `blog-en` / `noticias-en` / `logros-en`; glossary stays
  one bilingual file. No English files inside Spanish globs.
- **Registry:** `src/i18n/pairs.ts` is the only ES↔EN map (hreflang, switcher,
  sitemap). `html lang` flips to `en` on English URLs.
- **Full write-up:** `docs/i18n/ARCHITECTURE.md`.

## 2026-08-18 — Phase 2 A3 (routing & infrastructure)

- **Shipped:** `src/i18n/pairs.ts` + `t()` in `src/lib/ui-i18n.ts`; manual `src/pages/en/` tree (`/en/`, `/en/collection/colombia/`); Colombia-only `i18n.en` on catalog JSON; BaseHead self-canonical + reciprocal hreflang only when `getPair()` hits.
- **Collection nav on `/en/`:** points at `/en/collection/colombia/` because `/en/collection/` (the section index) is unpaired in A3. Honest partial coverage; A4 can add the index pair later.
- **Optional `src/pages/en/404.astro`:** `noindex`, not in `allPairs()`. Pages 404 remains `src/pages/404.astro` with an `/en/` path-sniff boot. Middleware may `fetch('/en/404/')` later (A6); A3 did not add Accept-Language logic.
- **`fromCatalog()` merge:** seed pair `/coleccion/colombia/` ↔ `/en/collection/colombia/` is identical to Colombia’s `i18n.en.path`. Identical `{es,en,kind}` merges; conflicting duplicates still throw at module init. A4 appends pairs by adding `i18n.en` without editing `pairs.ts` twice.
- **Locale type:** declared in both `pairs.ts` and `ui-i18n.ts` so `t()` consumers do not import the catalog JSON reader. Values are the same (`'es' | 'en'`).
- **EN homepage JSON-LD:** `inLanguage: 'en'`; `SearchAction` omitted until `/en/search/` exists.
- **Not done (later agents):** remaining catalog/editorial/glossary English (A4); sitemap/robots/GA (A5); replace ES/EN pill + stop `interface-lang.js` forcing `lang="es"` on `/en/` (A6).
- **Full write-up:** `docs/i18n/A3-REPORT.md`.

## 2026-08-18 — Phase 3 A5 (SEO plumbing / discovery)

- **RSS:** there is still no feed in the repo (AUDIT §1.5 / §5.4). **Do not add RSS as part of i18n.** The site remains sitemap-only. If a feed is added later, ship two separate files — `/rss.xml` (Spanish) and `/en/rss.xml` (English) — not a combined bilingual feed.
- **GA / analytics:** there is **no gtag/GA4 measurement ID** in source (privacy copy mentions GA4; CookieBanner gates `notofilia_cookie_consent`; WebVitals POSTs to `/api/web-vitals`). Do not invent a GA ID. Once GA lands, segment English as path prefix `/en/` **or** a `content_language` dimension. Web Vitals now send `content_language: 'en' | 'es'` from the path (`/en` or `/en/…` → `en`). WebVitals stays in BaseHead on both trees.
- **Cloudflare:** `public/_redirects` has no language-negotiation or `/en/` aliases (do not add `/en/coleccion/` → `/en/collection/`). `functions/_middleware.js` only 301s www→apex and, for `/en/*` misses, optionally serves prerendered `/en/404/` HTML with HTTP 404 via `env.ASSETS`. **No Accept-Language / geo redirects in repo.** Human dashboard: do **not** add a Bulk Redirect or Transform Rule that inspects `Accept-Language` or country. www→apex at the host level is already OK.
- **Sitemap:** `scripts/generate-sitemap.mjs` imports `allPairs()` (via `scripts/load-pairs.mjs` → `src/i18n/pairs.ts`). English `<loc>` values are `pair.en` **when** `src/pages/en/` has a static or `[slug]`/`[...slug]` builder (so registry-only glossary/static pairs are not advertised as 404s). Reciprocal `xhtml:link` hreflang (`es`, `en`, `x-default`→Spanish) only when **both** URLs are in the sitemap. `/buscar/`, `/en/search/`, `/404`, `/en/404/` omitted. News sitemap: Spanish noticias `news:language` `es`; paired English news articles (not `/en/news/` index) `en`.
- **Full write-up:** `docs/i18n/A5-REPORT.md`.

## 2026-08-18 — Phase 3 A4 (content translator; parallel with A5)

- **Shipped EN tree:** collection index + numismatics; Puerto Rico and Ecuador hubs (`i18n.en` overlay); full glossary (95 terms via existing `termEn`/`definitionEn`); 9 evergreen `blog-en` posts; news **index only**; contact, editorial, editorial/team, privacy-cookies, J.S.G. Boggs.
- **Deferred:** 55 individual noticias (time-stamped; bulk translation would be thin), ~144 catalog fichas, remaining hubs, `/en/search/`. See `docs/i18n/TRANSLATION-TODO.md`.
- **Pairs:** generators `fromGlossary` / `fromBlogEn` / `fromNoticiasEn` plus SEED indexes. Catalog still via `fromCatalog()`.
- **A6 follow-up:** EN Collection nav still pointed at `/en/collection/colombia/` after A3; should now target `/en/collection/`.
- **Full write-up:** `docs/i18n/A4-REPORT.md`.

## 2026-08-18 — Phase 4 A6 (language switcher)

- **Switcher:** server-rendered `<a href>` from `switchUrl(path, locale)` in `src/i18n/pairs.ts`. Current language is `<span aria-current="page">`; the other is the link. Visible text **ES** / **EN** plus sr-only ` — Español` / ` — English` (WCAG 2.5.3). No `#lang-es`/`#lang-en` buttons. No `interface-lang.js`.
- **Fallback:** exact pair → paired section index → homepage of target locale. Unpaired noticias → `/en/news/`. `/buscar/` → `/en/` because `/en/search/` is still unpaired. `/404` → `/en/`; `/en/404/` → `/`. Optional `data-i18n-fallback` + `title` when not an exact pair.
- **EN nav:** `hrefFor` uses `alternateUrl(href, 'en') ?? href`. Collection is `/en/collection/` (A4 pair). `/#logros-heading` → `/en/#logros-heading`. Search `action` stays `/buscar/` on both trees. CookieBanner / footer privacy → `/en/privacy-cookies/`.
- **No redirects:** no geo / Accept-Language; no last-language persist that forces `/` → `/en/`; no suggestion banner (CLS). Spanish `data-i18n` left inert. Hidden EN panels on editorial/privacy/PostArticle removed.
- **html lang:** EN pages stay `lang="en"`; nothing forces `es`. Spanish 404 keeps `/en/` path-sniff boot only.
- **Full write-up:** `docs/i18n/A6-REPORT.md`.

## 2026-08-18 — Phase 6 (orchestrator wrap-up)

- **A7:** `docs/i18n/QA-REPORT.md` — checks 1–10 PASS, **0 blockers**.
- **Warning fixes shipped:** `llms.txt` language paragraph updated; EN JSON-LD inventory property names via `inventoryProperties(stats, 'en')`; glossary `termEn` for Escripofilia→Scripophily, Cordoncillo→Reeded edge, Cospel→Coin blank (unique slugs; `Planchet` already used by Planchuela).
- **Left as deferred:** Spanish `catalog-index.json` filter keys on `/en/collection/` (W3); `/en/search/` (W4).
- **Launch:** `docs/i18n/LAUNCH-CHECKLIST.md`.

