---
name: catalog-ficha
description: Write new catalog fichas from the markdown template (not cream-card HTML). Use when adding or updating /coleccion/ or /en/collection/ records, compiling src/content/fichas/, or publishing a bilingual catalog page.
---

# Catalog fichas — markdown first

New fichas are authored as Markdown. Do **not** copy the legacy cream-card (`#d8d2cd`) inline-HTML catalog templates.

## Source of truth

1. Copy `docs/templates/notofilia-ficha-template.md`.
2. Write the narrative body (Contexto, Diseño, Variedades, Estado, Fuentes).
3. Save under `src/content/fichas/<slug>.md` and a full English translation at `src/content/fichas/<slug>.en.md`.
4. Run `npm run compile:fichas`. Commit **both** the Markdown and the generated `src/content/catalog/*.json`. Series hubs may ship dedicated HTML (`astro-static`) instead of this compiler.

The user template body is the section outline. Do not duplicate **Cómo citar esta ficha** or **Reportar un error…** in the Markdown — `CatalogCitation` and `CatalogFeedback` render those.

## Publishing fields (compiler)

Add these in frontmatter without rewriting the template’s narrative sections:

| Field | Purpose |
| --- | --- |
| `ruta` | Spanish URL, e.g. `/coleccion/filipinas/1-peso-victory-series-66/` |
| `ruta_en` | English URL from `docs/i18n/AUDIT.md` §6 — never invent slugs |
| `titulo_seo` / `descripcion_seo` | `<title>` (≤60) and meta description (≤150) |
| `titulo_en` / `subtitulo_en` / `descripcion_en` | English h1 overlay (`i18n.en.recordTitle`) |
| `legacyFile` | Synthetic `*.dc.html` name for `_redirects` + `catalog-route-map.json` |
| `fuentes` | `{ kind, label, url?, note? }` — citation ladder; no majority retail |
| `cards` | Hub cards (`href`, `title`, `titleEn`, `image`, `imageWebp`, `alt`, `altEn`, …) |
| `piezas_relacionadas` or `related` | `{ href, title }` (Spanish paths; EN is derived from the pair registry) |
| `render` | `primary` (default for compiled fichas) |
| `resourced` | `true` when honesty fields are filled (`no confirmado` is valid) |

`scripts/compile-fichas.mjs` emits catalog JSON with `record.render: 'primary'`. English HTML is stored on `i18n.en.template` even for primary pages (`check-catalog-en-pairs.mjs` requires it).

## Rendering

`CatalogLayout` uses `mode="primary"` when `record.render === 'primary'`. Native chrome supplies breadcrumb, h1, subtitle, visible ficha técnica, related, citation, and feedback. The Markdown HTML is slotted after metadata. Do not wrap primary pages in the cream card.

## Specimen photos

Follow `.cursor/skills/catalog-submitted-images/SKILL.md`. Never replace, crop, or composite user photos.

## i18n

Spanish stays at the root URL. English lives under `/en/` with a translated slug from the audit table. Register the pair in `docs/i18n/AUDIT.md` §6 and `src/i18n/catalog-en-path-map.json`. Add supplement strings in `src/i18n/catalog-es-en-supplement.json` as needed.
