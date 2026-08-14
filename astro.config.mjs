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
  // Keep empty alt="" and intentional whitespace for a11y scanners / layout.
  // Astro 7 defaults to compressHTML: 'jsx', which can collapse spaces between
  // inline elements and may strip empty attributes under aggressive minify.
  compressHTML: false,
  build: {
    format: 'directory',
    // Shared Tailwind bundle is ~23 KiB — inline it to remove the render-blocking
    // `/_astro/*.css` round-trip that PageSpeed flags on mobile.
    inlineStylesheets: 'always',
  },
  // Astro 7.1+ supports granular CSP `kind` (`element` | `attribute` | `default`)
  // for script-src-*/style-src-*. Enforcing Astro CSP is deferred: this site still
  // relies on Cloudflare `_headers` Report-Only CSP plus dc-runtime / Turnstile
  // inline scripts. Enable `security.csp` in a follow-up once hashes and kinds
  // are validated against real page inventories.
  vite: {
    plugins: [tailwindcss()],
  },
});
