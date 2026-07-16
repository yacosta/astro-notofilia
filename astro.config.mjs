import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Notofilia.com — Astro static build.
//
// The site's *catalog* pages are hand-authored, self-contained HTML documents
// that rely on a client-side "dc-runtime" (public/support.js) using `{{ … }}`
// mustache placeholders and inline `${ … }` script template literals. That
// syntax is incompatible with Astro's build-time component/JSX parser, so those
// pages are served verbatim from `public/` rather than being re-authored as
// `.astro` components. Astro provides the toolchain and hosts the natively-built
// pages (homepage, 404, Noticias).
//
// Styling: the natively-Astro layer uses Tailwind v4 via the `@tailwindcss/vite`
// plugin. The shared token/utility stylesheet (src/styles/global.css) is
// imported per Astro page/layout. Preflight (Tailwind's global base reset) is
// intentionally NOT loaded — the dc-runtime mega-menu mounts into the same
// document on some pages, and a global reset would restyle the injected markup.
// The pages keep their own minimal resets; Tailwind adds tokens + utilities.
//
// `site` is set so canonical/absolute URLs resolve correctly. Output is the
// default `static`; deployment target is Cloudflare Pages (dist/ + functions/).
export default defineConfig({
  site: 'https://www.notofilia.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
