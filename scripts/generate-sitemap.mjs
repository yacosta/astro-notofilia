import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const publicDir = new URL('../public/', import.meta.url);
const catalogDir = new URL('../src/content/catalog/', import.meta.url);
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const site = 'https://www.notofilia.com';
const today = new Date().toISOString().slice(0, 10);

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const entries = new Map();
const previousMetadata = new Map();

function add(url, options = {}) {
  const normalized = url.endsWith('/') ? url : `${url}/`;
  const previous = previousMetadata.get(normalized) ?? {};
  entries.set(normalized, {
    loc: normalized,
    lastmod: options.lastmod ?? previous.lastmod ?? today,
    changefreq: options.changefreq ?? previous.changefreq ?? 'monthly',
    priority: options.priority ?? previous.priority ?? '0.7',
  });
}

// Preserve useful dates and priorities from the previous sitemap while making
// route discovery automatic below.
try {
  const previous = await readFile(sitemapPath, 'utf8');
  for (const block of previous.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    previousMetadata.set(loc.endsWith('/') ? loc : `${loc}/`, {
      lastmod: block[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
      changefreq: block[1].match(/<changefreq>(.*?)<\/changefreq>/)?.[1],
      priority: block[1].match(/<priority>(.*?)<\/priority>/)?.[1],
    });
  }
} catch {
  // First generation: all dates safely fall back to today.
}

// Catalog routes are first-class Astro collection entries.
for (const file of await readdir(catalogDir)) {
  if (!file.endsWith('.json')) continue;
  const page = JSON.parse(await readFile(join(catalogDir.pathname, file), 'utf8'));
  add(`${site}${page.path}`);
}

// Every hand-authored catalog/profile page declares its public canonical URL.
for (const file of await readdir(publicDir)) {
  if (!file.endsWith('.dc.html')) continue;
  const html = await readFile(join(publicDir.pathname, file), 'utf8');
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (canonical?.startsWith(site)) add(canonical);
}

// Native Astro section indexes and every published editorial entry.
for (const section of ['blog', 'noticias']) {
  add(`${site}/${section}/`, { changefreq: 'weekly', priority: '0.8' });
  const sectionDir = new URL(`../src/content/${section}/`, import.meta.url);
  for (const file of await readdir(sectionDir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const source = await readFile(join(sectionDir.pathname, file), 'utf8');
    if (/^draft:\s*true\s*$/m.test(source)) continue;
    const publishedAt = source.match(/^publishedAt:\s*([^\s]+)\s*$/m)?.[1] ?? today;
    add(`${site}/${section}/${basename(file).replace(/\.mdx?$/, '')}/`, {
      lastmod: publishedAt,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }
}

add(`${site}/`, { changefreq: 'weekly', priority: '1.0' });

const ordered = [...entries.values()].sort((a, b) => {
  if (a.loc === `${site}/`) return -1;
  if (b.loc === `${site}/`) return 1;
  return a.loc.localeCompare(b.loc, 'es');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ordered.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(sitemapPath, xml, 'utf8');
console.log(`Generated sitemap.xml with ${ordered.length} canonical pages.`);
