import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const parkRoot = path.join(root, '.pagefind-park');

/**
 * Paths under dist/ that must never enter the Pagefind index:
 * oauth UI, DC template fragments, and any leftover mustache shells.
 */
const PARK_RELATIVE = [
  'oauth',
  'BanknoteCard.dc.html',
  'SiteHeader.dc.html',
  'SiteFooter.dc.html',
];

await rm(parkRoot, { recursive: true, force: true });
await mkdir(parkRoot, { recursive: true });

const parked = [];
for (const relative of PARK_RELATIVE) {
  const from = path.join(dist, relative);
  const to = path.join(parkRoot, relative.replaceAll('/', '__'));
  try {
    await rename(from, to);
    parked.push({ from, to });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const result = spawnSync(
  'npx',
  [
    'pagefind',
    '--site',
    'dist',
    '--root-selector',
    'main',
    '--exclude-selectors',
    '[data-pagefind-ignore], x-dc, sc-for, template',
  ],
  { cwd: root, stdio: 'inherit' },
);

for (const { from, to } of parked) {
  await rename(to, from);
}
await rm(parkRoot, { recursive: true, force: true });

process.exit(result.status ?? 1);
