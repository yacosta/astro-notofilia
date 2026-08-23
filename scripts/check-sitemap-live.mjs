/**
 * Probe live crawler discovery URLs on notofilia.com.
 *
 * Detects two failure modes that cause Google Search Console
 * "General HTTP error" on /sitemap.xml:
 *
 * 1. Broad challenges (Security Level under attack / rules that hit everyone)
 * 2. Bot Fight Mode targeting automated clients (curl-like User-Agents)
 *
 * Note: Node's default fetch UA may receive 200 while `curl` receives
 * `cf-mitigated: challenge` — BFM is UA/fingerprint sensitive. This script
 * probes both a site UA and a curl UA so BFM is not silently missed.
 *
 * Usage:
 *   node scripts/check-sitemap-live.mjs
 *   CHECK_SITEMAP_ORIGIN=https://notofilia.com node scripts/check-sitemap-live.mjs
 *   CHECK_SITEMAP_REQUIRE_CURL=0  — skip the curl-UA probe (file existence only)
 */
import { spawnSync } from 'node:child_process';

const origin = (process.env.CHECK_SITEMAP_ORIGIN || 'https://notofilia.com').replace(/\/$/, '');
const requireCurlProbe = process.env.CHECK_SITEMAP_REQUIRE_CURL !== '0';

const PATHS = [
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/news-sitemap.xml',
  '/robots.txt',
];

const errors = [];
const warnings = [];

function isChallenge({ status, mitigated, body, ctype }) {
  if (mitigated === 'challenge') return true;
  if (status === 403 && /text\/html/i.test(ctype || '')) return true;
  if (/just a moment/i.test(body || '')) return true;
  if (/cdn-cgi\/challenge/i.test(body || '')) return true;
  if (/cf-browser-verification/i.test(body || '')) return true;
  return false;
}

async function probeFetch(path, userAgent) {
  const url = `${origin}${path}`;
  let res;
  try {
    res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': userAgent,
        accept: 'application/xml,text/xml,text/plain,*/*',
      },
    });
  } catch (error) {
    return { url, userAgent, error: error.message };
  }
  const body = await res.text();
  return {
    url,
    userAgent,
    status: res.status,
    mitigated: res.headers.get('cf-mitigated'),
    ctype: res.headers.get('content-type') || '',
    body,
  };
}

function probeCurl(path) {
  const url = `${origin}${path}`;
  const result = spawnSync(
    'curl',
    ['-sL', '-D', '-', '-o', '-', '-A', 'curl/8.5.0', '--max-time', '20', url],
    { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 },
  );
  if (result.error) {
    return { url, userAgent: 'curl/8.5.0', error: result.error.message };
  }
  const combined = result.stdout || '';
  const splitAt = combined.indexOf('\r\n\r\n');
  const headerBlock = splitAt >= 0 ? combined.slice(0, splitAt) : combined;
  const body = splitAt >= 0 ? combined.slice(splitAt + 4) : '';
  const status = Number(headerBlock.match(/HTTP\/[\d.]+ (\d+)/)?.[1] || 0);
  const mitigated = headerBlock.match(/cf-mitigated:\s*(\S+)/i)?.[1] || null;
  const ctype = headerBlock.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || '';
  return { url, userAgent: 'curl/8.5.0', status, mitigated, ctype, body };
}

function validateSitemapBody(path, probe, label) {
  const { url, status, ctype, body } = probe;
  if (!status || status >= 400) {
    errors.push(`${label} ${url}: HTTP ${status || 'n/a'}`);
    return;
  }
  if (path.endsWith('.xml')) {
    if (!/xml|text\/plain/i.test(ctype)) {
      errors.push(`${label} ${url}: unexpected Content-Type "${ctype || '(missing)'}"`);
    }
    if (!body.includes('<urlset') && !body.includes('<sitemapindex')) {
      errors.push(`${label} ${url}: body is not a sitemap (missing <urlset> / <sitemapindex>)`);
    }
  } else if (path === '/robots.txt') {
    if (!/Sitemap:\s*https:\/\/notofilia\.com\/sitemap/i.test(body)) {
      errors.push(`${label} ${url}: missing Sitemap: https://notofilia.com/sitemap… directives`);
    }
  }
}

const siteUa = 'NotofiliaSitemapCheck/1.0 (+https://notofilia.com/)';

for (const path of PATHS) {
  const siteProbe = await probeFetch(path, siteUa);
  if (siteProbe.error) {
    errors.push(`${siteProbe.url}: network error (${siteProbe.error})`);
    continue;
  }

  if (isChallenge(siteProbe)) {
    errors.push(
      `site-UA ${siteProbe.url}: Cloudflare challenge (HTTP ${siteProbe.status}, cf-mitigated=${siteProbe.mitigated || 'n/a'}). ` +
        'Security Level may be “I’m Under Attack”, or a WAF rule challenges all clients. See docs/search-console-sitemap.md.',
    );
    continue;
  }

  validateSitemapBody(path, siteProbe, 'site-UA');
  console.log(
    `OK site-UA ${siteProbe.status} ${siteProbe.url} (${siteProbe.ctype || 'no content-type'}, ${siteProbe.body.length} bytes)`,
  );

  if (!requireCurlProbe || !path.endsWith('.xml')) continue;

  const curlProbe = probeCurl(path);
  if (curlProbe.error) {
    warnings.push(`curl-UA ${curlProbe.url}: probe failed (${curlProbe.error})`);
    continue;
  }
  if (isChallenge(curlProbe)) {
    errors.push(
      `curl-UA ${curlProbe.url}: Cloudflare Bot Fight challenge (HTTP ${curlProbe.status}, cf-mitigated=${curlProbe.mitigated || 'n/a'}). ` +
        'Automated clients (and sometimes Search Console) get HTML instead of XML. ' +
        'Allow Google ASN AS15169 via IP Access Rules, or turn Bot Fight Mode off. ' +
        'See docs/search-console-sitemap.md / `npm run allow:crawlers`.',
    );
    continue;
  }
  validateSitemapBody(path, curlProbe, 'curl-UA');
  console.log(`OK curl-UA ${curlProbe.status} ${curlProbe.url}`);
}

if (warnings.length) {
  console.warn('\nWarnings:\n');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nLive sitemap check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`\nLive sitemap check passed for ${origin}.`);
