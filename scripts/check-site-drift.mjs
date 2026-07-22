import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];

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

const sitemapIndexXml = await readFile(path.join(root, 'public/sitemap_index.xml'), 'utf8');
if (!sitemapIndexXml.includes('<sitemapindex')) fail('sitemap_index.xml is missing <sitemapindex>');
for (const required of [`${'https://www.notofilia.com'}/sitemap.xml`, `${'https://www.notofilia.com'}/news-sitemap.xml`]) {
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
  const expectedSource = `/${legacyFile}`;
  const legacyRule = permanentRedirects.find(({ from }) => from === expectedSource);
  if (!legacyRule) fail(`Missing legacy redirect for ${expectedSource}`);
  else if (normalizePath(legacyRule.to) !== normalized) fail(`${expectedSource} redirects to ${legacyRule.to}, expected ${normalized}`);
}

const header = await readFile(path.join(root, 'public/SiteHeader.dc.html'), 'utf8');
if (!header.includes('import("/pagefind/pagefind.js")')) fail('Shared header is not wired to Pagefind');
if (/href:\s*["'][^"']+\.dc\.html/i.test(header)) fail('Shared search/navigation contains a legacy .dc.html target');
if (/Próximamente|Proximamente/i.test(header)) fail('Shared navigation advertises unavailable catalog entries');

const publicFiles = await readdir(path.join(root, 'public'));
const standalonePages = publicFiles.filter((file) => file.endsWith('.dc.html') && file === file.toLowerCase());
for (const file of standalonePages) {
  const html = await readFile(path.join(root, 'public', file), 'utf8');
  if (!/^<!doctype html>/i.test(html.trimStart())) continue;
  if (/<style\b[^>]*>[\s\S]*?<link\b[^>]*catalog-fonts\.css/i.test(html)) {
    fail(`${file} places the catalog font stylesheet inside a <style> block`);
  }
  if (!/<link\s+rel="stylesheet"\s+href="\/catalog-fonts\.css">/i.test(html)) {
    fail(`${file} does not load the shared catalog font stylesheet`);
  }
}

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
