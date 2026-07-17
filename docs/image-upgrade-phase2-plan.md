# Image Upgrade — Phase 2 execution plan (template updates)

_Grounded in the actual repo architecture (investigated 2026-07-17), which differs from
the original plan's assumptions in a few important ways. Read alongside
`image-upgrade-phase0.md`._

## What the original plan assumed vs. what's true

| Plan assumed | Reality in this repo |
|---|---|
| One "shared image partial" edited once → propagates to 135 pages | There are **three** distinct rendering paths (below). No single partial. |
| Add `width`/`height` to fix CLS | Images **already have** `width`/`height`; measured CLS is font + JS-mount driven, **not** images (see Phase 0 §4). |
| Add a zoom lightbox in Phase 3 | A zoom viewer (`data-zoom-trigger`, pinch/scroll, up to 4×) **already exists** on detail pages — it's just fed a 567 px source. |
| Rewrite `/uploads/…` → `/cdn-cgi/image/…` | Safe **only after Phase 1** (Cloudflare Transformations enabled). Doing it now would 404 every image in production. |

## The three image-rendering paths (this is the "template" surface)

1. **Homepage** — `src/pages/index.astro` (shared, 1 file). Hero `<picture>` slideshow +
   news/blog cover cards. Already WebP + `width`/`height` + `loading`/`decoding`.
2. **Blog & news** — `src/components/Cover.astro` (shared, 1 file) used by
   `src/pages/blog/[...slug].astro` and the noticias pages. This **is** the closest thing to
   a shared partial for article imagery. Already WebP + responsive `-640`/full srcset.
3. **Catalogue** — two sub-paths:
   - **Listing pages** (`catalogo-*.dc.html`, ~11) render cards via the **`BanknoteCard.dc.html`**
     dc-runtime component (edit once → all cards). Already WebP + lazy; card box uses
     `aspect-ratio:4/3` so no CLS.
   - **Detail pages** (`billete-*`/`moneda-*.dc.html`, ~101) have **inline `<picture>` markup
     per file** for the main note image *and* the zoom-dialog image. No shared partial —
     these need a **scripted edit** across ~101 files (they're generated `.dc.html`, committed
     to `public/`). Already have `width`/`height` + eager main image.

## Sequencing — the hard dependency

**Phase 2's headline win (image weight ↓ ≥40%) requires Phase 1 (Cloudflare Transformations)
to be live first.** The site already ships WebP at fixed sizes, so the remaining wins are
(a) AVIF via `format=auto` and (b) serving *phone-sized* widths instead of full-size — both
delivered through `/cdn-cgi/image/…` URLs that only resolve once Phase 1 is enabled.
Confirmed: **zero `/cdn-cgi/image` references exist today**, so Phase 1 is genuinely not started.

→ **Do not merge any `/cdn-cgi/` URL rewrite until you confirm Phase 1 is enabled on the
notofilia.com zone.** Until then, Phase 2 splits into two tranches:

### Tranche A — ship now (no Cloudflare dependency)
- [x] **Fill the 3 empty hero `alt`s** on the homepage (image SEO + a11y). Alt text already
      exists in the `heroes` array; it was only being applied to the first slide. _(done in
      the accompanying commit — see below.)_
- [x] **Audit `sizes` attributes** — _done; no code change, and here's why._ Measured what a
      mobile browser actually fetches for each shared template:
      - Homepage hero `sizes="100vw"` is honest (full-bleed); it already selects a small
        (~480w) variant. Homepage cards use a single `-640.webp` candidate — correctly small.
      - Article covers (`Cover.astro`) **always fetch the full `.webp`** regardless of `sizes`,
        because the source scans are small (e.g. a `contain` cover's `.webp` is only **530 px**
        wide though the srcset labels it `1200w`) — so the full file *is* the right size for a
        high-DPR phone and there is **no over-fetch to reclaim**. The `-640.webp` srcset
        candidate is effectively never selected; it's missing for 1 of 12 covers
        (`colombia-banco-de-la-republica-2000-pesos-oro-1985-specimen`) but that never 404s
        because the browser doesn't pick it.
      - **Conclusion:** genuine per-screen sizing needs *accurate* variants, which is exactly
        what Tranche B's `/cdn-cgi/image/width=…` produces. Hand-tuning `sizes`/`srcset` now
        would be overwritten by Tranche B — deferred there, plus regenerate the one missing
        variant structurally.
