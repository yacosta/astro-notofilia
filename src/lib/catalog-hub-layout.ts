/** Marker for injecting the Astro hub card grid inside a catalog template. */
export const CATALOG_HUB_GRID_MARKER = '<!--catalog-hub-grid-->';

export function splitCatalogHubTemplate(
  html: string,
  options?: { fallbackIntoMain?: boolean },
): { before: string; after: string } | null {
  const marked = html.indexOf(CATALOG_HUB_GRID_MARKER);
  if (marked !== -1) {
    return {
      before: html.slice(0, marked),
      after: html.slice(marked + CATALOG_HUB_GRID_MARKER.length),
    };
  }
  if (!options?.fallbackIntoMain) return null;
  const mainClose = html.lastIndexOf('</main>');
  if (mainClose === -1) return null;
  return {
    before: html.slice(0, mainClose),
    after: html.slice(mainClose),
  };
}
