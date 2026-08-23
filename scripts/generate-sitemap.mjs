import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPairs } from './load-pairs.mjs';

const publicDir = new URL('../public/', import.meta.url);
const catalogDir = new URL('../src/content/catalog/', import.meta.url);
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const sitemapIndexPath = new URL('../public/sitemap_index.xml', import.meta.url);
const newsSitemapPath = new URL('../public/news-sitemap.xml', import.meta.url);
const site = 'https://notofilia.com';
const enPagesRoot = fileURLToPath(new URL('../src/pages/en/', import.meta.url));
const publicationName = 'Notofilia';
const today = new Date().toISOString().slice(0, 10);
// Google News only uses articles from roughly the last two days.
const newsMaxAgeMs = 48 * 60 * 60 * 1000;

/** noindex utilities and error documents — never sitemap these. */
const OMIT_PATHS = new Set(['/buscar/', '/en/search/', '/404/', '/en/404/']);

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const entries = new Map();
const previousMetadata = new Map();
const newsEntries = [];

const pairs = allPairs();
const pairByPath = new Map();
for (const pair of pairs) {
  pairByPath.set(pair.es, pair);
  pairByPath.set(pair.en, pair);
}

function locToPath(loc) {
  if (loc === site || loc === `${site}/`) return '/';
  if (loc.startsWith(site)) return loc.slice(site.length);
  return loc;
}

function isOmittedPath(pathname) {
  if (OMIT_PATHS.has(pathname)) return true;
  if (pathname === '/404') return true;
  return false;
}

function newestDate(...dates) {
  return dates.filter(Boolean).sort().at(-1);
}

function add(url, options = {}) {
  const normalized = url.endsWith('/') ? url : `${url}/`;
  if (isOmittedPath(locToPath(normalized))) return;
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

function slashPath(value) {
  if (!value || value === '/') return value || '/';
  return value.endsWith('/') ? value : `${value}/`;
}

function locKey(pathname) {
  return `${site}${pathname}`;
}

/**
 * True when `src/pages/en/` has a static file or a dynamic `[slug]` /
 * `[...slug]` builder that can emit this English path. Pair registry
 * entries without a route (A4 may register glossary/posts early) stay
 * out of the sitemap — do not advertise 404s.
 */
function englishPageBuilderExists(enPath) {
  if (enPath === '/en/') return existsSync(join(enPagesRoot, 'index.astro'));
  if (!enPath.startsWith('/en/')) return false;
  const rel = enPath.slice('/en/'.length).replace(/\/$/, '');
  if (!rel) return existsSync(join(enPagesRoot, 'index.astro'));
  const segments = rel.split('/').filter(Boolean);
  if (existsSync(join(enPagesRoot, ...segments, 'index.astro'))) return true;
  const leaf = segments[segments.length - 1];
  const parent = segments.slice(0, -1);
  if (existsSync(join(enPagesRoot, ...parent, `${leaf}.astro`))) return true;
  for (let take = 0; take < segments.length; take++) {
    const parentDir = join(enPagesRoot, ...segments.slice(0, take));
    const restCount = segments.length - take;
    if (restCount === 1 && existsSync(join(parentDir, '[slug].astro'))) return true;
    if (restCount >= 1 && existsSync(join(parentDir, '[...slug].astro'))) return true;
  }
  return false;
}

function pairIfBothIndexed(pathname) {
  const pair = pairByPath.get(pathname);
  if (!pair) return undefined;
  if (!entries.has(locKey(pair.es)) || !entries.has(locKey(pair.en))) return undefined;
  return pair;
}

function hreflangXml(pair) {
  const esLoc = `${site}${pair.es}`;
  const enLoc = `${site}${pair.en}`;
  return `    <xhtml:link rel="alternate" hreflang="es" href="${escapeXml(esLoc)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enLoc)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(esLoc)}" />`;
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

// Standalone native pages that used to live as public/*.dc.html shells.
add(`${site}/contacto/`, { changefreq: 'monthly', priority: '0.6' });
add(`${site}/politica-privacidad-cookies/`, { changefreq: 'yearly', priority: '0.3' });
add(`${site}/j-s-g-boggs/`, { changefreq: 'monthly', priority: '0.6' });

// Safety net: any remaining public *.dc.html still declaring a canonical.
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
        language: 'es',
      });
    }
  }
}

