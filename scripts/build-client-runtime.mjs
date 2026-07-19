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

