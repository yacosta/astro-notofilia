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
const legacyCatalogRedirect = /^\/\S+\.dc(?:\.html)?\s+\/coleccion(?:\/|$)/;
const existing = (await readFile(redirectsPath, 'utf8'))
  .split(/\r?\n/)
  .filter((line) => !catalogPrettyRoute.test(line.trim()))
  .filter((line) => !legacyCatalogRedirect.test(line.trim()))
  .filter((line) => !/^#\s*(Legacy catalog document URLs|Bare \.dc hosts)/i.test(line.trim()));
const legacyRedirects = routes.flatMap(({ route, legacyFile }) => {
  const htmlSource = `/${legacyFile}`;
  const bareSource = htmlSource.endsWith('.dc.html')
    ? htmlSource.slice(0, -5) // /name.dc.html -> /name.dc
    : htmlSource;
  return [
    `${htmlSource}  ${route}  301`,
    ...(bareSource !== htmlSource ? [`${bareSource}  ${route}  301`] : []),
  ];
});
await writeFile(
  redirectsPath,
  `${[
    ...existing.filter(Boolean),
    '',
    '# Legacy catalog document URLs',
    '# Bare .dc hosts (pre-.html DotCommerce / GSC) share the same destinations as .dc.html',
    ...legacyRedirects,
  ].join('\n')}\n`,
);

console.log(`Archived ${routes.length} standalone catalog documents and activated Astro routes.`);
