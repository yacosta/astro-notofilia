import { build } from 'esbuild';

await build({
  entryPoints: ['dist/support.js'],
  outfile: 'dist/support.min.js',
  minify: true,
  allowOverwrite: true,
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'none',
});

await import('node:fs/promises').then(({ rename }) =>
  rename('dist/support.min.js', 'dist/support.js'),
);

