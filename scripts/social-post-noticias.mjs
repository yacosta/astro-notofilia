/**
 * Post newly published /noticias/ articles to X and Instagram.
 *
 * Triggered by `.github/workflows/social-post-noticias.yml` on push to main
 * when Markdown under `src/content/noticias/` changes. Also runnable locally.
 *
 * X (Twitter API v2, OAuth 1.0a user context — Bearer Token cannot post):
 *   X_API_KEY            (= Consumer Key)
 *   X_API_SECRET         (= Secret Key / Consumer Secret)
 *   X_ACCESS_TOKEN       (= Access Token — generate under Authentication Tokens)
 *   X_ACCESS_TOKEN_SECRET(= Access Token Secret)
 *
 * Instagram (Graph API Content Publishing — Business/Creator + Facebook Page):
 *   INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 *
 * Optional:
 *   SITE_ORIGIN          default https://www.notofilia.com
 *   SOCIAL_DRY_RUN=1     log actions without calling APIs
 *   SOCIAL_SKIP_WAIT=1   skip waiting for the live article URL
 *   SOCIAL_WAIT_MS       max wait for live deploy (default 300000)
 *
 * Usage:
 *   node scripts/social-post-noticias.mjs --dry-run
 *   node scripts/social-post-noticias.mjs --slug=banxico-medallas-dinosaurios-casa-moneda
 *   node scripts/social-post-noticias.mjs --base=<sha> --head=<sha>
 *
 * See docs/social-posting.md
 */

import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const NOTICIAS_DIR = 'src/content/noticias';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://www.notofilia.com').replace(/\/$/, '');
const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v21.0';
const DEFAULT_WAIT_MS = Number(process.env.SOCIAL_WAIT_MS || 300_000);
const POLL_MS = 10_000;

const args = parseArgs(process.argv.slice(2));
const dryRun = args['dry-run'] || process.env.SOCIAL_DRY_RUN === '1';
const skipWait = args['skip-wait'] || process.env.SOCIAL_SKIP_WAIT === '1';

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

