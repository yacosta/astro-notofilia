import { rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const oauthDir = path.join(dist, 'oauth');
const oauthParked = path.join(root, '.oauth-pagefind-park');

await rm(oauthParked, { recursive: true, force: true });
let parked = false;
try {
  await rename(oauthDir, oauthParked);
  parked = true;
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const result = spawnSync(
  'npx',
  ['pagefind', '--site', 'dist', '--root-selector', 'main'],
  { cwd: root, stdio: 'inherit' },
);

if (parked) {
  await rename(oauthParked, oauthDir);
}

process.exit(result.status ?? 1);
