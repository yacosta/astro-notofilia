# Translation TODO (English overlay)

Human-quality English pages only. Do not ship thin or machine stubs.
This list is the A4 deferral queue for later translators.

## Individual news (`/noticias/` → `/en/news/{slug}/`)

**Defer all 61 individual noticias.** They are time-stamped curated pieces dated July–August 2026, so the “>12 months old” skip does not apply by age. Bulk-translating 57 news posts in one pass would be thin. The English index at `/en/news/` lists them with Spanish titles (`lang="es"`) and Spanish hrefs.

When a piece is translated:

- Add `src/content/noticias-en/{english-slug}.md` with `pairEs: /noticias/{id}/`
- `fromNoticiasEn()` registers the pair automatically
- Prefer an English slug that names the event, not a calque of the Spanish id

## Individual catalog fichas (~144)

**Done.** Every catalog JSON in `src/content/catalog/` now has `i18n.en` (`path` + `template`). English URLs follow `docs/i18n/AUDIT.md` Appendix A / §6.2. Spanish `path` and `template` are unchanged. Gate: `npm run check:en-pairs`.

Hub prose (Colombia, Puerto Rico, Ecuador, and the remaining collection hubs) is human-authored English. Piece overlays reuse `catalog-es-en.json` plus `catalog-es-en-supplement.json`. Proper nouns and issuer names stay in the original language.

## Remaining collection hubs

**Done.** English slugs follow `docs/i18n/AUDIT.md` §6. On `/en/collection/` paired hubs now link to their English URLs via the pair registry.

## Search

`/buscar/` ↔ `/en/search/` is in AUDIT §6. **Defer.** Search stays `noindex`. English chrome is not worth a thin page until the filter copy is rewritten in one pass with `coleccion-hub.js`.

## Logros

Spanish `/logros/` is a placeholder draft. **Do not** invent an English achievements index.

## Glossary Wikipedia links

English term pages still point at the **Spanish** Wikipedia URLs stored on each entry (`wikipedia`). Translating those to `en.wikipedia.org` is a separate citation pass.

## Known chrome leftovers (not A4-owned)

- English search (`/en/search/`) remains deferred; header search `action` stays `/buscar/` on both trees.
- Individual noticias still use Spanish hrefs on English pages (honest partial coverage). Catalog fichas are paired.