async function main() {
  const posts = await resolvePosts();
  if (posts.length === 0) {
    console.log('No eligible noticias to share.');
    return;
  }

  console.log(`Sharing ${posts.length} noticia(s)${dryRun ? ' (dry-run)' : ''}:`);
  for (const p of posts) console.log(`  - ${p.slug}`);

  const xCreds = readXCreds();
  const igCreds = readIgCreds();

  if (!dryRun) {
    if (!xCreds && !igCreds) {
      throw new Error(
        'No social credentials configured. Set X_* and/or INSTAGRAM_* secrets. See docs/social-posting.md',
      );
    }
  }

  let failures = 0;
  for (const post of posts) {
    try {
      await sharePost(post, { xCreds, igCreds });
    } catch (err) {
      failures += 1;
      console.error(`Failed ${post.slug}: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} of ${posts.length} noticia(s) failed to share.`);
  }
}

async function sharePost(post, { xCreds, igCreds }) {
  const url = `${SITE_ORIGIN}/noticias/${post.slug}/`;
  const imageUrl = post.cover ? `${SITE_ORIGIN}/uploads/${post.cover}.jpg` : null;

  if (!skipWait) {
    await waitForLive(url, imageUrl);
  }

  const xText = buildXText(post, url);
  const igCaption = buildIgCaption(post, url);

  if (xCreds || dryRun) {
    if (dryRun && !xCreds) {
      console.log(`[dry-run] X ← ${JSON.stringify(xText)}`);
    } else if (xCreds) {
      if (dryRun) {
        console.log(`[dry-run] X ← ${JSON.stringify(xText)}`);
      } else {
        const tweet = await postToX(xCreds, xText);
        console.log(`X posted ${post.slug} → ${tweet.id}`);
      }
    }
  } else {
    console.log(`Skip X for ${post.slug} (credentials missing).`);
  }

  if (igCreds || dryRun) {
    if (!imageUrl) {
      console.log(`Skip Instagram for ${post.slug} (no cover image — IG requires one).`);
    } else if (dryRun) {
      console.log(`[dry-run] Instagram ← image=${imageUrl} caption=${JSON.stringify(igCaption)}`);
    } else if (igCreds) {
      const mediaId = await postToInstagram(igCreds, imageUrl, igCaption);
      console.log(`Instagram posted ${post.slug} → ${mediaId}`);
    }
  } else {
    console.log(`Skip Instagram for ${post.slug} (credentials missing).`);
  }
}

/* -------------------------------------------------------------------------- */
/* Resolve which noticias to share                                            */
/* -------------------------------------------------------------------------- */

async function resolvePosts() {
  if (args.slug) {
    const slugs = String(args.slug)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const loaded = [];
    for (const slug of slugs) {
      const post = loadPost(slug);
      if (!post) continue;
      if (!isShareable(post)) {
        console.log(
          `Skip ${slug} (${post.draft ? 'draft' : 'social: false'}).`,
        );
        continue;
      }
      loaded.push(post);
    }
    return loaded;
  }

  const base = args.base || process.env.SOCIAL_BASE_SHA || '';
  const head = args.head || process.env.SOCIAL_HEAD_SHA || 'HEAD';

  if (!base || /^0+$/.test(base)) {
    console.log('No base SHA (first push or missing). Pass --slug=… or --base=<sha>.');
    return [];
  }

  const added = gitDiffNames(base, head, 'A');
  const modified = gitDiffNames(base, head, 'M');

  const out = [];
  const seen = new Set();

  for (const file of added) {
    const slug = slugFromPath(file);
    if (!slug || seen.has(slug)) continue;
    const post = loadPost(slug, file);
    if (post && isShareable(post)) {
      seen.add(slug);
      out.push(post);
    }
  }

  // draft: true → false (or draft removed) on an existing file counts as publish.
  for (const file of modified) {
    const slug = slugFromPath(file);
    if (!slug || seen.has(slug)) continue;
    const next = loadPost(slug, file);
    if (!next || !isShareable(next)) continue;
    const prevRaw = gitShow(`${base}:${file}`);
    if (prevRaw == null) continue;
    const prev = parseFrontmatter(prevRaw);
    const wasDraft = prev.draft === true || prev.draft === 'true';
    if (wasDraft) {
      seen.add(slug);
      out.push(next);
    }
  }

  return out;
}

function isShareable(post) {
  if (post.draft) return false;
  if (post.social === false) return false;
  return true;
}

function loadPost(slug, filePath = join(NOTICIAS_DIR, `${slug}.md`)) {
  const abs = filePath.startsWith('/') ? filePath : join(ROOT, filePath);
  if (!existsSync(abs)) {
    console.warn(`Missing noticia file for slug "${slug}" (${relative(ROOT, abs)})`);
    return null;
  }
  const raw = readFileSync(abs, 'utf8');
  const data = parseFrontmatter(raw);
  return {
    slug,
    title: String(data.title || slug),
    excerpt: String(data.excerpt || ''),
    cover: data.cover ? String(data.cover) : null,
    socialCaption: data.socialCaption ? String(data.socialCaption) : null,
    draft: data.draft === true || data.draft === 'true',
    social: data.social === false || data.social === 'false' ? false : true,
  };
}

function slugFromPath(file) {
  const norm = file.replace(/\\/g, '/');
  if (!norm.startsWith(`${NOTICIAS_DIR}/`) || !norm.endsWith('.md')) return null;
  return basename(norm, '.md');
}

/* -------------------------------------------------------------------------- */
/* Captions                                                                   */
/* -------------------------------------------------------------------------- */

function buildXText(post, url) {
  if (post.socialCaption) {
    return truncateAtWord(`${post.socialCaption.trim()}\n\n${url}`, 280);
  }
  // Prefer title + link so Twitter Cards can show the OG image.
  const base = `${post.title.trim()}\n\n${url}`;
  if (base.length <= 280) return base;
  const budget = 280 - url.length - 4; // "\n\n" + "…"
  return `${truncateAtWord(post.title.trim(), budget)}…\n\n${url}`;
}

function buildIgCaption(post, url) {
  if (post.socialCaption) {
    return truncateAtWord(`${post.socialCaption.trim()}\n\n${url}\n\n#numismática #notafilia #Notofilia`, 2200);
  }
  const parts = [post.title.trim()];
  if (post.excerpt) parts.push('', post.excerpt.trim());
  parts.push('', url, '', '#numismática #notafilia #Notofilia');
  return truncateAtWord(parts.join('\n'), 2200);
}

function truncateAtWord(text, max) {
  if (text.length <= max) return text;
  let slice = text.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 40) slice = slice.slice(0, lastSpace);
  return `${slice.trimEnd()}…`;
}

