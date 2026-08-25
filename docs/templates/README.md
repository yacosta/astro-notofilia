# Catalog ficha templates

Markdown is the source of truth for new catalog fichas. Legacy cream-card HTML in `src/content/catalog/*.json` remains for older pages.

## Files

- `notofilia-ficha-template.md` — reusable outline (frontmatter + body sections). Copy it; do not rewrite the template body when adding publishing fields.
- Authoring copies live in `src/content/fichas/`. Pair Spanish `*.md` with `*.en.md`.
- `scripts/compile-fichas.mjs` compiles those files into `src/content/catalog/*.json` with `record.render: "primary"`. Run `npm run compile:fichas` when you add a markdown ficha; it is not part of `prebuild`. Series hubs may use dedicated HTML instead.

## Publishing

1. Fill the template (identification, honesty fields, Fuentes).
2. Add compiler fields in frontmatter: `ruta`, `ruta_en`, `fuentes`, `cards`, `legacyFile`, SEO titles.
3. `npm run compile:fichas` (also runs in `prebuild`).
4. Add `scripts/catalog-route-map.json` + `public/_redirects` 301s for `legacyFile` (and the `.dc` sibling).
5. Register the ES↔EN pair in `docs/i18n/AUDIT.md` §6.

`CatalogLayout` slots the compiled Markdown HTML into native chrome (breadcrumb, h1, ficha técnica, cards, citation, feedback). Do not paste a second Cómo citar / Reportar block into the Markdown body.
