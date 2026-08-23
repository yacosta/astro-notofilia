/**
 * Load the ES↔EN pair registry for Node .mjs scripts (sitemap).
 * Single source of truth remains `src/i18n/pairs.ts` — this helper only
 * calls into that module (Node type stripping). It does not copy the list.
 */
import { execFileSync } from 'node:child_process';

const pairsHref = new URL('../src/i18n/pairs.ts', import.meta.url).href;

let cached = null;

function loadPairs() {
  if (cached) return cached;
  const output = execFileSync(
    process.execPath,
    [
      '--experimental-strip-types',
      '--disable-warning=ExperimentalWarning',
      '--input-type=module',
      '--eval',
      `import { allPairs } from ${JSON.stringify(pairsHref)}; process.stdout.write(JSON.stringify(allPairs()));`,
    ],
    {
      encoding: 'utf8',
      cwd: process.cwd(),
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  cached = JSON.parse(output);
  return cached;
}

/** Every registered ES↔EN pair at prebuild time. */
export function allPairs() {
  return loadPairs();
}
