/**
 * Fail the build if unresolved template placeholders remain in shipped HTML/JSON.
 * Catches leftover Mustache/DC bindings like {{ note.alt }} in dist/ or public data.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const PLACEHOLDER = /\{\{[^}]+\}\}/g;
const SKIP_DIR = new Set([
  'node_modules',
  '.git',
  '.astro',
  '.wrangler',
  'test-results',
  'playwright-report',
  'legacy',
  'pagefind',
]);

const TARGETS = [
  path.join(root, 'dist'),
  path.join(root, 'public', 'data'),
  path.join(root, 'src', 'content', 'catalog'),
  path.join(root, 'public', 'llms.txt'),
  path.join(root, 'public', 'llms-full.txt'),
  path.join(root, 'public', 'sitemap.xml'),
  path.join(root, 'public', 'news-sitemap.xml'),
  path.join(root, 'public', 'sitemap_index.xml'),
  path.join(root, 'public', 'robots.txt'),
];

async function walk(filePath, out) {
  let info;
  try {
    info = await stat(filePath);
  } catch {
    return;
  }
  if (info.isDirectory()) {
    const name = path.basename(filePath);
    if (SKIP_DIR.has(name)) return;
    const entries = await readdir(filePath);
    for (const entry of entries) {
      await walk(path.join(filePath, entry), out);
    }
    return;
  }
  if (!/\.(html?|xml|txt|json|js|css)$/i.test(filePath)) return;
  // Skip known DC component shells that are not standalone pages.
  const base = path.basename(filePath);
  if (/^(BanknoteCard|SiteHeader|SiteFooter)\.dc\.html$/i.test(base)) return;
  // Catalog JSON: only flag unresolved placeholders in structured `record`
  // (legacy `logic` / narrative fields may still mention mustache historically).
  if (filePath.includes(`${path.sep}src${path.sep}content${path.sep}catalog${path.sep}`) && filePath.endsWith('.json')) {
    out.push(filePath);
    return;
  }
  out.push(filePath);
}

const files = [];
for (const target of TARGETS) {
  await walk(target, files);
}

const hits = [];
for (const file of files) {
  let text = await readFile(file, 'utf8');
  if (file.includes(`${path.sep}src${path.sep}content${path.sep}catalog${path.sep}`) && file.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      text = JSON.stringify(data.record ?? {});
    } catch {
      // fall through to full-file scan
    }
  }
  const matches = text.match(PLACEHOLDER);
  if (!matches?.length) continue;
  const unique = [...new Set(matches)].slice(0, 8);
  hits.push({
    file: path.relative(root, file),
    count: matches.length,
    samples: unique,
  });
}

if (hits.length) {
  console.error('Unresolved template placeholders found in shipped output:\n');
  for (const hit of hits) {
    console.error(`- ${hit.file} (${hit.count}): ${hit.samples.join(', ')}`);
  }
  console.error(
    `\n${hits.length} file(s) still contain {{ … }} placeholders. Fix content or exclude from publish.`,
  );
  process.exit(1);
}

console.log(`Placeholder check passed (${files.length} files scanned).`);
