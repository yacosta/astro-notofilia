import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const legacyDir = path.join(root, 'legacy/catalog-dc');
const redirectsPath = path.join(publicDir, '_redirects');
const routes = JSON.parse(await readFile(path.join(root, 'scripts/catalog-route-map.json'), 'utf8'));

await mkdir(legacyDir, { recursive: true });
for (const { legacyFile } of routes) {
  try { await rename(path.join(publicDir, legacyFile), path.join(legacyDir, legacyFile)); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const catalogPrettyRoute = /^\/coleccion(?:\/[^\s]*)?\/\s+\/\S+\.dc\.html\s+200$/;
const existing = (await readFile(redirectsPath, 'utf8'))
  .split(/\r?\n/)
  .filter((line) => !catalogPrettyRoute.test(line.trim()))
  .filter((line) => !/^\/\S+\.dc\.html\s+\/coleccion\//.test(line.trim()));
const legacyRedirects = routes.map(({ route, legacyFile }) => `/${legacyFile}  ${route}  301`);
await writeFile(redirectsPath, `${[...existing.filter(Boolean), '', '# Legacy catalog document URLs', ...legacyRedirects].join('\n')}\n`);

console.log(`Archived ${routes.length} standalone catalog documents and activated Astro routes.`);
