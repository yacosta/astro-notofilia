import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const publicDir = new URL('../public/', import.meta.url);
const catalogDir = new URL('../src/content/catalog/', import.meta.url);
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const sitemapIndexPath = new URL('../public/sitemap_index.xml', import.meta.url);
const newsSitemapPath = new URL('../public/news-sitemap.xml', import.meta.url);
const site = 'https://notofilia.com';
const publicationName = 'Notofilia';
const today = new Date().toISOString().slice(0, 10);
// Google News only uses articles from roughly the last two days.
const newsMaxAgeMs = 48 * 60 * 60 * 1000;

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const entries = new Map();
const previousMetadata = new Map();
const newsEntries = [];

function newestDate(...dates) {
  return dates.filter(Boolean).sort().at(-1);
}

function add(url, options = {}) {
  const normalized = url.endsWith('/') ? url : `${url}/`;
  const previous = previousMetadata.get(normalized) ?? {};
  const forceToday = process.env.FORCE_SITEMAP_LASTMOD === '1';
  entries.set(normalized, {
    loc: normalized,
    // Keep the newest known date so a host-migration lastmod bump is not
    // clobbered by older publishedAt values on the next prebuild.
    lastmod:
      newestDate(forceToday ? today : null, options.lastmod, previous.lastmod) ??
      today,
    changefreq: options.changefreq ?? previous.changefreq ?? 'monthly',
    priority: options.priority ?? previous.priority ?? '0.7',
  });
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[kv[1]] = value;
  }
  return fields;
}

function isWithinNewsWindow(publishedAt) {
  const published = new Date(`${publishedAt}T00:00:00.000Z`);
  if (Number.isNaN(published.getTime())) return false;
  const ageMs = Date.now() - published.getTime();
  return ageMs >= 0 && ageMs <= newsMaxAgeMs;
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
// Logros del Mes is a homepage strip (/#logros-heading), not a separate index.
for (const section of ['blog', 'noticias', 'logros']) {
  if (section !== 'logros') {
    add(`${site}/${section}/`, { changefreq: 'weekly', priority: '0.8' });
  }
  const sectionDir = new URL(`../src/content/${section}/`, import.meta.url);
  let files = [];
  try {
    files = await readdir(sectionDir);
  } catch {
    continue;
  }
  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const source = await readFile(join(sectionDir.pathname, file), 'utf8');
    if (/^draft:\s*true\s*$/m.test(source)) continue;
    const frontmatter = parseFrontmatter(source);
    const publishedAt = frontmatter.publishedAt ?? today;
    const slug = basename(file).replace(/\.mdx?$/, '');
    const loc = `${site}/${section}/${slug}/`;
    add(loc, {
      lastmod: publishedAt,
      changefreq: 'monthly',
      priority: '0.7',
    });

    if (section === 'noticias' && frontmatter.title && isWithinNewsWindow(publishedAt)) {
      newsEntries.push({
        loc,
        title: frontmatter.title,
        publishedAt,
      });
    }
  }
}

add(`${site}/`, { changefreq: 'weekly', priority: '1.0' });
// Global collection hub is a native Astro page (not a catalog JSON entry).
add(`${site}/coleccion/`, { changefreq: 'weekly', priority: '0.9' });
add(`${site}/coleccion/numismatica/`, { changefreq: 'weekly', priority: '0.85' });
// Public editorial / valuation policy (native Astro page).
add(`${site}/editorial/`, { changefreq: 'monthly', priority: '0.5' });
add(`${site}/editorial/equipo/`, { changefreq: 'monthly', priority: '0.4' });
// /buscar/ is intentionally noindex (utility search UI) — omit from sitemap.

const ordered = [...entries.values()].sort((a, b) => {
  if (a.loc === `${site}/`) return -1;
  if (b.loc === `${site}/`) return 1;
  return a.loc.localeCompare(b.loc, 'es');
});

newsEntries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.loc.localeCompare(b.loc, 'es'));

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

const newsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsEntries.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${entry.publishedAt}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>
`;

const childSitemaps = [
  { loc: `${site}/sitemap.xml`, lastmod: today },
  { loc: `${site}/news-sitemap.xml`, lastmod: today },
];

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${childSitemaps.map((entry) => `  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`;

await writeFile(sitemapPath, xml, 'utf8');
await writeFile(newsSitemapPath, newsXml, 'utf8');
await writeFile(sitemapIndexPath, indexXml, 'utf8');
console.log(
  `Generated sitemap.xml (${ordered.length} pages), news-sitemap.xml (${newsEntries.length} recent noticias), sitemap_index.xml.`,
);
