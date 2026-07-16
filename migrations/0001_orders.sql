-- Notofilia — paid identification service (Phase 0)
-- D1 schema: one row per identification order. Mirrors the report template's
-- fields so an approved order renders straight into the deliverable.
--
-- Apply with:  npx wrangler d1 migrations apply <DB_NAME>
-- (once the D1 database + binding are created in the Cloudflare dashboard).

CREATE TABLE IF NOT EXISTS orders (
  ref             TEXT PRIMARY KEY,          -- "NF-2026-0143", generated at intake
  status          TEXT NOT NULL DEFAULT 'awaiting_payment',
                                             -- awaiting_payment | paid | in_review
                                             --  | approved | delivered | rejected
  item_type       TEXT NOT NULL,             -- coin | banknote
  tier            TEXT NOT NULL,             -- id | id_value  (id_value -> showValuation)

  -- customer
  customer_name   TEXT,
  customer_email  TEXT NOT NULL,             -- delivery address (guest or member)
  clerk_user_id   TEXT,                      -- set only if a logged-in member ordered
  notes           TEXT,

  -- intake media (R2 object keys)
  obverse_key     TEXT,
  reverse_key     TEXT,
  weight_g        REAL,
  dimensions      TEXT,

  -- payment
  stripe_session  TEXT,
  paid_at         TEXT,
  sla_due_at      TEXT,                       -- paid_at + 3 business days (computed, stored)

  -- report fields (filled at review; mirror the template exactly)
  country         TEXT,
  denomination    TEXT,
  year            TEXT,
  mint            TEXT,                       -- ceca (coins)
  assayer         TEXT,                       -- ensayador (coins)
  catalog_ref     TEXT,                       -- KM# (coins) / Pick# (banknotes)
  composition     TEXT,
  edge            TEXT,                       -- canto (coins)
  grade           TEXT,
  rarity          TEXT,
  est_value       TEXT,                       -- only when tier = id_value
  background_es   TEXT,
  background_en   TEXT,

  -- deliverable
  qr_key          TEXT,                       -- self-generated QR in R2
  pdf_key         TEXT,                       -- generated at approval
  approved_at     TEXT,
  delivered_at    TEXT,

  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_email   ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
