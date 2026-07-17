# Image Upgrade — Phase 0: Baseline & Inventory

_Generated 2026-07-17. Companion data: `image-inventory.csv` (every file) and
`image-masters-inventory.csv` (per catalogue item, best available width)._

Phase 0 has two halves: the **image inventory** (fully derivable from the repo — done
below) and the **baseline measurements** (Lighthouse, Search Console, Cloudflare
quota — these need your browser/account access; checklist at the end).

---

## 1. Inventory summary

Source: `public/uploads/` (the plan's `/uploads/` — served from web root by Astro).

| Format | Files | Total | Avg |
|--------|------:|------:|----:|
| jpg    | 465   | 80.26 MB | 177 KB |
| webp   | 316   | 31.90 MB | 103 KB |
| png    | 9     | 4.32 MB  | 492 KB |
| jpeg   | 10    | 0.57 MB  | 58 KB  |
| gif    | 1     | 0.26 MB  | 271 KB |
| **Total raster** | **801** | **117.32 MB** | — |

Non-image assets also in `uploads/`: 13 PDF, 3 TTF (+ `fonts/`), 1 docx, 2 md, 2 txt — out of scope.

### Width distribution (readable raster files)
| Bucket | Files |
|--------|------:|
| < 640px      | 635 |
| 640–1023px   | 138 |
| 1024–1199px  | 2   |
| 1200–1999px  | 24  |
| **≥ 2000px** | **0** |

Min 3px · median **564px** · max **1873px**.

---

## 2. Key findings

**🔴 Finding 1 — Nothing in the library is zoom-ready.**
Stated at the file level (no grouping needed): of all **801 image files, 0 are ≥2000px**,
and the single widest file in the entire library is **1873px** (`Gori Test Banknote.jpg`).

The catalogue itself is **101 pages** (94 `billete-*` banknote pages + 7 `moneda-*` coin
pages), holding ~105 banknotes + 7 coins ≈ **112 catalogue objects**. **Not one of those
objects has any image variant at ≥2000px today**, so every object needs a rescan to hit
the plan's zoom goal (Phase 3). This is the largest workstream in the project — worth
confirming scope/appetite before committing.

_On the companion CSV:_ `image-masters-inventory.csv` groups the 801 files into **465
distinct base filenames** (ignoring `-480/-640/-768` responsive suffixes and collapsing
webp+jpg pairs). That **465 is not the catalogue-item count** — it's roughly "distinct
scan families," inflated because most objects contribute several files: obverse/reverse,
multi-specimen variants (`-no2304`, `_v2`), and **both** a legacy-named original
(`ElBancoDePamplona_10Pesos_2firmas.jpg`) **and** a kebab-case slug
(`colombia-banco-de-pamplona-10-pesos-1884.jpg`) for the same note. Of those 465 base
names, 448 top out below 1200px and 0 reach 2000px — same conclusion, finer grain.

**🟠 Finding 2 — ~207 legacy-named originals sit unreferenced.**
207 files use legacy `CamelCase`/`with spaces`/`BDR_underscore` names (e.g.
`BDR_1000pesos_4_1_1992_v1.jpg`, `100 Dollars National Currency Minneapolis.jpg`)
and are not matched by any static `/uploads/...` reference in the templates. They
appear to be the original source scans the kebab-case slugs were derived from.
Before rescanning from scratch, check these — some may already be higher quality than
the shipped slug variant, or may _be_ the masters. (They're still all <2000px, so this
reduces rescan effort but doesn't eliminate it.)

**🟠 Finding 3 — Two files have malformed JPEG structure.**
`/uploads/_p5.jpg` and `/uploads/_p6.jpg` start with a JPEG SOI marker but have no
parseable SOF segment (dimensions unreadable). Open them manually — likely truncated
or mis-saved crops. Re-export or remove.

**🟢 Finding 4 — Responsive variants already exist (partial).**
The site already ships a hand-rolled responsive scheme, so Phase 2 is an evolution, not
a greenfield build:
- `-480` (3 jpg / 5 webp), `-640` (16 jpg / 68 webp), `-768` (3 jpg / 4 webp)
- 255 items already have a jpg **and** webp sibling; 61 are webp-only, 220 jpg-only.

**🟢 Finding 5 — Cloudflare Transformations not yet in use.**
Zero `/cdn-cgi/image/...` references anywhere in `src/` or `public/` — confirms Phase 1
is genuinely un-started and there's no partial migration to reconcile.

**🟢 Finding 6 — No image sitemap entries.**
`public/sitemap.xml` contains no `<image:image>` entries — so Phase 4's "regenerate the
image sitemap" is really a first-time add, not a regeneration.

---

## 3. How images are referenced today (context for Phase 2)

- Detail/catalogue pages are **pre-rendered `.dc.html` files in `public/`** (~135 pages),
  not `.astro` templates. `src/pages/` only holds `index.astro`, `404.astro`, and the
  blog/noticias collections. **Implication:** the Phase 2 "shared image partial" the plan
  assumes may not exist as a single source of truth — the `.dc.html` files likely need a
  scripted find-and-replace, or regeneration from whatever produced them. Worth resolving
  before Phase 2 effort is estimated.
- `index.astro` uses `<picture>` with `<source type="image/webp">` + jpg `<img>` fallback,
  explicit `width`/`height`, `loading="lazy"`, `decoding="async"`, and hero
  `fetchpriority="high"` — the Phase 2 target pattern is already modeled here.

---

## 4. Measured baseline (lab)

Captured locally from a production build (`astro build` → `dist/`) rendered in headless
Chromium under **Pixel-5 mobile emulation + Slow-4G throttle (1.6 Mbps, 150 ms RTT) + 4×
CPU throttle**. Reproducible via `scripts/measure-image-baseline.mjs` — re-run it after
each phase for a like-for-like before/after. Date: 2026-07-17, current `main` build.

| Page | Images @load / total | Image transfer @load / total | LCP (lab) | CLS (intermittent) |
|------|:--------------------:|:----------------------------:|----------:|:------------------:|
| Homepage (`/`) | 9 / 13 (all webp) | **859 KB / 1,081 KB** | ~1.1–1.4 s | 0 – 0.17 |
| Catalogue (`/billete-usda-food-coupon-1-dolar-1980.dc.html`) | 2 / 2 | 88 KB | ~2.1–2.4 s | 0 (0.017 after scroll) |
| Blog post (`/blog/diferencia-numismatica-notafilia/`) | 2 / 2 | 113 KB | ~1.2 s | 0 – 0.093 |

**Reading the numbers (corrected after diagnostics — supersedes an earlier draft that
blamed CLS on image dimensions):**
- **The reliable finding is image transfer weight, not CLS.** Homepage ships **859 KB of
  images above the fold** (four full hero slides + covers), ~1.08 MB after scroll — this is
  the real Phase 2 target. Catalogue/blog pages are already light (they lazy-load a single
  note/cover + logo).
- **The site already ships WebP everywhere and already sets `width`/`height` on its
  images**, so the ≥40% weight cut must come from **responsive sizing** (serving 400/640-wide
  variants to phones instead of full-size) + **AVIF** via Cloudflare `format=auto` — i.e.
  it is **gated on Phase 1 being enabled first** (see the Phase 2 plan doc).
- **CLS is real but intermittent (0 → 0.17) and is NOT an image-dimension problem.**
  Isolation tests (`scripts/` one-offs) showed: blocking web fonts drops homepage CLS to
  **0** (it's `font-display:swap` reflowing the large display text); the blog's residual
  shift is unaffected by fonts *or* by blocking the cover image, and tracks the
  `dc-runtime` header mounting above `<main>`. Because the images already carry
  `width`/`height`, Phase 2's "add explicit dimensions" step will **not** move these numbers.
  Fixing CLS is a separate font-loading + header-mount workstream (font-display / preload /
  reserve header height), tracked outside the image project.

**Caveats (important for honest before/after):**
- **LCP here is a localhost lab estimate**, not production LCP — no real CDN/network
  distance, so treat it as *relative* only. A true production LCP still wants a
  Lighthouse/PSI run against the live site (proxy-blocked from this environment).
- **CLS is genuinely flaky in this harness** (0 to 0.17 for the same page across runs) — the
  shifts fire right around first paint and whether the observer catches them is timing-
  dependent. Reported as a range, not a point value. Image transfer bytes are the stable,
  trustworthy metric.
- Only the food-coupon catalogue page was sampled; its note image is the 567 px thumbnail,
  so its LCP reflects a tiny image — a heavier catalogue page may differ.

### Still needs your account access
- [ ] **Search Console → Performance → Search type: Image.** Note which image URLs draw
      impressions today — those must keep resolving (Phase 4/5 guard). Not derivable from repo.
- [ ] **Cloudflare plan + Transformations quota.** Confirm the plan and monthly
      unique-transformations cap. Rough demand estimate: ~465 distinct source images ×
      ~4 widths (400/640/1024/2000) ≈ **1,860 unique transformations/month** at full
      rollout — check against your cap (free tier historically ~5,000 unique/month).
      (Counts distinct scan files, not the ~112 catalogue objects.)
- [ ] *(optional)* A production **Lighthouse/PSI** run for a real-network LCP figure to sit
      alongside the lab number above.

---

## 5. Phase 0 exit criteria status

| Criterion | Status |
|-----------|--------|
| List of all images w/ dimensions & sizes | ✅ `image-inventory.csv` (801 rows) |
| Rescan flags | ✅ `image-masters-inventory.csv` — 448 of 465 scan families flagged `RESCAN(<1200)`; 0 reach 2000px |
| Baseline saved (image weight + CLS + lab LCP) | ✅ §4, measured; `scripts/measure-image-baseline.mjs` |
| Production LCP (real network) | ⬜ optional — needs a live-site Lighthouse/PSI run (§4) |
| GSC image URLs noted | ⬜ needs your access (§4) |
| Cloudflare quota confirmed | ⬜ needs your access (§4) |

**Recommended decision before Phase 1:** Finding 1 means Phase 3 (rescanning all ~112
catalogue objects) dominates the effort. Decide whether to (a) do the format/responsive migration now (Phases
1–2, real CWV wins, no rescanning) and treat rescanning as a slow country-by-country
backlog, or (b) hold zoom expectations until scans exist. The format migration delivers
most of the Core Web Vitals benefit independently of the rescan work.
