/**
 * Restore catalog pages whose Phase 3 freeze emptied `<sc-for>` loops.
 *
 * Reads the pre-Phase-3 template + DCLogic `noteData` from git and bakes the
 * note fields into static HTML so fichas render without dc-runtime.
 *
 * Usage: node scripts/restore-catalog-note-loops.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  collectNotes,
  freezeTemplate,
  metadataFromNotes,
} from './lib/catalog-freeze.mjs';

const CATALOG_DIR = path.join(process.cwd(), 'src/content/catalog');
const PRE_PHASE3 = 'c5c818a^';

function gitShow(fileName) {
  const spec = `${PRE_PHASE3}:src/content/catalog/${fileName}`;
  return execFileSync('git', ['show', spec], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function countryFromPath(p) {
  if (p.includes('/colombia/')) return 'Colombia';
  if (p.includes('/ecuador/')) return 'Ecuador';
  return undefined;
}

function statusFromPath(p, title) {
  const haystack = `${p} ${title}`.toLowerCase();
  if (haystack.includes('specimen') || haystack.includes('espécimen') || haystack.includes('muestra')) {
    return 'specimen';
  }
  return undefined;
}

function restoreFile(fileName) {
  const currentPath = path.join(CATALOG_DIR, fileName);
  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  let original;
  try {
    original = JSON.parse(gitShow(fileName));
  } catch {
    return null;
  }
  if (!/<sc-for/i.test(original.template || '')) return null;

  const notes = collectNotes(original.template || '', original.logic || '');
  const frozen = freezeTemplate(original.template || '', original.logic || '');

  current.template = frozen;
  current.logic = '';

  const record = current.record && typeof current.record === 'object' ? current.record : {};
  const metadata = metadataFromNotes(notes, { ...(record.metadata || {}) });
  const country = record.country || countryFromPath(current.path || '');
  const status = metadata.status || statusFromPath(current.path || '', current.title || '');
  if (status) metadata.status = status;
  if (country) record.country = country;
  if (Object.keys(metadata).length) record.metadata = metadata;
  current.record = record;

  fs.writeFileSync(currentPath, `${JSON.stringify(current, null, 2)}\n`);
  return {
    fileName,
    notes: notes.length,
    path: current.path,
  };
}

function main() {
  const files = fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.json'));
  const restored = [];
  for (const file of files) {
    const result = restoreFile(file);
    if (result) restored.push(result);
  }
  if (restored.length === 0) {
    console.log('No hollow <sc-for> catalog pages found.');
    return;
  }
  console.log(`Restored ${restored.length} catalog pages:`);
  for (const item of restored) {
    console.log(`  ${item.notes} notes  ${item.path}`);
  }
}

main();
