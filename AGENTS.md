# AGENTS.md

## Cursor Cloud specific instructions

Notofilia.com is a static [Astro 4](https://astro.build) site (no backend, database, or external services). Requires Node ≥20.3.0 (VM ships Node 22, which works).

- **Service**: single Astro dev server. Standard scripts live in `package.json` (`dev`, `build`, `preview`).
- **Run (dev)**: `npm run dev -- --host` serves on `http://localhost:4321` (bind `--host` so the Desktop/browser can reach it).
- **Build**: `npm run build` outputs the static site to `dist/`. `npm run preview` serves that build.
- **Lint**: there is no lint script. `astro check` is NOT wired up (it prompts to install `@astrojs/check` + `typescript`, which are not project deps) — don't rely on it; the `npm run build` is the validation step.
- Most catalog pages are hand-authored `public/*.dc.html` documents served verbatim (they use `{{ }}` / `${ }` syntax incompatible with Astro's compiler — see `README.md`). Only the homepage, 404, `blog/`, and `noticias/` routes are real `.astro` pages under `src/pages/`.
- Banknote images live in `public/uploads/` (~170 MB, already committed). Client interactivity (mega-menu, search, image lightbox/zoom) is driven by `public/support.js` at runtime.
