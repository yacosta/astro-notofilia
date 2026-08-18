# Notofilia.com — agent notes

## Bilingual i18n guardrails (notofilia.com)
- Spanish is the primary language and lives at the ROOT URLs (/coleccion/..., /blog/,
  /noticias/). NEVER rename, move, redirect, or delete an existing Spanish route.
- English lives under /en/ with TRANSLATED slugs (e.g. /en/collection/colombia/). The
  approved slug table is in docs/i18n/AUDIT.md §6 — use it; do not invent new slugs.
- The ES↔EN pair registry (see docs/i18n/ARCHITECTURE.md) is the single source of truth
  for page pairs. hreflang tags, the language switcher, and the sitemap must all read
  from it — never hardcode a counterpart URL.
- hreflang: reciprocal es/en pairs + x-default pointing to the Spanish URL; emitted ONLY
  when a counterpart exists. Every page keeps a self-referencing canonical.
- NEVER add geo-based or Accept-Language-based redirects, in code or in Cloudflare
  config. A dismissible suggestion banner is the maximum allowed.
- English pages must be fully translated (title, meta description, headings, body, alt
  text, JSON-LD). Never publish machine-translated stubs or English chrome around
  Spanish body text. Unsure? Add the page to docs/i18n/TRANSLATION-TODO.md instead.
- Use the repo's bilingual glossary as the canonical ES↔EN dictionary for numismatic
  terms. Never translate proper nouns or catalog identifiers (Pick numbers, HT-numbers,
  NGC/PCGS grades).
- QA is judged on BUILT OUTPUT: after changes, run `astro build` and check dist/ HTML.
  Any unrendered placeholder ({{...}}, untranslated i18n keys, [object Object]) in
  built HTML is a release blocker (this site has been burned by this before).
- Do not degrade: existing GA tagging, Cloudflare Image Transformations / srcset /
  lightbox markup, or `astro check` cleanliness.
