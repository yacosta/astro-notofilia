import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Notofilia.com — Astro static build.
//
// Catalog records live in an Astro data collection and render through one
// shared route/layout. Their preserved interactive note-viewer templates are
// passed to the dc-runtime as data, keeping mustache expressions out of Astro's
// component parser while centralizing SEO, accessibility, header, and footer.
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
    // Shared Tailwind bundle is ~23 KiB — inline it to remove the render-blocking
    // `/_astro/*.css` round-trip that PageSpeed flags on mobile.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