add(`${site}/`, { changefreq: 'weekly', priority: '1.0', lastmod: today });
add(`${site}/coleccion/numismatica/`, { changefreq: 'weekly', priority: '0.85' });
add(`${site}/coleccion/estados-unidos/`, { changefreq: 'weekly', priority: '0.8' });
add(`${site}/coleccion/espana/`, { changefreq: 'weekly', priority: '0.8' });
add(`${site}/nosotros/`, { changefreq: 'monthly', priority: '0.6' });
// Public editorial / valuation policy (native Astro page).
add(`${site}/editorial/`, { changefreq: 'monthly', priority: '0.5' });
add(`${site}/editorial/equipo/`, { changefreq: 'monthly', priority: '0.4' });
// Glossary index + one URL per term (native Astro collection).
add(`${site}/glosario/`, { changefreq: 'monthly', priority: '0.7' });
{
  const glosarioDir = new URL('../src/content/glosario/', import.meta.url);
  let glosarioFiles = [];
  try {
    glosarioFiles = await readdir(glosarioDir);
  } catch {
    glosarioFiles = [];
  }
  for (const file of glosarioFiles) {
    if (!file.endsWith('.md')) continue;
    const slug = basename(file).replace(/\.md$/, '');
    add(`${site}/glosario/${slug}/`, { changefreq: 'monthly', priority: '0.5' });
  }
}
// /buscar/ and /en/search/ are intentionally noindex — omit from sitemap.
// /404 and /en/404/ are error documents — omit.

// English URLs: pair.en from the registry when a `src/pages/en/` builder exists.
// Do not invent paths; do not advertise registry entries that would 404.
for (const pair of pairs) {
  if (isOmittedPath(pair.en)) continue;
  if (!englishPageBuilderExists(pair.en)) continue;
  const esLoc = `${site}${pair.es}`;
  const esEntry = entries.get(esLoc.endsWith('/') ? esLoc : `${esLoc}/`);
  const options = {};
  if (pair.kind === 'home' || pair.en === '/en/') {
    options.changefreq = 'weekly';
    options.priority = '1.0';
    options.lastmod = today;
  } else if (esEntry) {
    options.changefreq = esEntry.changefreq;
    options.priority = esEntry.priority;
  } else if (pair.en === '/en/news/' || pair.en === '/en/blog/') {
    options.changefreq = 'weekly';
    options.priority = '0.8';
  }
  add(`${site}${pair.en}`, options);
}

// English news articles (Google News): only paired posts with title + date.
// `/en/news/` index is a regular sitemap URL, not a News sitemap entry.
{
  const enNewsDir = new URL('../src/content/noticias-en/', import.meta.url);
  let enNewsFiles = [];
  try {
    enNewsFiles = await readdir(enNewsDir);
  } catch {
    enNewsFiles = [];
  }
  for (const file of enNewsFiles) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const source = await readFile(join(enNewsDir.pathname, file), 'utf8');
    if (/^draft:\s*true\s*$/m.test(source)) continue;
    const frontmatter = parseFrontmatter(source);
    const publishedAt = frontmatter.publishedAt ?? today;
    const slug = basename(file).replace(/\.mdx?$/, '');
    const fromPairEs = frontmatter.pairEs
      ? pairByPath.get(slashPath(frontmatter.pairEs))
      : undefined;
    const pair = fromPairEs ?? pairByPath.get(`/en/news/${slug}/`);
    if (!pair || isOmittedPath(pair.en) || pair.en === '/en/news/') continue;
    if (!entries.has(`${site}${pair.en}`)) continue;
    if (frontmatter.title && isWithinNewsWindow(publishedAt)) {
      newsEntries.push({
        loc: `${site}${pair.en}`,
        title: frontmatter.title,
        publishedAt,
        language: 'en',
      });
    }
  }
}

const homeLoc = `${site}/`;
const enHomeLoc = `${site}/en/`;
const ordered = [...entries.values()].sort((a, b) => {
  if (a.loc === homeLoc) return -1;
  if (b.loc === homeLoc) return 1;
  if (a.loc === enHomeLoc) return -1;
  if (b.loc === enHomeLoc) return 1;
  return a.loc.localeCompare(b.loc, 'es');
});

newsEntries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.loc.localeCompare(b.loc, 'es'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ordered.map((entry) => {
  const pair = pairIfBothIndexed(locToPath(entry.loc));
  const links = pair ? `\n${hreflangXml(pair)}` : '';
  return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${links}
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}).join('\n')}
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
        <news:language>${escapeXml(entry.language ?? 'es')}</news:language>
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
const enCount = ordered.filter((entry) => locToPath(entry.loc).startsWith('/en/')).length;
const pairedCount = ordered.filter((entry) => pairIfBothIndexed(locToPath(entry.loc))).length;
console.log(
  `Generated sitemap.xml (${ordered.length} pages, ${enCount} English, ${pairedCount} with xhtml:link hreflang), news-sitemap.xml (${newsEntries.length} recent noticias), sitemap_index.xml.`,
);
