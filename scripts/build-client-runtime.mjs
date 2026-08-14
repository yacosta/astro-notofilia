import { build } from 'esbuild';

await build({
  entryPoints: ['scripts/preact-compat-entry.js'],
  outfile: 'public/vendor/preact-compat.min.js',
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'none',
});

await build({
  entryPoints: ['src/client/web-vitals-bootstrap.js'],
  outfile: 'public/web-vitals.js',
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'none',
});

