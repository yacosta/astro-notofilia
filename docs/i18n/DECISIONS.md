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
