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

## Catalog submitted images

When adding or updating a catalog ficha, read and follow `.cursor/skills/catalog-submitted-images/SKILL.md`.
**Never edit or replace** user-submitted specimen photos (no stock substitutes, compositing, or
cropping holders). If the attachment is missing in the agent environment, stop and ask for the
file — do not ship a placeholder image.

## Search Console / sitemap HTTP errors

If GSC reports **General HTTP error** for `https://notofilia.com/sitemap.xml`, first probe the
live URL for `cf-mitigated: challenge`. The sitemap artifact in `public/` is usually fine; the
custom-domain Cloudflare zone (Bot Fight Mode / under-attack) is challenging the fetch.
`pages.dev` serving 200 XML while the apex returns a challenge confirms this. Fix with IP Access
**Allow** for Google ASN `AS15169` (or turn Bot Fight Mode off). See
`docs/search-console-sitemap.md` and `npm run allow:crawlers` / `npm run check:sitemap:live`.
