// Build-time rewrite of catalogue image URLs to Cloudflare Image Transformations.
//
// The ~101 catalogue detail pages and the dc-runtime components (BanknoteCard,
// listing pages) are hand-authored/generated static HTML served verbatim from
// public/ — they can't use the src/lib/img.ts helper (no Astro build step of
// their own). Rather than hardcode /cdn-cgi/ URLs into those source files (a
// 101-file diff that would also break local `astro dev` preview, where the edge
// transform doesn't exist), this integration rewrites the *built* dist/ output
// only. Source files keep plain /uploads/ paths, so local dev renders normally;
// production gets AVIF/WebP + resize at the edge.
//
// Scope & safety:
//  - Only rewrites src / srcset / image / imageWebp attribute VALUES that point
//    at /uploads/*.{jpg,jpeg,png,webp,gif}. (image/imageWebp are the dc-runtime
//    props BanknoteCard passes to its <img>/<source>.)
//  - Never touches meta `content=` (og:image/twitter:image), `href=` (favicons),
//    or JSON-LD in <script> — those keep stable full-size URLs for social/SEO.
//  - Skips any value already containing /cdn-cgi/ — so the Astro-built pages
//    (index/blog/noticias), already transformed via the helper, are not
//    double-wrapped, and re-runs are idempotent.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const WIDTH = 1024;   // display cap; Cloudflare (fit=scale-down) never upscales past source
const QUALITY = 82;   // catalogue scans
const UPLOAD_URL = /(\/?uploads\/[^\s"',]+?\.(?:jpe?g|png|webp|gif))/gi;
const ATTR = /\b(srcset|src|imageWebp|image)="([^"]*)"/gi;

function wrap(u) {
  if (u.includes('/cdn-cgi/')) return u;
  const clean = u.startsWith('/') ? u : `/${u}`;
  return `/cdn-cgi/image/width=${WIDTH},format=auto,quality=${QUALITY}${clean}`;
}

export function rewriteHtml(html) {
  return html.replace(ATTR, (m, attr, val) => {
    if (!val.includes('uploads/') || val.includes('/cdn-cgi/')) return m;
    return `${attr}="${val.replace(UPLOAD_URL, wrap)}"`;
  });
}

export default function cdnImages() {
  return {
    name: 'cdn-images-postbuild',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = [];
        async function walk(d) {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) files.push(p);
          }
        }
        await walk(root);
        let changed = 0, added = 0;
        for (const f of files) {
          const html = await readFile(f, 'utf8');
          const out = rewriteHtml(html);
          if (out !== html) {
            const before = (html.match(/\/cdn-cgi\/image\//g) || []).length;
            const after = (out.match(/\/cdn-cgi\/image\//g) || []).length;
            added += after - before;
            await writeFile(f, out);
            changed++;
          }
        }
        logger.info(`cdn-images: +${added} transformed image URL(s) across ${changed} html file(s)`);
      },
    },
  };
}
