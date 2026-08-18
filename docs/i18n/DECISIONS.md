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
