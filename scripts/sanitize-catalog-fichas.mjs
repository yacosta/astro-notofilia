/**
 * Put ficha spec tables above stacked scans and hide leftover zoom overlays
 * on every catalog template (not only the Phase 3 <sc-for> restores).
 *
 * Usage: node scripts/sanitize-catalog-fichas.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { sanitizeCatalogTemplate } from './lib/catalog-freeze.mjs';

const CATALOG_DIR = path.join(process.cwd(), 'src/content/catalog');

function main() {
  const files = fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.json'));
  const changed = [];
  for (const fileName of files) {
    const filePath = path.join(CATALOG_DIR, fileName);
    const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (typeof current.template !== 'string' || !current.template) continue;
    const next = sanitizeCatalogTemplate(current.template);
    if (next === current.template) continue;
    current.template = next;
    fs.writeFileSync(filePath, `${JSON.stringify(current, null, 2)}\n`);
    changed.push({ fileName, path: current.path });
  }
  console.log(`Sanitized ${changed.length} catalog templates:`);
  for (const item of changed) {
    console.log(`  ${item.path || item.fileName}`);
  }
}

main();
