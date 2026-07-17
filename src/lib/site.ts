/**
 * Canonical site origin — keep in sync with `site` in astro.config.mjs.
 */
export const SITE = 'https://www.notofilia.com';

/** Site-wide keyword terms always included in <meta name="keywords">. */
export const BASE_KEYWORDS = [
  'notafilia',
  'numismática',
  'billetes antiguos',
  'billetes de colección',
  'colección de billetes',
  'papel moneda',
  'monedas antiguas',
  'monedas de colección',
  'billetes de colombia',
  'billetes colombianos',
  'notafilia colombia',
  'numismática colombia',
];

/** Merge page-specific keywords with site-wide terms (deduped, page terms first). */
export function keywordsContent(pageKeywords?: string[]): string {
  return [...new Set([...(pageKeywords ?? []), ...BASE_KEYWORDS])].join(', ');
}

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return SITE + (path.startsWith('/') ? path : `/${path}`);
}
