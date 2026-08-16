import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
/** Live Cloudflare preferred host (www → apex). Keep SEO URLs on apex. */
const SITE_ORIGIN = 'https://notofilia.com';
const FORBIDDEN_ORIGIN = 'https://www.notofilia.com';

const fail = (message) => errors.push(message);
const normalizePath = (value) => {
  const pathname = value.startsWith('http') ? new URL(value).pathname : value;
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const sitemapXml = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalizePath(match[1]));
const sitemap = new Set(sitemapPaths);
if (sitemap.size !== sitemapPaths.length) fail('sitemap.xml contains duplicate <loc> entries');
if (sitemapXml.includes(FORBIDDEN_ORIGIN)) fail(`sitemap.xml still uses ${FORBIDDEN_ORIGIN}; prefer ${SITE_ORIGIN}`);
const rawSitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!rawSitemapLocs.every((loc) => loc === SITE_ORIGIN || loc === `${SITE_ORIGIN}/` || loc.startsWith(`${SITE_ORIGIN}/`))) {
  fail(`sitemap.xml <loc> entries must use ${SITE_ORIGIN}`);
}

const robotsTxt = await readFile(path.join(root, 'public/robots.txt'), 'utf8');
if (robotsTxt.includes(FORBIDDEN_ORIGIN)) fail(`robots.txt still uses ${FORBIDDEN_ORIGIN}; prefer ${SITE_ORIGIN}`);
if (!robotsTxt.includes(`Sitemap: ${SITE_ORIGIN}/sitemap_index.xml`)) {
  fail(`robots.txt must declare Sitemap: ${SITE_ORIGIN}/sitemap_index.xml`);
}

const siteTs = await readFile(path.join(root, 'src/lib/site.ts'), 'utf8');
if (!siteTs.includes(`SITE = '${SITE_ORIGIN}'`)) fail(`src/lib/site.ts SITE must be '${SITE_ORIGIN}'`);
if (siteTs.includes(FORBIDDEN_ORIGIN)) fail(`src/lib/site.ts still references ${FORBIDDEN_ORIGIN}`);

const sitemapIndexXml = await readFile(path.join(root, 'public/sitemap_index.xml'), 'utf8');
if (!sitemapIndexXml.includes('<sitemapindex')) fail('sitemap_index.xml is missing <sitemapindex>');
for (const required of [`${SITE_ORIGIN}/sitemap.xml`, `${SITE_ORIGIN}/news-sitemap.xml`]) {
  if (!sitemapIndexXml.includes(`<loc>${required}</loc>`)) fail(`sitemap_index.xml does not reference ${required}`);
}

const newsSitemapXml = await readFile(path.join(root, 'public/news-sitemap.xml'), 'utf8');
if (!newsSitemapXml.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')) {
  fail('news-sitemap.xml is missing the Google News namespace');
}
for (const block of newsSitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = block[1].match(/<loc>(.*?)<\/loc>/)?.[1];
  if (!loc) {
    fail('news-sitemap.xml has a <url> without <loc>');
    continue;
  }
  if (!sitemap.has(normalizePath(loc))) fail(`news-sitemap.xml lists non-sitemap URL ${loc}`);
  if (!block[1].includes('<news:news>')) fail(`news-sitemap.xml entry ${loc} is missing <news:news>`);
}

const redirectLines = (await readFile(path.join(root, 'public/_redirects'), 'utf8'))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
const redirects = redirectLines.map((line) => {
  const [from, to, status] = line.split(/\s+/);
  if (!from || !to || !status) fail(`Malformed redirect rule: ${line}`);
  return { from, to, status, line };
});
const redirectSources = new Set();
for (const redirect of redirects) {
  if (redirectSources.has(redirect.from)) fail(`Duplicate redirect source: ${redirect.from}`);
  redirectSources.add(redirect.from);
  if (!['200', '301'].includes(redirect.status)) fail(`Unexpected redirect status in: ${redirect.line}`);
}

const rewrites = new Map(redirects.filter(({ status }) => status === '200').map((rule) => [normalizePath(rule.from), rule]));
const permanentRedirects = redirects.filter(({ status }) => status === '301');

