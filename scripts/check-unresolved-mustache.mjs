/**
 * Fail the production build if any shipped HTML still contains Mustache
 * `{{ … }}` expressions. Client-only state (zoom %, form status, language
 * toggles) must render a static fallback in HTML and be updated by script.
 *
 * Equivalent to:
 *   grep -rn '{{[^}]*}}' dist/ --include="*.html" && exit 1 || exit 0
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const PLACEHOLDER = /\{\{[^}]*\}\}/g;

async function walkHtml(dir, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(`Mustache check failed: ${path.relative(root, dir)} does not exist. Run the production build first.`);
      process.exit(1);
    }
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkHtml(full, out);
      continue;
    }
    if (!/\.html?$/i.test(entry.name)) continue;
    out.push(full);
  }
}

const files = [];
await walkHtml(dist, files);

const hits = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const matches = [...text.matchAll(PLACEHOLDER)];
  if (!matches.length) continue;
  const lines = text.split(/\r?\n/);
  const samples = [];
  for (let i = 0; i < lines.length && samples.length < 8; i += 1) {
    if (!PLACEHOLDER.test(lines[i])) continue;
    PLACEHOLDER.lastIndex = 0;
    const found = lines[i].match(PLACEHOLDER) ?? [];
    samples.push(`L${i + 1}: ${[...new Set(found)].join(', ')}`);
  }
  hits.push({
    file: path.relative(root, file),
    count: matches.length,
    samples,
  });
}

if (hits.length) {
  console.error('Unresolved Mustache expressions found in shipped HTML:\n');
  for (const hit of hits) {
    console.error(`- ${hit.file} (${hit.count})`);
    for (const sample of hit.samples) console.error(`    ${sample}`);
  }
  console.error(
    `\n${hits.length} HTML file(s) still contain {{ … }}. Render a static fallback and let the client script replace it.`,
  );
  process.exit(1);
}

console.log(`Mustache check passed (${files.length} HTML files scanned, zero {{ }}).`);
