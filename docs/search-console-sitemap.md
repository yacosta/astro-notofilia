# Search Console sitemap — General HTTP error

## Diagnosis (2026-08-21)

| Probe | Result |
|---|---|
| `https://astro-notofilia.pages.dev/sitemap.xml` | **HTTP 200**, `application/xml`, valid `<urlset>` (~302 KB) |
| `https://notofilia.com/sitemap.xml` | **HTTP 403**, `cf-mitigated: challenge`, Cloudflare “Just a moment…” HTML |
| `https://notofilia.com/robots.txt` | **HTTP 200** (CF often exempts robots.txt); still lists the three Sitemap URLs |

The sitemap **file is fine** and is deployed. Google Search Console’s “General HTTP error” means the **custom-domain edge** returned a non-success HTTP response (here: a Bot Fight / under-attack style challenge) instead of XML.

This matches the earlier indexing note in PR/issue work: Cloudflare challenges some crawler hits (`cf-mitigated: challenge`) while humans can still load the site after a browser challenge.

WAF custom “Skip” rules **cannot** bypass free **Bot Fight Mode**. An **IP Access Rule → Allow** for the crawler ASN is evaluated first and prevents BFM from challenging that traffic.

## Fix (dashboard, ~2 minutes)

1. Open [Cloudflare → notofilia.com → Security → Settings](https://dash.cloudflare.com/?to=/:account/notofilia.com/security/settings).
2. Filter **Bot traffic**. If **Bot fight mode** is on and Googlebot is being challenged, either:
   - Turn **Bot fight mode** off, or
   - Keep it on and add IP Access Allows below (preferred if you want BFM for scrapers).
3. Confirm Security Level is **not** “I’m Under Attack” (use Medium / High).
4. Open [Security → Security rules → IP access rules](https://dash.cloudflare.com/?to=/:account/notofilia.com/security/security-rules) → **Create rule**:
   - Value: `AS15169` (Google) → Action: **Allow** → note: `Allow Googlebot / Search Console`
   - Optional: `AS396982` (Google Cloud), `AS8075` (Bing)
5. In [Security → Analytics → Events](https://dash.cloudflare.com/?to=/:account/notofilia.com/security/analytics), confirm Googlebot/`/sitemap.xml` is no longer challenged.
6. In Search Console → Sitemaps, resubmit `https://notofilia.com/sitemap.xml` (and preferably `https://notofilia.com/sitemap_index.xml`).

## Fix (API / GitHub Action)

Token permissions: **Zone → Firewall Services → Edit**, **Zone → Zone Settings → Edit** (for under-attack), **Zone → Zone → Read**, include `notofilia.com`.

```bash
export CLOUDFLARE_API_TOKEN=…
npm run allow:crawlers
npm run check:sitemap:live
```

Or run workflow **Allow search crawlers** (Actions → workflow_dispatch).

Dry-run:

```bash
ALLOW_CRAWLERS_DRY_RUN=1 npm run allow:crawlers
```

## Verify

```bash
npm run check:sitemap:live
# Probes with a site User-Agent (file must be XML 200) and with curl/8.x
# (must not return cf-mitigated: challenge). The curl probe fails while Bot
# Fight Mode is on and your IP is not allowlisted — expected from laptops /
# CI. After allowlisting Google ASN, re-test from Search Console, not from curl.
```

From a shell:

```bash
# Often challenged while BFM is on (does not prove Googlebot is blocked):
curl -sI https://notofilia.com/sitemap.xml | head -20

# File existence (may succeed even when curl is challenged):
node scripts/check-sitemap-live.mjs
```

After the ASN Allow rules exist, open Search Console → Sitemaps → refresh
`https://notofilia.com/sitemap.xml`. The “General HTTP error” should clear on
the next successful fetch (can take hours).

## What not to change in the repo for this error

- Do **not** remove `/sitemap.xml` or invent a second host for Google.
- Do **not** flip canonicals back to `www` (apex is intentional).
- Regenerating the sitemap alone will **not** clear a Cloudflare challenge.
