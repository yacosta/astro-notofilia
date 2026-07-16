# Notofilia — Paid AI-Assisted, Human-Reviewed Identification Service

Build spec for the paid numismatic/notaphily identification service. Companion
to `Notofilia_Identification_Report.dc.html` (the deliverable template).

> **Status:** planning / blueprint. No service code written yet.

## 1. Decisions locked

| Layer | Choice |
|---|---|
| Framework | Astro + `@astrojs/cloudflare` adapter, `output: 'hybrid'` |
| Styling | Tailwind v4 (shared `@theme` tokens) |
| Identity / auth | **Clerk** (free tier to start) |
| Payments | **Stripe** (Checkout + webhooks) |
| Structured data | **Cloudflare D1** (SQLite) |
| Blob storage | **Cloudflare R2** (photos, generated PDFs, QR PNGs) |
| AI first-pass | Claude vision (`claude-opus-4-8`, Files API, structured output) |
| Items at launch | Coins **and** banknotes |
| SLA | "within 3 business days" (aim to beat it) |
| Reviewer | Site owner, AI-assisted |

### Key scoping assumption (flip if wrong)
- **One-off ID reports → guest checkout, no login required.** Lowest friction
  to purchase; report is delivered by email + a record URL.
- **Clerk login/membership → only for member-area extras** (saved reports,
  member catalog/data, included or discounted IDs). This keeps Clerk on the
  free tier longer and keeps the purchase funnel frictionless.

## 2. Architecture: static site + dynamic islands

The marketing/catalog site stays **prerendered static** exactly as today. With
`output: 'hybrid'`, only the routes below opt into server rendering
(`export const prerender = false`) or live as Pages Functions. Auth needs a
server runtime — that is the only reason the adapter is added.

```
Static (prerendered)          Dynamic (SSR / Pages Functions)
─────────────────────         ────────────────────────────────
/  (homepage)                 /identificar         intake + Stripe checkout
/coleccion/* (dc pages)       /api/checkout        create Stripe session
/noticias/*                   /api/stripe-webhook  payment + subscription sync
/politica-...                 /informes/[ref]      render report from D1
                              /admin/*   (Clerk)   review queue (owner only)
                              /cuenta/*  (Clerk)   member area
                              /api/membership/*    entitlement checks
```

## 3. The three-layer identity model

- **Clerk = identity.** Who the user is; sessions; login UI; social login; MFA.
- **Stripe = payment.** One-off charges (reports) and subscriptions (membership).
- **D1 = entitlement.** What a user can access *now*, keyed by Clerk user id,
  written by the Stripe webhook. We deliberately do **not** use Clerk's paid
  roles/RBAC — the D1 `membership` row is the source of truth.

**Rule:** never gate on the client. Every protected Function re-verifies the
Clerk session and re-checks the D1 entitlement server-side, every request.

## 4. Data model (Cloudflare D1)

### `orders` — one per paid identification
```
ref            TEXT PK      -- "NF-2026-0143", generated at intake
status         TEXT         -- awaiting_payment | paid | in_review
                            --  | approved | delivered | rejected
item_type      TEXT         -- coin | banknote
tier           TEXT         -- id | id_value   (id_value -> showValuation=true)

customer_name  TEXT
customer_email TEXT         -- delivery address (guest or member)
clerk_user_id  TEXT NULL    -- set only if a logged-in member ordered
notes          TEXT

obverse_key    TEXT         -- R2 key
reverse_key    TEXT         -- R2 key
weight_g       REAL
dimensions     TEXT

stripe_session TEXT
paid_at        TEXT
sla_due_at     TEXT         -- paid_at + 3 business days (computed, stored)

-- report fields (filled at review; mirror the template exactly)
country        TEXT
denomination   TEXT
year           TEXT
mint           TEXT         -- ceca (coins)
assayer        TEXT         -- ensayador (coins)
catalog_ref    TEXT         -- KM# (coins) / Pick# (banknotes)
composition    TEXT
edge           TEXT         -- canto (coins)
grade          TEXT
rarity         TEXT
est_value      TEXT         -- only when tier = id_value
background_es  TEXT
background_en  TEXT

qr_key         TEXT         -- self-generated QR PNG/SVG in R2
pdf_key        TEXT         -- generated at approval
approved_at    TEXT
delivered_at   TEXT
created_at     TEXT
```

### `membership` — one per Clerk user with a subscription
```
clerk_user_id   TEXT PK
stripe_customer TEXT
tier            TEXT         -- e.g. basic | pro
status          TEXT         -- active | past_due | canceled
current_period_end TEXT
updated_at      TEXT
```

Coins and banknotes share `orders`; `item_type` drives which fields are
relevant (mint/assayer/edge are coin-only; banknotes use `catalog_ref` = Pick#,
`composition` = paper/polymer, series/signatures in notes).

## 5. Storage (Cloudflare R2)
- `uploads/<ref>/obverse.jpg`, `uploads/<ref>/reverse.jpg` — customer photos.
- `reports/<ref>.pdf` — frozen deliverable, generated at approval.
- `qr/<ref>.png` — self-generated QR (see §9).

D1 stores the keys; R2 stores the bytes. Photos are private; the report PDF is
served through the record route after an access check.

