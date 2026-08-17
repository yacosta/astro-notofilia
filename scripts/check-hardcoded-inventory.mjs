/**
 * Fail if inventory counts are hard-coded outside the stats module.
 * Live figures must come from getCollectionStats() / catalog-inventory.mjs.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getCollectionStatsFromDisk } from '../src/lib/catalog-inventory.mjs';

const root = process.cwd();
const files = [
  'src/pages/index.astro',
  'src/pages/coleccion/index.astro',
  'src/pages/editorial/index.astro',
  'src/components/HomeHero.astro',
  'src/components/HomeStatsBar.astro',
  'src/components/SiteFooter.astro',
  'src/lib/catalog-hub.ts',
  'functions/api/catalog.js',
  'scripts/generate-llms-txt.mjs',
];

const patterns = [
  /\b176\b/,
  /\b217\b/,
  /34\s*países/i,
  /33\s*países/i,
  /countries:\s*34/,
];

const errors = [];
for (const relative of files) {
  const source = await readFile(path.join(root, relative), 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(source)) {
      errors.push(`${relative} still hard-codes inventory (${pattern})`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const stats = getCollectionStatsFromDisk();
const index = JSON.parse(await readFile(path.join(root, 'public/data/catalog-index.json'), 'utf8'));
if (stats.paises !== index.countries.length) {
  errors.push(`stats.paises (${stats.paises}) != catalog-index countries (${index.countries.length})`);
}
if (JSON.stringify(stats) !== JSON.stringify(index.stats)) {
  errors.push('public/data/catalog-index.json stats drift from getCollectionStatsFromDisk()');
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `Hardcoded inventory check passed (${files.length} files). Live stats: ${stats.billetes} billetes · ${stats.fichas} fichas · ${stats.paises} países.`,
);