- [x] **Defer non-visible hero slides.** Slides 2–4 (opacity:0 at load) now park their URLs
      in `data-src`/`data-srcset` and hydrate after `load` during idle; the rotation was also
      fixed to always paint slide 0 first (so no unloaded slide is revealed early, and
      `fetchpriority="high"` is now meaningful). **Measured: homepage above-the-fold image
      weight 859 KB → 333 KB (−61%)**; total bytes unchanged (deferred slides still load, just
      off the critical path); functional check passed (slide 0 loads immediately, 2–4 hydrate,
      no errors). Biggest pre-Cloudflare win. _(done — see commit.)_

### Tranche B — after Phase 1 is live (in progress)
- [x] **URL helper** `src/lib/img.ts` — `cdnImg(path, {width, quality})` + `cdnSrcset()`.
      Emits `/cdn-cgi/image/width=W,format=auto,quality=Q/uploads/…` in production and passes
      the plain `/uploads/…` path through in dev/preview (so local rendering isn't broken by
      edge-only URLs). Gated on `import.meta.env.PROD`.
- [x] **Applied to the shared Astro components** (`HomeHero.astro` hero slides +
      `HomePostStrip.astro` news/blog cards on the homepage; `Cover.astro` blog/news covers —
      after main's component-extraction refactor). `<picture>`/`<source webp>` collapsed to a single
      `<img srcset>` since `format=auto` negotiates AVIF/WebP. Widths 400/640/1024(/2000);
      q82 catalogue-ish, q78 decorative. Verified: prod build emits correct cdn-cgi URLs;
      dev passthrough renders; hero deferral + hydration intact; typecheck clean.
- [x] **~101 detail `.dc.html` + listing cards** — done via a **build-time rewrite**
      (`src/integrations/cdn-images.mjs`, `astro:build:done`) instead of editing 101 source
      files. Source keeps plain `/uploads/` (local dev unaffected); only `dist/` gets cdn-cgi.
      Scoped to `src`/`srcset`/`image`/`imageWebp` attribute values; never touches
      `content=`/JSON-LD (og/twitter/structured-data keep stable full URLs); skips
      already-cdn-cgi values (idempotent, no double-wrap). Build reports **+745 transformed
      URLs across 116 files**. Verified: detail note + zoom images cdn-cgi; dc-runtime mounts
      all 27 listing cards with cdn-cgi URLs and no page errors; unit tests cover the meta/
      JSON-LD/idempotency edge cases.
- [~] **Zoom-dialog resolution** — the zoom `<img>` is now cdn-cgi at `width=1024` (caps at
      the current 567 px masters, so no visual change yet). **Follow-up for Phase 3:** once
      ≥2000 px masters exist, bump the zoom variant to `width=2000,quality=85` (the viewer is
      already built and waiting).
- [ ] Standardize `og:image`/`twitter:image` — intentionally left as stable full-size
      `/uploads/*.jpg` (social scrapers prefer a fixed large JPG); revisit only if we want a
      `width=1200` transform.

**⚠️ QA note:** `/cdn-cgi/image/` only resolves through the Cloudflare **zone (custom
domain)** — it does **not** work on a bare `*.pages.dev` preview URL, nor in local
`astro preview`. Verify the transformed output on a custom-domain deploy (or production),
using the `curl` checks in `image-upgrade-phase1-runbook.md`.

## Out of scope for Phase 2 (but surfaced by the baseline)
- **CLS fix** = font-loading strategy (`font-display: optional` or preload + `size-adjust`)
  + reserving header-mount height. Not images. Track separately; it's the actual CWV risk.
- **Rescans to ≥2000 px** = Phase 3. The zoom UI is ready and waiting for masters.

## Exit criteria (unchanged from plan, made measurable here)
- Re-run `scripts/measure-image-baseline.mjs` after Tranche B: homepage image weight down
  ≥40% (target ≤ ~510 KB @load from 859 KB), no new layout shift, visual QA on ES/EN for one
  page of each of the three rendering paths.