## 6. Flow A — one-off ID report (guest, no login)

1. **Intake** `/identificar` (bilingual, all standing SEO/a11y/mobile rules):
   contact, item type, obverse+reverse photos (client-compressed), optional
   measurements, notes, tier. → create D1 order `awaiting_payment`, upload
   photos to R2, redirect to Stripe Checkout.
2. **Pay** — Stripe Checkout (hosted), order `ref` in `metadata`.
3. **Webhook** `/api/stripe-webhook` on `checkout.session.completed` →
   order `paid`, stamp `paid_at`, compute + store `sla_due_at`, email owner.
4. **Review** (owner) at `/admin/informes/<ref>` — see photos + (Phase 1) the
   Claude draft; fill/confirm every field; Approve or Reject.
5. **Publish** on approve → generate QR + render PDF to R2, order `approved`,
   email customer the record link + PDF.
6. **Record** `/informes/<ref>` renders the template from D1 with a
   "Verified by Notofilia · issued <date>" badge and the QR pointing back here.

## 7. Flow B — membership (Clerk + Stripe subscription)

1. User signs up / logs in via **Clerk** (`/cuenta`).
2. Subscribe via Stripe Checkout in **subscription** mode; link the Stripe
   customer to the Clerk user id.
3. **Webhook** on `customer.subscription.created|updated|deleted` → upsert the
   `membership` row in D1 (tier, status, period end).
4. Gated member routes/Functions verify the Clerk session, look up the D1
   `membership`, and allow or return 402.
5. **Stripe Customer Portal** gives members self-serve cancel/upgrade/card
   updates — no admin work.

## 8. Clerk integration notes
- Package: `@clerk/astro`; add the integration in `astro.config.mjs` and
  `clerkMiddleware()` in `src/middleware.ts`.
- Components: `<SignedIn>`, `<SignedOut>`, `<SignIn/>`, `<UserButton/>` from
  `@clerk/astro/components`; server helpers for Functions.
- Env: `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Protect `/admin/*` to the owner's Clerk user id; `/cuenta/*` to any signed-in
  user; entitlement (paid vs not) always comes from D1, never Clerk metadata.
- Free-tier trade-offs accepted at launch: "Secured by Clerk" mark on
  components; custom auth domain (`accounts.notofilia.com`) is a paid upgrade.

## 9. Stripe + QR + PDF notes
- Stripe Node SDK runs on Workers with the fetch HTTP client; verify webhooks
  with the async signature check. Keys in Cloudflare secrets.
- Two Checkout modes: `payment` (reports) and `subscription` (membership).
- **QR generated server-side** at approval (small QR lib), stored in R2 —
  no third-party QR API dependency, works offline in the PDF, points at
  `https://notofilia.com/informes/<ref>` (the live record).
- **PDF**: the template is already 816×1056 (US-letter @96dpi) — render the
  record route to PDF (headless Chromium / print pipeline) at approval.

## 10. Cloudflare config
- Adapter: `@astrojs/cloudflare`, `output: 'hybrid'`.
- Bindings (wrangler): D1 `DB`, R2 bucket, secrets below.
- Access in SSR/Functions via `Astro.locals.runtime.env` /
  the Pages Function `env`.

### Secrets / env inventory
```
CLERK_SECRET_KEY                Clerk backend
PUBLIC_CLERK_PUBLISHABLE_KEY    Clerk frontend
STRIPE_SECRET_KEY               Stripe API
STRIPE_WEBHOOK_SECRET           Stripe signature verification
ANTHROPIC_API_KEY               Claude vision (Phase 1)
OWNER_CLERK_USER_ID             gate /admin/*
```

## 11. AI first-pass (Phase 1, added after manual MVP works)
- On `paid`, send obverse+reverse (Files API) to `claude-opus-4-8` with a
  **structured-output schema whose fields are exactly the report fields** in
  §4, plus a confidence score and ES/EN background paragraphs.
- Output pre-fills the review form. **Nothing reaches the customer without the
  human approve step** — that is the liability model and the disclaimer already
  present in the template.
- The AI call runs server-side (Pages Function / queue), key in Cloudflare
  secrets, never client-side.

## 12. Build order

- **Phase 0 — manual MVP:** adapter + hybrid; D1 `orders`; R2; `/identificar`;
  Stripe one-off Checkout + webhook; `/admin/informes/<ref>` review form;
  `/informes/<ref>` record route; QR + PDF generation; email. Owner runs the
  AI by hand. Ship, take real orders, validate pricing.
- **Phase 1 — automate + members:** Claude first-pass pre-fills the review
  form; Clerk auth; `membership` table + Stripe subscription + Customer Portal;
  `/cuenta/*` member area and gated functions.
- **Phase 2 — polish:** automated PDF pipeline, customer status page, rush
  tier, multi-item orders, analytics.

## 13. Still open
- **Prices** for Tier 1 (id) and Tier 2 (id_value); **currency** (USD vs local).
- Cloudflare project: confirm enabling Functions + D1 + R2 bindings and adding
  the secrets above.
- Member-area feature set (what "extras" membership unlocks) — shapes `/cuenta`.
- Login-required-to-buy vs guest checkout (assumed **guest**; see §1).
