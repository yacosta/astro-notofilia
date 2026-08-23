---
name: catalog-submitted-images
description: Never edit, replace, or substitute catalog specimen images submitted by the user. Use when adding or updating catalog fichas (/coleccion/, /en/collection/), processing uploads in public/uploads/, or when a user attaches a coin/banknote/note photo for the virtual collection.
---

# Catalog submitted images — do not edit or replace

When the user submits a photograph for a **catalog ficha** (coins, banknotes, MPC, pop art, polymer notes, etc.), that file is the authoritative visual record of **their** specimen. Treat it as read-only content unless they explicitly ask to change it.

## Hard rules

1. **Never replace** a submitted image with stock photography, museum scans, auction photos, NGC/PCGS cert downloads, Wikimedia, Numista CDN, or AI-generated substitutes — even if the submitted file is missing in the agent environment.
2. **Never edit** the specimen photograph: no cropping away holders/slabs, no compositing separate obverse/reverse assets, no recoloring, no inpainting, no rotation beyond automatic EXIF orientation, no removing backgrounds the user photographed.
3. **Never overwrite** an existing `public/uploads/` asset for a catalog entry with a different scene or specimen without explicit user approval.
4. **If the file is missing** (cloud agent cannot read the attachment, path only in markdown, 404 on disk): **stop and ask** the user to attach or commit the image. Do not ship a placeholder or “type illustration” to unblock the PR.

## What you may do (formatting only)

These are allowed **only on the user’s submitted source file**, and must preserve the full frame the user provided (whole slab, both faces, margins included):

| Action | Allowed? |
| --- | --- |
| Save/copy to `public/uploads/<slug>.{png,jpg}` | Yes — same pixels |
| Generate WebP + ~640px responsive variant | Yes — lossy re-encode only; no crop |
| Set `width` / `height` / `alt` in catalog JSON | Yes |
| `<picture>` / srcset wiring | Yes |

Do **not** treat “image optimization” in `CLAUDE.md` as permission to substitute or recompose catalog specimen photos. Optimization means **encode derivatives**, not **change the photograph**.

## Workflow for new catalog entries

1. **Locate the submitted file** before writing the ficha: attachment, committed path, or user-provided upload. Confirm with `view_image` / Read that it matches the described specimen (holder, cert label, year).
2. **Copy to** `public/uploads/` using the project’s naming convention. If the user’s draft uses `/images/monedas/…`, map to `/uploads/…` — **same file**, new path only.
3. **Run compression** (WebP + 640) from that source. Re-check visually: holder edges and labels still fully visible.
4. **Wire paths** in `src/content/catalog/*.json` (`record.images`, `ogImage`, template `<picture>`). Never point a ficha at an URL you did not receive from the user.
5. **If blocked** waiting for the image, land copy/i18n/routes in the PR but leave a clear blocker note — do **not** merge a wrong image to “finish” the task.

## Red flags — stop immediately

- “The attachment isn’t on disk; I’ll use a similar coin from Wikimedia/Heritage/NGC.”
- “I’ll composite obverse + reverse from separate sources.”
- “Placeholder until deploy; user can swap later.”
- Crop or `object-fit: cover` that hides the slab/holder on a submitted slab photo.

## Related project docs

- Catalog paths and i18n: `AGENTS.md`, `docs/i18n/ARCHITECTURE.md`
- General upload compression (non-substitution): `CLAUDE.md` → Image optimization
- Noticias duplicate policy (separate): `.cursor/rules/noticias-no-duplicates.mdc`
