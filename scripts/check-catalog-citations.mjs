/**
 * Fail if a re-sourced ficha ships with a majority of retail citations,
 * unlabeled sources, or empty honesty fields.
 *
 * Re-sourced = record.resourced === true. Unaudited fichas are skipped.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { auditCatalogCitations, UNCONFIRMED_VALUE } from '../src/lib/catalog-citations.mjs';

const CATALOG_DIR = path.join(process.cwd(), 'src/content/catalog');
const files = (await readdir(CATALOG_DIR)).filter((f) => f.endsWith('.json')).sort();

const errors = [];
const rows = [];

for (const file of files) {
  const raw = await readFile(path.join(CATALOG_DIR, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    errors.push(`${file}: invalid JSON`);
    continue;
  }
  const record = data.record;
  if (!record) continue;
  const audit = auditCatalogCitations(record, data.template || '');
  if (!audit.resourced) continue;
  rows.push({ file, path: data.path, ...audit });
  for (const message of audit.errors) {
    errors.push(`${file}: ${message}`);
  }
}

if (rows.length === 0) {
  console.error('No re-sourced fichas (record.resourced) found; citation floor has nothing to check.');
  process.exit(1);
}

const nepal = rows.find((r) => r.path === '/coleccion/polimero-mundial/nepal-10-rupias-2005/');
if (!nepal) {
  errors.push('showcase ficha Nepal 10 rupias 2005 is not marked resourced');
} else if (nepal.retail > 0 && nepal.retail * 2 >= nepal.total) {
  errors.push('Nepal showcase still has a majority of retail citations');
}

console.log(`Re-sourced fichas: ${rows.length} (sentinel "${UNCONFIRMED_VALUE}" is a valid honesty value)`);
for (const row of rows) {
  const retailPct = row.retailShare == null ? 'n/a' : `${Math.round(row.retailShare * 100)}%`;
  const primaryPct = row.primaryShare == null ? 'n/a' : `${Math.round(row.primaryShare * 100)}%`;
  console.log(
    `  ${row.path} — ${row.total} fuentes · primaria ${row.primary}/${row.total} (${primaryPct}) · retail ${row.retail}/${row.total} (${retailPct})`,
  );
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Catalog citation floor passed.');
