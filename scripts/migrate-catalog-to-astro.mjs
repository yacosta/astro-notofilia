import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const legacyDir = path.join(root, 'legacy/catalog-dc');
const outputDir = path.join(root, 'src/content/catalog');
const routeMapPath = path.join(root, 'scripts/catalog-route-map.json');

let routes;
try {
  routes = JSON.parse(await readFile(routeMapPath, 'utf8'));
} catch {
  const redirects = await readFile(path.join(publicDir, '_redirects'), 'utf8');
  routes = redirects
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(\/coleccion(?:\/[^\s]*)?\/)\s+\/(\S+\.dc\.html)\s+200$/))
    .filter(Boolean)
    .map((match) => ({ route: match[1], legacyFile: match[2] }));
  await writeFile(routeMapPath, `${JSON.stringify(routes, null, 2)}\n`);
}

if (!routes.length) throw new Error('No catalog routes found in public/_redirects');

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const decodeEntities = (value = '') => value
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(amp|quot|apos|lt|gt|nbsp|mdash|ndash|laquo|raquo);/g, (_, name) => ({
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    mdash: '—', ndash: '–', laquo: '«', raquo: '»',
  })[name]);

const attr = (html, pattern) => decodeEntities(html.match(pattern)?.[1]?.trim() ?? '');
const text = (html, pattern) => decodeEntities(html.match(pattern)?.[1]?.replace(/<[^>]+>/g, '')?.trim() ?? '');

for (const { route, legacyFile } of routes) {
  let source;
  try { source = await readFile(path.join(legacyDir, legacyFile), 'utf8'); }
  catch { source = await readFile(path.join(publicDir, legacyFile), 'utf8'); }
  const xdc = source.match(/<x-dc(?:\s[^>]*)?>([\s\S]*?)<\/x-dc>/i)?.[1];
  if (!xdc) throw new Error(`${legacyFile}: missing <x-dc>`);

  const helmet = xdc.match(/<helmet>([\s\S]*?)<\/helmet>/i)?.[1] ?? '';
  let template = xdc
    .replace(/<helmet>[\s\S]*?<\/helmet>/i, '')
    .replace(/<a\s+href="#main-content"[\s\S]*?<\/a>/i, '')
    .replace(/<dc-import\s+name="SiteHeader"[^>]*><\/dc-import>/i, '')
    .replace(/<dc-import\s+name="SiteFooter"[^>]*><\/dc-import>/i, '')
    .trim();

  const logic = source.match(/<script\s+type="text\/x-dc"\s+data-dc-script[^>]*>([\s\S]*?)<\/script>/i)?.[1]?.trim() ?? '';
  const styles = [...helmet.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1].replace(/<link[^>]*>/gi, '').trim())
    .filter(Boolean)
    .join('\n');
  const jsonLdText = helmet.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  let jsonLd;
  if (jsonLdText) {
    try { jsonLd = JSON.parse(jsonLdText); }
    catch { throw new Error(`${legacyFile}: invalid JSON-LD`); }
  }

  const canonicalPath = new URL(attr(helmet, /<link\s+rel="canonical"\s+href="([^"]+)"/i) || route, 'https://notofilia.com').pathname;
  if (canonicalPath !== route) throw new Error(`${legacyFile}: route ${route} does not match canonical ${canonicalPath}`);

  const ogImageUrl = attr(helmet, /<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const keywords = attr(helmet, /<meta\s+name="keywords"\s+content="([^"]*)"/i)
    .split(',').map((keyword) => keyword.trim()).filter(Boolean);
  const data = {
    path: route,
    title: text(helmet, /<title>([\s\S]*?)<\/title>/i),
    description: attr(helmet, /<meta\s+name="description"\s+content="([^"]*)"/i),
    keywords,
    robots: attr(helmet, /<meta\s+name="robots"\s+content="([^"]*)"/i) || 'index, follow',
    ogType: attr(helmet, /<meta\s+property="og:type"\s+content="([^"]*)"/i) || 'article',
    ogTitle: attr(helmet, /<meta\s+property="og:title"\s+content="([^"]*)"/i),
    ogDescription: attr(helmet, /<meta\s+property="og:description"\s+content="([^"]*)"/i),
    ogImage: ogImageUrl ? new URL(ogImageUrl, 'https://notofilia.com').pathname : '/favicon.png',
    jsonLd,
    styles,
    template,
    logic,
    legacyFile,
    sourceHash: createHash('sha256').update(source).digest('hex').slice(0, 16),
  };

  if (!data.title || !data.description) throw new Error(`${legacyFile}: missing required SEO metadata`);
  const id = route === '/coleccion/' ? 'index' : route.slice('/coleccion/'.length, -1).replaceAll('/', '--');
  await writeFile(path.join(outputDir, `${id}.json`), `${JSON.stringify(data, null, 2)}\n`);
}

const generated = (await readdir(outputDir)).filter((file) => file.endsWith('.json')).length;
console.log(`Migrated ${generated} catalog routes into src/content/catalog.`);
