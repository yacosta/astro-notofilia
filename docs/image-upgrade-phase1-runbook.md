# Image Upgrade — Phase 1 runbook (enable Cloudflare Image Transformations)

**Status: blocked on a dashboard action only the account owner can do.** Enabling
Transformations is a **zone setting**, not a repo/`wrangler.jsonc` change — there is nothing
to merge for this phase. This doc gives the exact steps, the agreed parameter sets (the
Phase 1 deliverable), and how to verify. Ping me when it's on (or paste the test-URL
response headers) and I'll validate and start Phase 2 Tranche B.

## Deployment context (confirmed from the repo)
- Hosted on **Cloudflare Pages** (`wrangler.jsonc: pages_build_output_dir: dist`, `functions/`).
- Served on the **custom domain** `notofilia.com` via its Cloudflare zone → `/cdn-cgi/image/`
  is available once the zone toggle is on. (It would *not* work on a bare `*.pages.dev`
  subdomain — a custom domain on the zone is required, which this site has.)
- **Zero `/cdn-cgi/image` references exist in the codebase today** — nothing to roll back.

## Steps (account owner)
1. Cloudflare dashboard → select the **notofilia.com** zone → **Images** → **Transformations**.
2. **Enable Transformations for this zone.**
3. Leave **"Preserve Content-Type"** and hotlink protection at defaults; keep transformations
   **restricted to same-zone origins** (don't allow arbitrary remote origins).
4. That's it — no deploy needed. Existing `/uploads/*` files are untouched; transformation
   URLs are computed on the fly at the edge.

*(Alternative: it can also be toggled via the Cloudflare API zone-settings endpoint if you'd
rather not use the dashboard — but the dashboard toggle is simplest, and this environment
can't reach the Cloudflare API through its proxy anyway.)*

## Standard parameter sets (Phase 1 deliverable — use these everywhere in Phase 2)
URL shape: `/cdn-cgi/image/<params>/uploads/<file>`

| Use | Params | Notes |
|-----|--------|-------|
| Catalogue note scans | `format=auto,quality=82` | detail preserves engraving detail |
| Decorative / hero / covers | `format=auto,quality=78` | slightly lower q; large area, less detail-critical |
| Zoom-dialog source | `width=2000,quality=85,format=auto` | activates the existing zoom viewer at real res |
| Social (`og:image`/`twitter:image`) | `width=1200,quality=82,format=auto` OR a stable full-size JPG | pick one, apply consistently |

**Responsive widths (the `srcset` ladder):** `400 / 640 / 1024 / 2000`.
`format=auto` negotiates **AVIF → WebP → original** by the browser's `Accept` header.

Example (catalogue thumb at 640, auto format):
`/cdn-cgi/image/width=640,format=auto,quality=82/uploads/usda-food-coupon-1-dollar-1980-serie-b.jpg`

## Verification (after enabling)
Run these against production (or paste me the output and I'll read it):

```sh
# 1) Modern browser Accept -> should return image/avif or image/webp
curl -sI -H 'Accept: image/avif,image/webp,*/*' \
  'https://notofilia.com/cdn-cgi/image/width=640,format=auto,quality=82/uploads/usda-food-coupon-1-dollar-1980-serie-b.jpg' \
  | grep -iE 'content-type|cache-control|cf-cache-status'

# 2) Legacy Accept -> should fall back to image/jpeg
curl -sI -H 'Accept: image/*' \
  'https://notofilia.com/cdn-cgi/image/width=640,quality=82/uploads/usda-food-coupon-1-dollar-1980-serie-b.jpg' \
  | grep -i 'content-type'

# 3) Second hit -> cf-cache-status: HIT (served from edge cache)
```

**Pass criteria (Phase 1 exit):**
- Modern request returns `content-type: image/avif` (or `image/webp`).
- Legacy request returns `content-type: image/jpeg`.
- Response carries a `cache-control` header and the 2nd request shows `cf-cache-status: HIT`.
- A bogus width still returns the original image, not an error (graceful degrade).

## Watch-outs
- **Quota:** each unique `width × image` counts once/month. Est. ~1,860 unique transforms at
  full rollout (Phase 0 §4) — fine on paid; check the free-tier cap (~5,000). Over-cap =
  Cloudflare serves the **original** (degraded, not broken).
- Don't delete or redirect anything under `/uploads/` — indexed image URLs must keep
  resolving (Phase 4/5 guard).
