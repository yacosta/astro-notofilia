/**
 * Fail the build if unresolved template placeholders remain in shipped
 * Astro HTML / catalog data. Legacy `*.dc.html` shells are no longer
 * published; `support.js` still uses Mustache internally and is skipped.
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
  '_astro',
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

function shouldSkipFile(filePath) {
  const base = path.basename(filePath);
  if (/^support(\.min)?\.js$/i.test(base)) return true;
  if (/^coleccion-hub\.js$/i.test(base)) return true;
  return false;
}

function catalogFichaLayoutIssues(data) {
  const template = data.template || '';
  const record = data.record || {};
  if (record.render === 'astro-hub' || (record.cards && record.cards.length)) return [];
  if (String(data.path || '').includes('/perfil-')) return [];
  const issues = [];
  const dialogs = [...template.matchAll(/<div[^>]*(?:role="dialog"|data-zoom-dialog)[^>]*>/gi)].map(
    (match) => match[0],
  );
  if (dialogs.some((dialog) => !/\bhidden\b/i.test(dialog) || /display\s*:\s*flex/i.test(dialog))) {
    issues.push('zoom dialog would cover the ficha on load');
  }
  const isPiece = record.kind === 'coin' || record.kind === 'banknote';
  if (!isPiece) return issues;
  const h1At = template.search(/<h1\b/i);
  const triggerAt = template.search(/data-zoom-trigger/i);
  const denomAt = template.search(/>Denominación</i);
  const paisAt = template.search(/>País</i);
  const cecaAt = template.search(/>Ceca</i);
  const distritoAt = template.search(/>Distrito</i);
  const serieAt = template.search(/>N\.(?:&deg;|º|°)? de Serie</i);
  const specAt =
    [denomAt, paisAt, cecaAt, distritoAt, serieAt]
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0] ?? -1;
  if (h1At >= 0 && triggerAt >= 0 && triggerAt < h1At) {
    issues.push('piece image sits above the title');
  }
  if (specAt >= 0 && triggerAt >= 0 && specAt < triggerAt && specAt > h1At) {
    issues.push('piece image sits below the spec table instead of under the title');
  }
  if (h1At >= 0 && triggerAt >= 0) {
    const between = template.slice(h1At, triggerAt);
    if (/<p\b[^>]*line-height:\s*1\.7/i.test(between)) {
      issues.push('intro copy sits between the title and the piece image');
    }
  }
  return issues;
}

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
  if (!/\.(html?|xml|txt|json)$/i.test(filePath)) return;
  if (shouldSkipFile(filePath)) return;
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
      if (/<sc-for/i.test(data.template || '')) {
        hits.push({
          file: path.relative(root, file),
          count: 1,
          samples: ['<sc-for> (note loop was not expanded into static HTML)'],
        });
      }
      const layout = catalogFichaLayoutIssues(data);
      if (layout.length) {
        hits.push({
          file: path.relative(root, file),
          count: layout.length,
          samples: layout,
        });
      }
      text = `${data.template || ''}\n${JSON.stringify(data.record ?? {})}`;
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
