import { defineConfig } from 'astro/config';

// Notofilia.com — Astro static build.
//
// The site's pages are hand-authored, self-contained HTML documents that rely
// on a client-side "dc-runtime" (public/support.js) using `{{ … }}` mustache
// placeholders and inline `${ … }` script template literals. That syntax is
// incompatible with Astro's build-time component/JSX parser, so the pages are
// served verbatim from `public/` rather than being re-authored as `.astro`
// components. Astro provides the toolchain (dev server, build, preview) and a
// foundation for incremental componentization going forward (see 404.astro).
//
// `site` is set so canonical/absolute URLs resolve correctly. Output is the
// default `static`; deployment target is Cloudflare Pages (dist/ + functions/).
export default defineConfig({
  site: 'https://www.notofilia.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
