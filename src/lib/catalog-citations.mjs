/**
 * Catalog citation audit — primary vs commercial floor for re-sourced fichas.
 * Plain JS so prebuild / CI scripts can import it without a TypeScript loader.
 */
export const UNCONFIRMED_VALUE = 'no confirmado';

export const CATALOG_SOURCE_KINDS = [
  'central_bank',
  'printer',
  'museum',
  'auction',
  'catalog',
  'press',
  'specimen',
  'retail',
  'secondary',
];

/** Dealer / shop product pages — last resort, never a majority on a re-sourced ficha. */
export const RETAIL_SOURCE_KINDS = new Set(['retail']);

/** Banks, printers, museums, and the specimen itself. */
export const PRIMARY_SOURCE_KINDS = new Set(['central_bank', 'printer', 'museum', 'specimen']);

export const HONESTY_FIELDS = [
  ['printRun', 'Tirada'],
  ['knownVarieties', 'Variedades conocidas'],
  ['circulationDates', 'Fechas de circulación'],
  ['rarityBasis', 'Base de la rareza'],
  ['shownSpecimenState', 'Estado del ejemplar mostrado'],
  ['factualReviewDate', 'Fecha de última revisión factual'],
];

export const RETAIL_HOSTS = [
  'banknoteworld.com',
  'www.banknoteworld.com',
  'banknote.ws',
  'www.banknote.ws',
  'polymernotes.com',
  'www.polymernotes.com',
];

export function hostFromUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function isRetailHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return RETAIL_HOSTS.some((known) => host === known || host.endsWith(`.${known}`));
}

export function countRetailMentions(html) {
  const text = String(html || '').toLowerCase();
  let count = 0;
  for (const host of RETAIL_HOSTS) {
    const needle = host.replace(/^www\./, '');
    const matches = text.match(new RegExp(needle.replace(/\./g, '\\.'), 'g'));
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * @param {object} record
 * @param {string} [template]
 * @returns {{
 *   resourced: boolean,
 *   total: number,
 *   retail: number,
 *   primary: number,
 *   retailShare: number | null,
 *   primaryShare: number | null,
 *   errors: string[],
 * }}
 */
export function auditCatalogCitations(record, template = '') {
  const errors = [];
  const resourced = record?.resourced === true;
  const sources = Array.isArray(record?.sources) ? record.sources : [];
  const total = sources.length;
  const retail = sources.filter((s) => RETAIL_SOURCE_KINDS.has(s.kind)).length;
  const primary = sources.filter((s) => PRIMARY_SOURCE_KINDS.has(s.kind)).length;
  const retailShare = total > 0 ? retail / total : null;
  const primaryShare = total > 0 ? primary / total : null;

  if (!resourced) {
    return { resourced, total, retail, primary, retailShare, primaryShare, errors };
  }

  if (total === 0) {
    errors.push('re-sourced ficha has no sources[]');
  }

  sources.forEach((source, index) => {
    if (!source?.kind) {
      errors.push(`source ${index + 1} (${source?.label || 'sin etiqueta'}) lacks kind`);
    } else if (!CATALOG_SOURCE_KINDS.includes(source.kind)) {
      errors.push(`source ${index + 1} has unknown kind "${source.kind}"`);
    }
  });

  if (total > 0 && retail * 2 > total) {
    errors.push(
      `retail citations are a majority (${retail}/${total}); floor is less than half from retail sites`,
    );
  }

  const meta = record.metadata ?? {};
  for (const [key, label] of HONESTY_FIELDS) {
    const value = typeof meta[key] === 'string' ? meta[key].trim() : '';
    if (!value) {
      errors.push(`honesty field "${label}" (${key}) is missing; use "${UNCONFIRMED_VALUE}" if unknown`);
    }
  }

  const retailInTemplate = countRetailMentions(template);
  const retailInSources = sources.filter((s) => s.url && isRetailHost(hostFromUrl(s.url))).length;
  if (retailInTemplate > 0 && retailInSources === 0 && retail === 0) {
    errors.push(
      `template still names a retail host (${retailInTemplate} mention(s)) but sources[] has no retail citation`,
    );
  }

  return { resourced, total, retail, primary, retailShare, primaryShare, errors };
}
