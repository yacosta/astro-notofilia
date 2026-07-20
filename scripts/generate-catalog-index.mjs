import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_DIR = path.join(ROOT, 'src/content/catalog');
const OUT_DIR = path.join(ROOT, 'public/data');
const OUT_FILE = path.join(OUT_DIR, 'catalog-index.json');
const SITE = 'https://www.notofilia.com';

const files = (await readdir(CATALOG_DIR)).filter((f) => f.endsWith('.json')).sort();
const items = [];

for (const file of files) {
  const raw = await readFile(path.join(CATALOG_DIR, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    continue;
  }
  if (!data.path || !data.title) continue;
  items.push({
    id: file.replace(/\.json$/, ''),
    path: data.path,
    title: data.title,
    description: data.description || '',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    url: SITE + data.path,
  });
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  ) + '\n',
);

console.log(`Wrote ${items.length} catalog entries to ${path.relative(ROOT, OUT_FILE)}`);
