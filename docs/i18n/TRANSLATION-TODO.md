# Translation TODO (English overlay)

Human-quality English pages only. Do not ship thin or machine stubs.
This list is the A4 deferral queue for later translators.

## Individual news (`/noticias/` → `/en/news/{slug}/`)

**Defer all 55 individual noticias.** They are time-stamped curated pieces dated July–August 2026, so the “>12 months old” skip does not apply by age. Bulk-translating 55 news posts in one pass would be thin. The English index at `/en/news/` lists them with Spanish titles (`lang="es"`) and Spanish hrefs.

When a piece is translated:

- Add `src/content/noticias-en/{english-slug}.md` with `pairEs: /noticias/{id}/`
- `fromNoticiasEn()` registers the pair automatically
- Prefer an English slug that names the event, not a calque of the Spanish id

## Individual catalog fichas (~144)

**Defer.** Country hubs (Colombia, Puerto Rico, Ecuador) and the collection / numismatics indexes are English; untranslated ficha hrefs stay Spanish on purpose.

Do not bulk-machine `titleEn` onto every JSON. Translate a ficha only when the whole page (title, description, `template`, alts, JSON-LD) is human English, then set `i18n.en` on the **same** JSON (never a second file).

## Remaining collection hubs

Spanish URLs stay canonical until a full English `i18n.en.template` exists.
Suggested English slugs follow `docs/i18n/AUDIT.md` §6:

| Spanish | Suggested English |
|---|---|
| `/coleccion/billete-obsoleto-estados-unidos/` | `/en/collection/obsolete-united-states-banknotes/` |
| `/coleccion/reserva-federal/` | `/en/collection/federal-reserve/` |
| `/coleccion/departamento-del-tesoro-de-ee-uu/` | `/en/collection/us-department-of-the-treasury/` |
| `/coleccion/moneda-colonial-espanola/` | `/en/collection/spanish-colonial-coinage/` |
| `/coleccion/polimero-mundial/` | `/en/collection/world-polymer/` |
| `/coleccion/certificados-de-pago-militar/` | `/en/collection/military-payment-certificates/` |
| `/coleccion/pop-art/` | `/en/collection/pop-art/` |
| `/coleccion/food-coupons-usda/` | `/en/collection/usda-food-coupons/` |
| `/coleccion/colombia/banca-libre/` | `/en/collection/colombia/free-banking/` |
| `/coleccion/colombia/emisiones-en-el-extranjero/` | `/en/collection/colombia/issues-printed-abroad/` |

On `/en/collection/` those hubs still link to the Spanish URL (honest).

## Search

`/buscar/` ↔ `/en/search/` is in AUDIT §6. **Defer.** Search stays `noindex`. English chrome is not worth a thin page until the filter copy is rewritten in one pass with `coleccion-hub.js`.

## Logros

Spanish `/logros/` is a placeholder draft. **Do not** invent an English achievements index.

## Glossary Wikipedia links

English term pages still point at the **Spanish** Wikipedia URLs stored on each entry (`wikipedia`). Translating those to `en.wikipedia.org` is a separate citation pass.

## Known chrome leftovers (not A4-owned)

- English search (`/en/search/`) remains deferred; header search `action` stays `/buscar/` on both trees.
- Unpaired catalog fichas and individual noticias still use Spanish hrefs on English pages (honest partial coverage).
