# Social posting — X & Instagram

When a new noticia lands on `main` under `src/content/noticias/`, GitHub Actions
runs **Social post noticias** and shares it to:

- **X** ([@notofilia](https://x.com/notofilia)) — title + article URL (Twitter Card shows the OG image)
- **Instagram** ([@notofilia2026](https://www.instagram.com/notofilia2026/)) — cover JPEG + caption (requires a `cover`)

Script: [`scripts/social-post-noticias.mjs`](../scripts/social-post-noticias.mjs)  
Workflow: [`.github/workflows/social-post-noticias.yml`](../.github/workflows/social-post-noticias.yml)

## What triggers a post

| Event | Shared? |
|---|---|
| New `src/content/noticias/<slug>.md` merged to `main` (not `draft: true`) | Yes |
| Existing file flips from `draft: true` → published | Yes |
| Edits to an already-published noticia | No (avoids duplicate posts) |
| Frontmatter `social: false` | Skipped |
| Manual **Actions → Social post noticias → Run workflow** with `slug` | Yes (retries / backfill) |

The job waits for `https://www.notofilia.com/noticias/<slug>/` (and the cover JPEG when present) so Instagram’s crawler can fetch a live image after Cloudflare Pages finishes deploying.

## Repository secrets

Add these under **Settings → Secrets and variables → Actions** on `yacosta/astro-notofilia`:

### X (Twitter API v2)

| Secret | Notes |
|---|---|
| `X_API_KEY` | Consumer Key |
| `X_API_SECRET` | Consumer Secret |
| `X_ACCESS_TOKEN` | User access token (Read and Write) |
| `X_ACCESS_TOKEN_SECRET` | User access token secret |

1. Create a project/app at [developer.x.com](https://developer.x.com/)
2. App permissions: **Read and write**
3. Generate **Consumer Keys** and **Access Token & Secret** for the `@notofilia` account

Free tier allows posting tweets; media upload is optional (we rely on link cards).

### Instagram (Graph API Content Publishing)

| Secret | Notes |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived Page access token with `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement` |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram Business/Creator user id linked to the Facebook Page |

1. Convert [@notofilia2026](https://www.instagram.com/notofilia2026/) to a **Professional** account (Business or Creator) if it is not already
2. Link it to a Facebook Page you admin
3. Create a Meta app at [developers.facebook.com](https://developers.facebook.com/) with **Instagram Graph API**
4. Generate a long-lived Page token (short-lived tokens expire in ~1 hour)
5. Resolve the IG business account id:

```bash
curl -sS "https://graph.facebook.com/v21.0/me/accounts?access_token=PAGE_TOKEN" \
  | jq '.data[] | {page: .name, page_id: .id}'

# Then, for the Page id:
curl -sS "https://graph.facebook.com/v21.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_TOKEN"
```

Instagram **requires** a public image URL. Noticias without `cover` are posted to X only and skipped on Instagram.

## Frontmatter controls

```yaml
---
title: "…"
publishedAt: 2026-08-12
excerpt: "…"
cover: "my-cover-base"          # → /uploads/my-cover-base.jpg (required for IG)
social: false                   # opt out of auto-share
socialCaption: "Custom copy…"   # optional override (X ≤280 with URL; IG ≤2200)
---
```

## Local dry-run

```bash
# Preview captions for a slug without posting
node scripts/social-post-noticias.mjs --dry-run --skip-wait \
  --slug=banxico-medallas-dinosaurios-casa-moneda

# Diff mode (same as CI)
node scripts/social-post-noticias.mjs --dry-run --skip-wait \
  --base=<before-sha> --head=HEAD
```

With real credentials exported in the environment (never commit them):

```bash
export X_API_KEY=… X_API_SECRET=… X_ACCESS_TOKEN=… X_ACCESS_TOKEN_SECRET=…
export INSTAGRAM_ACCESS_TOKEN=… INSTAGRAM_BUSINESS_ACCOUNT_ID=…
node scripts/social-post-noticias.mjs --slug=my-noticia-slug
```

## Limits & caveats

- **One story, one post** — matches the site’s no-duplicate-noticias rule; content edits do not re-share.
- Instagram publishing rate limits apply (Meta throttles Content Publishing; typically a small number of posts per day on new apps until the app is fully reviewed).
- Long-lived Meta tokens eventually expire (~60 days unless refreshed via a system user). Rotate `INSTAGRAM_ACCESS_TOKEN` before expiry.
- If Cloudflare Pages is slow, the job waits up to ~5 minutes for the live URL; on timeout, re-run via **workflow_dispatch** with the slug and `skip_wait` once the page is live.
- Until secrets are configured, the workflow still runs in **dry-run** and prints the captions it would post.
