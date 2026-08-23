/**
 * Canonical site origin — keep in sync with `site` in astro.config.mjs.
 */
export const SITE = 'https://notofilia.com';

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return SITE + (path.startsWith('/') ? path : `/${path}`);
}