const htmlCache = new Map();
async function htmlForRoute(route) {
  const normalized = normalizePath(route);
  const rewrite = rewrites.get(normalized);
  const relative = rewrite
    ? rewrite.to.replace(/^\//, '')
    : normalized === '/'
      ? 'index.html'
      : path.join(normalized.replace(/^\//, ''), 'index.html');
  const file = path.join(root, 'dist', relative);
  if (!htmlCache.has(file)) {
    try { htmlCache.set(file, await readFile(file, 'utf8')); }
    catch { fail(`${normalized} has no built HTML at dist/${relative}`); htmlCache.set(file, ''); }
  }
  return { html: htmlCache.get(file), file };
}

const canonicalOwners = new Map();
for (const route of sitemap) {
  const { html } = await htmlForRoute(route);
  if (!html) continue;
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map((match) => match[1]);
  if (canonicals.length !== 1) {
    fail(`${route} must contain exactly one canonical link; found ${canonicals.length}`);
    continue;
  }
  const canonicalPath = normalizePath(canonicals[0]);
  if (canonicalPath !== route) fail(`${route} canonical points to ${canonicalPath}`);
  if (canonicalOwners.has(canonicalPath)) fail(`${canonicalPath} is claimed by multiple sitemap pages`);
  canonicalOwners.set(canonicalPath, route);

  if (/name="robots"\s+content="[^"]*noindex/i.test(html)) fail(`${route} is in the sitemap but marked noindex`);
  if (!/<main\b/i.test(html)) fail(`${route} has no <main> for Pagefind indexing`);
  if (/<main\b[^>]*data-pagefind-ignore/i.test(html)) fail(`${route} is in the sitemap but excluded from Pagefind`);
  const searchPath = html.match(/data-pagefind-meta="url:([^"]+)"/i)?.[1];
  if (searchPath && normalizePath(searchPath) !== route) fail(`${route} Pagefind URL points to ${searchPath}`);
}

for (const rule of redirects) {
  const targetPath = normalizePath(rule.to);
  // Page redirects must land on indexed HTML routes. Asset/sitemap endpoints are allowed.
  const targetIsPage = !/\.(xml|txt|json|js|css|png|jpe?g|webp|svg|ico|woff2?|ttf|map)$/i.test(rule.to.split('?')[0]);
  if (rule.status === '301' && targetIsPage && !sitemap.has(targetPath)) {
    fail(`${rule.from} redirects to non-sitemap URL ${targetPath}`);
  }
  if (rule.status === '200') {
    const sourcePath = normalizePath(rule.from);
    if (!sitemap.has(sourcePath)) fail(`${rule.from} rewrite is missing from sitemap.xml`);
    const { html } = await htmlForRoute(sourcePath);
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (canonical && normalizePath(canonical) !== sourcePath) fail(`${rule.from} rewrite canonical points to ${canonical}`);
  }
}

const catalogDir = path.join(root, 'src/content/catalog');
const catalogFiles = (await readdir(catalogDir)).filter((file) => file.endsWith('.json'));
const catalogEntries = await Promise.all(catalogFiles.map(async (file) => JSON.parse(await readFile(path.join(catalogDir, file), 'utf8'))));
const catalogPaths = new Set(catalogEntries.map((entry) => normalizePath(entry.path)));
const routeMap = JSON.parse(await readFile(path.join(root, 'scripts/catalog-route-map.json'), 'utf8'));
if (catalogPaths.size !== catalogEntries.length) fail('Catalog collection contains duplicate paths');
if (routeMap.length !== catalogEntries.length) fail(`Catalog route map has ${routeMap.length} entries; collection has ${catalogEntries.length}`);
for (const { route, legacyFile } of routeMap) {
  const normalized = normalizePath(route);
  if (!catalogPaths.has(normalized)) fail(`Route map path missing from catalog collection: ${normalized}`);
  if (!sitemap.has(normalized)) fail(`Catalog path missing from sitemap: ${normalized}`);
  const expectedSources = [`/${legacyFile}`];
  if (legacyFile.endsWith('.dc.html')) {
    expectedSources.push(`/${legacyFile.slice(0, -5)}`); // name.dc.html -> name.dc
  }
  for (const expectedSource of expectedSources) {
    const legacyRule = permanentRedirects.find(({ from }) => from === expectedSource);
    if (!legacyRule) fail(`Missing legacy redirect for ${expectedSource}`);
    else if (normalizePath(legacyRule.to) !== normalized) fail(`${expectedSource} redirects to ${legacyRule.to}, expected ${normalized}`);
  }
}

const header = await readFile(path.join(root, 'legacy/dc-shells/SiteHeader.dc.html'), 'utf8');
if (!header.includes('import("/pagefind/pagefind.js")')) fail('Shared legacy header is not wired to Pagefind');
if (/href:\s*["'][^"']+\.dc\.html/i.test(header)) fail('Shared search/navigation contains a legacy .dc.html target');
if (/Próximamente|Proximamente/i.test(header)) fail('Shared navigation advertises unavailable catalog entries');

const nativeHeader = await readFile(path.join(root, 'src/components/SiteHeader.astro'), 'utf8');
if (!nativeHeader.includes('site-header.js')) fail('Native SiteHeader does not load site-header.js');
if (!nativeHeader.includes('/coleccion/')) fail('Native SiteHeader is missing the collection link');
const navTs = await readFile(path.join(root, 'src/lib/nav.ts'), 'utf8');
if (!navTs.includes('/coleccion/numismatica/')) fail('Primary nav is missing the dedicated coins catalog');
if (!navTs.includes('Colección virtual - Numismática')) fail('Primary nav is missing the Numismática accordion label');
if (!navTs.includes('Colección virtual - Notafilia')) fail('Primary nav is missing the Notafilia accordion label');
if (!navTs.includes("href: '/contacto/'")) fail('Primary nav is missing Contacto');
if (/id:\s*'editorial'/.test(navTs)) {
  fail('Primary nav must not duplicate Blog/Noticias/Glosario under an Editorial accordion');
}
if (!navTs.includes('/#logros-heading')) fail('Primary nav is missing Logros del Mes');
if (!nativeHeader.includes('site-header__accordion')) fail('Native SiteHeader is missing collection accordion markup');
const drawerContactIdx = nativeHeader.indexOf('CONTACT_LINK.href');
const drawerSectionsIdx = nativeHeader.indexOf('NAV_SECTIONS.map');
if (drawerContactIdx === -1 || drawerSectionsIdx === -1 || drawerContactIdx < drawerSectionsIdx) {
  fail('Native SiteHeader must render Contacto after the collection accordions');
}
const legacyContactIdx = header.lastIndexOf('href="/contacto/"');
const legacyPerfilBtnIdx = header.indexOf('onClick="{{ togglePerfil }}"');
if (legacyContactIdx === -1 || legacyPerfilBtnIdx === -1 || legacyContactIdx < legacyPerfilBtnIdx) {
  fail('Legacy SiteHeader must render Contacto after the last collection accordion');
}
if (!sitemap.has('/coleccion/numismatica/')) fail('sitemap.xml is missing /coleccion/numismatica/');
if (!sitemap.has('/glosario/')) fail('sitemap.xml is missing /glosario/');
for (const slug of ['notafilia', 'specimen', 'pick', 'friedberg', 'billete-sin-circular']) {
  if (!sitemap.has(`/glosario/${slug}/`)) fail(`sitemap.xml is missing /glosario/${slug}/`);
}
{
  const { html } = await htmlForRoute('/glosario/');
  if (html && !/notafilia/i.test(html)) fail('/glosario/ HTML does not contain “notafilia” without depending on JS');
  if (html && !html.includes('"@type":"DefinedTermSet"') && !html.includes('"@type": "DefinedTermSet"')) {
    fail('/glosario/ is missing DefinedTermSet JSON-LD');
  }
}
const headerIsland = await readFile(path.join(root, 'src/client/site-header.js'), 'utf8');
if (!headerIsland.includes('/pagefind/') || !headerIsland.includes('pagefind.js')) {
  fail('Native header island is not wired to Pagefind');
}
if (!headerIsland.includes('import(')) fail('Native header island must lazy-import Pagefind');

const publicFiles = await readdir(path.join(root, 'public'));
const shippedDcHtml = publicFiles.filter((file) => file.toLowerCase().endsWith('.dc.html'));
if (shippedDcHtml.length) {
  fail(`public/ still ships .dc.html files (${shippedDcHtml.join(', ')}); serve native Astro routes and 301 the .dc variants`);
}

const standaloneCanonicals = [
  { pretty: '/j-s-g-boggs/', dc: 'perfil-j-s-g-boggs.dc.html' },
  { pretty: '/contacto/', dc: 'contacto.dc.html' },
  { pretty: '/politica-privacidad-cookies/', dc: 'politica-privacidad-cookies.dc.html' },
];
for (const { pretty, dc } of standaloneCanonicals) {
  if (!sitemap.has(pretty)) fail(`sitemap.xml is missing standalone canonical ${pretty}`);
  const expectedSources = [`/${dc}`];
  if (dc.endsWith('.dc.html')) expectedSources.push(`/${dc.slice(0, -5)}`);
  for (const expectedSource of expectedSources) {
    const legacyRule = permanentRedirects.find(({ from }) => from === expectedSource);
    if (!legacyRule) fail(`Missing legacy redirect for ${expectedSource}`);
    else if (normalizePath(legacyRule.to) !== pretty) {
      fail(`${expectedSource} redirects to ${legacyRule.to}, expected ${pretty}`);
    } else if (legacyRule.status !== '301') {
      fail(`${expectedSource} must 301 to ${pretty}, found ${legacyRule.status}`);
    }
  }
  const rewriteToDc = redirects.find(
    (rule) => rule.status === '200' && normalizePath(rule.from) === pretty,
  );
  if (rewriteToDc) fail(`${pretty} must not 200-rewrite onto a .dc document (${rewriteToDc.line})`);
  const { html } = await htmlForRoute(pretty);
  if (html && /\{\{[^}]*\}\}/.test(html)) fail(`${pretty} still contains unresolved Mustache {{ }}`);
}
{
  const { html } = await htmlForRoute('/j-s-g-boggs/');
  if (html && !html.includes('data-zoom-percent')) fail('/j-s-g-boggs/ is missing data-zoom-percent for catalog-zoom.js');
  if (html && !html.includes('>100%<')) fail('/j-s-g-boggs/ must ship a static 100% zoom fallback');
}

const distRoot = path.join(root, 'dist');
let distEntries = [];
try { distEntries = await readdir(distRoot); } catch { distEntries = []; }
const distDcHtml = distEntries.filter((file) => file.toLowerCase().endsWith('.dc.html'));
if (distDcHtml.length) fail(`dist/ still publishes .dc.html (${distDcHtml.join(', ')})`);

for (const entry of catalogEntries) {
  const cardCount = (entry.template.match(/<dc-import\s+name="BanknoteCard"/g) ?? []).length;
  if (cardCount < 1 || cardCount > 2) continue;
  const { html } = await htmlForRoute(entry.path);
  if (!html.includes('catalog-inventory-status')) fail(`${entry.path} is a thin catalog without an inventory-status disclosure`);
  if (!html.includes(`${cardCount} pieza${cardCount === 1 ? '' : 's'} documentada${cardCount === 1 ? '' : 's'}`)) {
    fail(`${entry.path} inventory disclosure does not match its ${cardCount} catalog card${cardCount === 1 ? '' : 's'}`);
  }
}

let pagefindEntry;
try { pagefindEntry = JSON.parse(await readFile(path.join(root, 'dist/pagefind/pagefind-entry.json'), 'utf8')); }
catch { fail('Pagefind output is missing; run the production build before drift checks'); }
const indexedCount = pagefindEntry
  ? Object.values(pagefindEntry.languages ?? {}).reduce((total, language) => total + (language.page_count ?? 0), 0)
  : 0;
if (indexedCount !== sitemap.size) fail(`Pagefind indexes ${indexedCount} pages; sitemap contains ${sitemap.size}`);

if (errors.length) {
  console.error(`Site drift check failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Site drift check passed: ${sitemap.size} sitemap/canonical/search pages, ${redirects.length} redirects, ${catalogEntries.length} catalog entries.`);
