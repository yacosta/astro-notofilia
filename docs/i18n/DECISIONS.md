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