/* -------------------------------------------------------------------------- */
/* Live deploy wait                                                           */
/* -------------------------------------------------------------------------- */

async function waitForLive(articleUrl, imageUrl) {
  const deadline = Date.now() + DEFAULT_WAIT_MS;
  console.log(`Waiting for live deploy (up to ${Math.round(DEFAULT_WAIT_MS / 1000)}s): ${articleUrl}`);
  while (Date.now() < deadline) {
    const articleOk = await urlOk(articleUrl);
    const imageOk = imageUrl ? await urlOk(imageUrl) : true;
    if (articleOk && imageOk) {
      console.log('Live URLs ready.');
      return;
    }
    await sleep(POLL_MS);
  }
  throw new Error(
    `Timed out waiting for ${articleUrl}${imageUrl ? ` and ${imageUrl}` : ''} after Cloudflare Pages deploy.`,
  );
}

async function urlOk(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': 'NotofiliaSocialBot/1.0' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* X (Twitter)                                                                */
/* -------------------------------------------------------------------------- */

function readXCreds() {
  const apiKey =
    process.env.X_API_KEY ||
    process.env.X_CONSUMER_KEY ||
    process.env.TWITTER_API_KEY;
  const apiSecret =
    process.env.X_API_SECRET ||
    process.env.X_SECRET_KEY ||
    process.env.X_CONSUMER_SECRET ||
    process.env.TWITTER_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret =
    process.env.X_ACCESS_TOKEN_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET;

  // Common mix-up: portal Bearer Token is app-only and cannot create tweets.
  if (process.env.X_BEARER_TOKEN && !accessToken) {
    console.warn(
      'X_BEARER_TOKEN is set but Access Token is missing. Bearer Token is app-only and cannot post; generate Access Token + Secret (Read and write). See docs/social-posting.md',
    );
  }

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return null;
  return { apiKey, apiSecret, accessToken, accessSecret };
}

async function postToX(creds, text) {
  const url = 'https://api.twitter.com/2/tweets';
  const auth = oauth1Header('POST', url, creds);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: auth,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${JSON.stringify(body)}`);
  }
  const id = body?.data?.id;
  if (!id) throw new Error(`X API missing tweet id: ${JSON.stringify(body)}`);
  return { id };
}

function oauth1Header(method, url, creds) {
  const oauth = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  };

  const params = new URLSearchParams();
  // Collect query params from URL (none for tweets endpoint) + oauth params.
  const u = new URL(url);
  for (const [k, v] of u.searchParams) params.append(k, v);
  for (const [k, v] of Object.entries(oauth)) params.append(k, v);

  const normalized = [...params.entries()]
    .map(([k, v]) => [percentEncode(k), percentEncode(v)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const base = [
    method.toUpperCase(),
    percentEncode(`${u.origin}${u.pathname}`),
    percentEncode(normalized),
  ].join('&');

  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessSecret)}`;
  oauth.oauth_signature = createHmac('sha1', signingKey).update(base).digest('base64');

  const header = Object.entries(oauth)
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(', ');
  return `OAuth ${header}`;
}

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Instagram Graph API                                                        */
/* -------------------------------------------------------------------------- */

function readIgCreds() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!accessToken || !igUserId) return null;
  return { accessToken, igUserId };
}

