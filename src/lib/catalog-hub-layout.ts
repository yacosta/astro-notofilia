/** Marker for injecting the Astro hub card grid inside a catalog template. */
export const CATALOG_HUB_GRID_MARKER = '<!--catalog-hub-grid-->';

export function splitCatalogHubTemplate(html: string): { before: string; after: string } | null {
  const index = html.indexOf(CATALOG_HUB_GRID_MARKER);
  if (index === -1) return null;
  return {
    before: html.slice(0, index),
    after: html.slice(index + CATALOG_HUB_GRID_MARKER.length),
  };
}
