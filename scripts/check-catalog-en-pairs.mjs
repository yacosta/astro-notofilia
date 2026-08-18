#!/usr/bin/env node
/**
 * Fail if any catalog JSON is missing a complete English pair (path + template).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'src/content/catalog');

const missing = [];
const badPath = [];
const seenEn = new Map();
const dupEn = [];

for (const file of readdirSync(CATALOG).filter((f) => f.endsWith('.json'))) {
  const rec = JSON.parse(readFileSync(join(CATALOG, file), 'utf8'));
  const en = rec.i18n?.en;
  if (!en?.path || !en?.template || !en?.title || !en?.description) {
    missing.push({ file, path: rec.path, has: Object.keys(en || {}) });
    continue;
  }
  if (!en.path.startsWith('/en/collection/') || !en.path.endsWith('/')) {
    badPath.push({ file, enPath: en.path });
  }
  if (seenEn.has(en.path)) dupEn.push({ file, other: seenEn.get(en.path), enPath: en.path });
  else seenEn.set(en.path, file);
}

if (missing.length || badPath.length || dupEn.length) {
  console.error(
    JSON.stringify({ missingCount: missing.length, missing, badPath, dupEn }, null, 2),
  );
  process.exit(1);
}

console.log(`check-catalog-en-pairs: ${seenEn.size} catalog JSON files have i18n.en.path + template`);
