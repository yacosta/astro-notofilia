# Notofilia.com — standing requirements

Every page built in this project going forward must be:
- **SEO optimized**: concise `<title>` (≤60 chars), meta description (≤150 chars), meta keywords/robots/author, canonical link, Open Graph + Twitter Card tags, relevant JSON-LD structured data (WebSite/Organization/CreativeWork/BreadcrumbList as fitting), descriptive image alt text, compressed images (WebP + fallback via `<picture>` where practical).
- **Mobile friendly**: responsive layout (flex/grid + clamp()), no fixed-width overflow, tap targets ≥44px, text readable without zoom.
- **Accessible — ADA / Section 508 / WCAG 2.0 (AA)**: single `<h1>`, semantic landmarks (`header`/`main`/`footer`/`nav`), skip-to-content link, `lang` attribute (kept in sync with any language toggle), sufficient color contrast (4.5:1 normal text, 3:1 large text — verify opacity-based colors against actual background), keyboard-operable controls with visible focus states, `aria-*` states on custom controls (e.g. `aria-pressed`, `aria-live` where content updates dynamically), no keyboard traps, decorative vs. meaningful images distinguished correctly.

Apply this by default without being asked again.

**Image optimization (standing practice):** every image placed in `uploads/` — new uploads and existing ones — must be compressed before use: re-encode via canvas at the smallest quality that shows no visible artifact loss (check with view_image before committing), serve WebP with a JPEG/PNG fallback via `<picture>`, and generate a smaller responsive variant (e.g. a ~640px-wide version) for any image used full-bleed/hero at larger natural sizes. Never ship an uploaded image unprocessed.

**Noticias — no duplicates:** do not publish a second `/noticias/` post for the same story from a different outlet unless it adds material new facts. Prefer updating the existing piece (and citing the extra source) over parallel summaries.