async function postToInstagram(creds, imageUrl, caption) {
  const createUrl = new URL(
    `https://graph.facebook.com/${GRAPH_VERSION}/${creds.igUserId}/media`,
  );
  createUrl.searchParams.set('image_url', imageUrl);
  createUrl.searchParams.set('caption', caption);
  createUrl.searchParams.set('access_token', creds.accessToken);

  const createRes = await fetch(createUrl, { method: 'POST' });
  const createBody = await createRes.json().catch(() => ({}));
  if (!createRes.ok || !createBody.id) {
    throw new Error(`Instagram create container ${createRes.status}: ${JSON.stringify(createBody)}`);
  }

  const creationId = createBody.id;
  await waitForIgContainer(creds, creationId);

  const publishUrl = new URL(
    `https://graph.facebook.com/${GRAPH_VERSION}/${creds.igUserId}/media_publish`,
  );
  publishUrl.searchParams.set('creation_id', creationId);
  publishUrl.searchParams.set('access_token', creds.accessToken);

  const publishRes = await fetch(publishUrl, { method: 'POST' });
  const publishBody = await publishRes.json().catch(() => ({}));
  if (!publishRes.ok || !publishBody.id) {
    throw new Error(`Instagram publish ${publishRes.status}: ${JSON.stringify(publishBody)}`);
  }
  return publishBody.id;
}

async function waitForIgContainer(creds, creationId) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const statusUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/${creationId}`,
    );
    statusUrl.searchParams.set('fields', 'status_code,status');
    statusUrl.searchParams.set('access_token', creds.accessToken);
    const res = await fetch(statusUrl);
    const body = await res.json().catch(() => ({}));
    const code = body.status_code;
    if (code === 'FINISHED') return;
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(`Instagram container ${creationId} failed: ${JSON.stringify(body)}`);
    }
    await sleep(3000);
  }
  throw new Error(`Instagram container ${creationId} not ready in time.`);
}

/* -------------------------------------------------------------------------- */
/* Frontmatter (minimal YAML subset used by noticias)                         */
/* -------------------------------------------------------------------------- */

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) {
      i += 1;
      continue;
    }
    // Skip nested list blocks we do not need (keywords, relatedLinks).
    if (/^\s+-\s/.test(line) || /^\s+\w/.test(line)) {
      i += 1;
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      i += 1;
      continue;
    }
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '' || val === '|' || val === '>') {
      // Multiline / empty — skip consuming nested lines for keys we care about.
      i += 1;
      if (val === '' && (key === 'keywords' || key === 'relatedLinks')) {
        while (i < lines.length && (/^\s/.test(lines[i]) || lines[i].trim() === '')) i += 1;
      }
      continue;
    }
    data[key] = coerceScalar(val);
    i += 1;
  }
  return data;
}

function coerceScalar(val) {
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}

/* -------------------------------------------------------------------------- */
/* Git helpers                                                                */
/* -------------------------------------------------------------------------- */

function gitDiffNames(base, head, filter) {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', `--diff-filter=${filter}`, `${base}...${head}`, '--', NOTICIAS_DIR],
      { cwd: ROOT, encoding: 'utf8' },
    );
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    throw new Error(`git diff failed (${base}...${head}): ${err.message}`);
  }
}

function gitShow(spec) {
  try {
    return execFileSync('git', ['show', spec], { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                       */
/* -------------------------------------------------------------------------- */

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    if (a === '--dry-run') out['dry-run'] = true;
    else if (a === '--skip-wait') out['skip-wait'] = true;
    else if (a.startsWith('--slug=')) out.slug = a.slice('--slug='.length);
    else if (a.startsWith('--base=')) out.base = a.slice('--base='.length);
    else if (a.startsWith('--head=')) out.head = a.slice('--head='.length);
    else if (a === '--help' || a === '-h') out.help = true;
  }
  if (out.help) {
    console.log(`Usage: node scripts/social-post-noticias.mjs [options]
  --dry-run          Log captions without posting
  --skip-wait        Do not wait for live Cloudflare Pages URLs
  --slug=a,b         Share specific slug(s)
  --base=<sha>       Diff base (CI: github.event.before)
  --head=<sha>       Diff head (CI: github.sha)`);
    process.exit(0);
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
