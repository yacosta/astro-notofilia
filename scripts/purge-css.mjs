/**
 * Post-build CSS purge for dist/ (inlined <style> blocks + external .css).
 *
 * Tailwind already tree-shakes utilities at build time. PurgeCSS cannot match
 * Tailwind v4 arbitrary-value class names in HTML (e.g. text-[clamp(...)]) to
 * their escaped CSS selectors, so it incorrectly strips homepage/editorial
 * utilities and catalog [style*="…"] skins. Those blocks are left intact;
 * remaining plain CSS may still be purged.
 */
import { PurgeCSS } from "purgecss";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve("dist");

const SAFELIST = {
  standard: [
    "is-visible",
    "hidden",
    "flex",
    "sr-only",
    "skip-link",
    "sc-dc-streaming",
    "sc-host",
    "hero-slide",
    "footer-heart",
    /^astro-/,
    /^data-astro-/,
  ],
  // Keep catalog skin + editorial helpers. Catalog rules heavily use
  // [style*="…"] attribute selectors that PurgeCSS cannot mark as used.
  deep: [
    /focus-visible/,
    /focus\b/,
    /hover/,
    /prefers-reduced-motion/,
    /group-hover/,
    /catalog-shell/,
    /catalog-inventory/,
    /prose-notofilia/,
    /footer-heart/,
    /heart-pulse/,
    /dc-root/,
    /sc-host/,
    /^x-dc$/,
  ],
  greedy: [/catalog-shell/, /catalog-inventory/, /prose-notofilia/, /dc-root/, /sc-host/],
  variables: [
    /^--tw-/,
    /^--color-/,
    /^--font-/,
    /^--header-/,
    /^--spacing/,
    /^--text-/,
    /^--surface-/,
    /^--rule-/,
    /^--accent-/,
    /^--page-/,
    /^--radius-/,
    /^--shadow-/,
    /^--max-width-/,
  ],
};

async function walk(dir, pred) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, pred)));
    else if (pred(full)) files.push(full);
  }
  return files;
}

function splitFontFaces(css) {
  const faces = [];
  const rest = css.replace(/@font-face\s*\{[^}]*\}/g, (m) => {
    faces.push(m);
    return "";
  });
  return { faces, rest };
}

async function purgeRaw(css, content) {
  const { faces, rest } = splitFontFaces(css);
  const result = await new PurgeCSS().purge({
    content,
    css: [{ raw: rest }],
    safelist: SAFELIST,
    fontFace: true,
    keyframes: true,
    variables: true,
  });
  return `${faces.join("")}${result[0]?.css ?? rest}`;
}

async function purgeHtmlFile(file) {
  const html = await readFile(file, "utf8");
  const styleRe = /<style([^>]*)>([\s\S]*?)<\/style>/g;
  const blocks = [...html.matchAll(styleRe)];
  if (!blocks.length) return { file, before: 0, after: 0 };

  let before = 0;
  let after = 0;
  let out = html;
  let offset = 0;
  const contentHtml = html.replace(/<style[\s\S]*?<\/style>/g, "");

  for (const match of blocks) {
    const full = match[0];
    const attrs = match[1];
    const css = match[2];
    before += css.length;
    // Leave intact:
    // - Catalog skins ([style*="…"] attribute selectors PurgeCSS can't see)
    // - Tailwind layers/utilities (arbitrary values like text-[clamp(...)] /
    //   bg-cream/92 are escaped in CSS and get false-negative purged)
    const skipPurge =
      /\.catalog-shell\b|\.catalog-inventory-status\b/.test(css) ||
      /@layer\b|@theme\b|--tw-/.test(css);
    const next = skipPurge
      ? css
      : await purgeRaw(css, [{ raw: contentHtml, extension: "html" }]);
    after += next.length;
    const start = match.index + offset;
    const replacement = `<style${attrs}>${next}</style>`;
    out = out.slice(0, start) + replacement + out.slice(start + full.length);
    offset += replacement.length - full.length;
  }

  if (out !== html) await writeFile(file, out);
  return { file, before, after };
}

async function purgeExternalCss(file, contentFiles) {
  const css = await readFile(file, "utf8");
  const before = css.length;
  const content = [];
  for (const c of contentFiles) {
    content.push({
      raw: await readFile(c, "utf8"),
      extension: path.extname(c).slice(1) || "html",
    });
  }
  const purged = await purgeRaw(css, content);
  if (purged !== css) await writeFile(file, purged);
  return { file, before, after: purged.length };
}

const htmlFiles = await walk(DIST, (f) => f.endsWith(".html"));
const cssFiles = await walk(DIST, (f) => f.endsWith(".css"));
const jsContent = await walk(DIST, (f) => f.endsWith(".js"));

const results = [];
for (const file of htmlFiles) results.push(await purgeHtmlFile(file));

const externalContent = [...htmlFiles, ...jsContent];
for (const file of cssFiles) results.push(await purgeExternalCss(file, externalContent));

const before = results.reduce((n, r) => n + r.before, 0);
const after = results.reduce((n, r) => n + r.after, 0);
const saved = before - after;

console.log(
  `[purge-css] ${results.filter((r) => r.before).length} file(s): ${before} → ${after} chars` +
    (saved > 0 ? ` (−${saved}, ${Math.round((saved / before) * 100)}%)` : " (no change)"),
);

const notable = results
  .filter((r) => r.before > 0 && r.before !== r.after)
  .sort((a, b) => b.before - a.before)
  .slice(0, 12);
for (const r of notable) {
  console.log(
    `  ${path.relative(DIST, r.file)}: ${r.before} → ${r.after}` +
      (r.before > r.after ? ` (−${r.before - r.after})` : ""),
  );
}
