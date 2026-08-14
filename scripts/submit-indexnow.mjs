/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver, etc.).
 *
 * Google does not consume IndexNow; use Search Console for Google.
 * After deploy, run:
 *   node scripts/submit-indexnow.mjs
 *   INDEXNOW_LIMIT=50 node scripts/submit-indexnow.mjs   # sample only
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = 'notofilia.com';
const key = (await readFile(path.join(root, 'public/indexnow-key.txt'), 'utf8')).trim();
const keyLocation = `https://${host}/${key}.txt`;

const sitemapXml = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
let urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const limit = Number(process.env.INDEXNOW_LIMIT || 0);
if (limit > 0) urls = urls.slice(0, limit);

// Prefer homepage + hubs first when sampling.
urls.sort((a, b) => {
  const rank = (u) => {
    if (u === `https://${host}/`) return 0;
    if (u === `https://${host}/coleccion/`) return 1;
    if (u.includes('/editorial/')) return 2;
    if (u.includes('/noticias/') || u.includes('/blog/')) return 3;
    return 4;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
});

const endpoint = 'https://api.indexnow.org/indexnow';
const payload = {
  host,
  key,
  keyLocation,
  urlList: urls,
};

const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log(`IndexNow POST ${endpoint} → HTTP ${res.status}`);
if (text) console.log(text.slice(0, 500));
if (![200, 202].includes(res.status)) {
  console.error(`IndexNow rejected ${urls.length} URL(s).`);
  process.exit(1);
}
console.log(`Submitted ${urls.length} URL(s) via IndexNow (key ${key}).`);

// Bing still documents a sitemap ping endpoint.
const bingPing = `https://www.bing.com/indexnow?url=${encodeURIComponent(`https://${host}/`)}&key=${encodeURIComponent(key)}`;
try {
  const ping = await fetch(bingPing, { method: 'get', redirect: 'follow' });
  console.log(`Bing IndexNow ping → HTTP ${ping.status}`);
} catch (error) {
  console.warn(`Bing ping failed: ${error.message}`);
}

// Google's sitemap ping was deprecated (2023) but still harmless as a hint.
const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(`https://${host}/sitemap_index.xml`)}`;
try {
  const ping = await fetch(googlePing, { method: 'get', redirect: 'follow' });
  console.log(`Google sitemap ping (deprecated) → HTTP ${ping.status}`);
} catch (error) {
  console.warn(`Google ping failed: ${error.message}`);
}
