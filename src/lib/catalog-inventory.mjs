/**
 * Shared catalog inventory helpers (plain JS so prebuild scripts can import
 * them without TypeScript loader flags).
 *
 * Role vocabulary:
 * - ficha: a catalog entry for a collected piece (not a hub or profile)
 * - billete: an individual note; one ficha may document several
 * - moneda: an individual coin ficha
 * - página: an indexed catalog URL (ficha, hub, or profile)
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const POLYMER_COUNTRY = {
  bangladesh: 'Bangladesh',
  brazil: 'Brasil',
  brasil: 'Brasil',
  brunei: 'Brunéi',
  bulgaria: 'Bulgaria',
  catar: 'Catar',
  chile: 'Chile',
  china: 'China',
  'costa-rica': 'Costa Rica',
  guatemala: 'Guatemala',
  haiti: 'Haití',
  honduras: 'Honduras',
  'hong-kong': 'Hong Kong',
  'islas-salomon': 'Islas Salomón',
  kazajistan: 'Kazajistán',
  malasia: 'Malasia',
  mexico: 'México',
  mozambique: 'Mozambique',
  nepal: 'Nepal',
  nicaragua: 'Nicaragua',
  nigeria: 'Nigeria',
  oman: 'Omán',
  'papua-nueva-guinea': 'Papúa Nueva Guinea',
  'republica-dominicana': 'República Dominicana',
  rumania: 'Rumania',
  samoa: 'Samoa',
  'sri-lanka': 'Sri Lanka',
  suazilandia: 'Suazilandia',
  taiwan: 'Taiwán',
  zambia: 'Zambia',
};

export const POLYMER_COUNTRY_EN = {
  bangladesh: 'Bangladesh',
  brazil: 'Brazil',
  brasil: 'Brazil',
  brunei: 'Brunei',
  bulgaria: 'Bulgaria',
  catar: 'Qatar',
  chile: 'Chile',
  china: 'China',
  'costa-rica': 'Costa Rica',
  guatemala: 'Guatemala',
  haiti: 'Haiti',
  honduras: 'Honduras',
  'hong-kong': 'Hong Kong',
  'islas-salomon': 'Solomon Islands',
  kazajistan: 'Kazakhstan',
  malasia: 'Malaysia',
  mexico: 'Mexico',
  mozambique: 'Mozambique',
  nepal: 'Nepal',
  nicaragua: 'Nicaragua',
  nigeria: 'Nigeria',
  oman: 'Oman',
  'papua-nueva-guinea': 'Papua New Guinea',
  'republica-dominicana': 'Dominican Republic',
  rumania: 'Romania',
  samoa: 'Samoa',
  'sri-lanka': 'Sri Lanka',
  suazilandia: 'Eswatini',
  taiwan: 'Taiwan',
  zambia: 'Zambia',
};

const POLYMER_COUNTRY_KEYS = Object.keys(POLYMER_COUNTRY).sort((a, b) => b.length - a.length);

/** Resolve a polymer ficha slug (e.g. nepal-10-rupias-2005) to ES/EN country labels. */
export function polymerCountryLabels(slug = '') {
  for (const key of POLYMER_COUNTRY_KEYS) {
    if (slug === key || slug.startsWith(`${key}-`)) {
      return { es: POLYMER_COUNTRY[key], en: POLYMER_COUNTRY_EN[key] ?? POLYMER_COUNTRY[key] };
    }
  }
  return null;
}

export const HUB_PATHS = new Set([
  '/coleccion/billete-obsoleto-estados-unidos/',
  '/coleccion/reserva-federal/',
  '/coleccion/departamento-del-tesoro-de-ee-uu/',
  '/coleccion/moneda-colonial/',
  '/coleccion/colombia/',
  '/coleccion/colombia/banca-libre/',
  '/coleccion/colombia/emisiones-en-el-extranjero/',
  '/coleccion/estados-unidos/',
  '/coleccion/espana/',
  '/coleccion/puerto-rico/',
  '/coleccion/ecuador/',
  '/coleccion/filipinas/',
  '/coleccion/moneda-colonial-espanola/',
  '/coleccion/numismatica/',
  '/coleccion/polimero-mundial/',
  '/coleccion/pop-art/',
  '/coleccion/certificados-de-pago-militar/',
  '/coleccion/emisiones-promocionales/',
  '/coleccion/food-coupons-usda/',
]);

export const INVENTORY_VOCABULARY_ES =
  'Una ficha es la entrada de catálogo; un billete es cada ejemplar documentado (una ficha puede reunir varios); una página es la URL indexada.';

export const INVENTORY_VOCABULARY_EN =
  'A ficha is the catalog entry; a banknote is each documented specimen (one ficha may hold several); a page is the indexed URL.';

export function isCatalogHub(catalogPath = '', ogType = '') {
  return ogType === 'website' || HUB_PATHS.has(catalogPath);
}

export function isCatalogProfile(catalogPath = '', ogType = '') {
  return catalogPath.includes('/perfil-') || ogType === 'profile';
}

export function catalogRole(catalogPath = '', ogType = '') {
  if (isCatalogHub(catalogPath, ogType)) return 'hub';
  if (isCatalogProfile(catalogPath, ogType)) return 'profile';
  return 'piece';
}

export function normalizeCatalogCountry(raw, catalogPath) {
  const segs = String(catalogPath || '')
    .split('/')
    .filter(Boolean);
  const section = segs[1] || '';
  if (section === 'colombia') return 'Colombia';
  if (section === 'puerto-rico') return 'Puerto Rico';
  if (section === 'ecuador') return 'Ecuador';
  if (section === 'filipinas') return 'Filipinas';
  if (section === 'moneda-colonial-espanola') return 'España';
  if (section === 'polimero-mundial') {
    const labels = polymerCountryLabels(segs[2] || '');
    if (labels) return labels.es;
  }
  if (
    [
      'certificados-de-pago-militar',
      'reserva-federal',
      'departamento-del-tesoro-de-ee-uu',
      'moneda-colonial',
      'emisiones-promocionales',
      'food-coupons-usda',
      'pop-art',
      'billete-obsoleto-estados-unidos',
    ].includes(section)
  ) {
    return 'Estados Unidos';
  }

  const text = String(raw || '').trim();
  const lower = text.toLowerCase();
  if (
    lower.includes('estados unidos de colombia') ||
    lower.includes('estados unidos de nueva granada') ||
    lower.includes('nueva granada') ||
    lower.startsWith('colombia') ||
    lower.includes('república de colombia')
  ) {
    return 'Colombia';
  }
  if (lower.includes('estados unidos') || lower.includes('ee. uu') || lower.includes('ee uu')) {
    return 'Estados Unidos';
  }
  if (lower.includes('puerto rico')) return 'Puerto Rico';
  if (lower.includes('ecuador')) return 'Ecuador';
  if (lower.includes('filipinas') || lower.includes('philippines')) return 'Filipinas';
  if (lower.includes('guatemala')) return 'Guatemala';
  if (lower.includes('panamá') || lower.includes('panama')) return 'Panamá';
  if (lower.includes('españa')) return 'España';

  if (segs.length >= 2 && !HUB_PATHS.has(catalogPath)) return 'Estados Unidos';
  return text || 'Otros';
}

export function isCoinEntry(catalogPath = '', recordKind = '') {
  if (recordKind === 'coin') return true;
  return (
    String(catalogPath).startsWith('/coleccion/moneda-colonial-espanola/') &&
    !HUB_PATHS.has(catalogPath)
  );
}

function jsonLdNodes(jsonLd) {
  if (!jsonLd || typeof jsonLd !== 'object') return [];
  if (Array.isArray(jsonLd['@graph'])) return jsonLd['@graph'];
  if (Array.isArray(jsonLd)) return jsonLd;
  return [jsonLd];
}

/**
 * Count individual notes documented on one ficha.
 * Prefer unique lightbox triggers; then sc-for placeholders; then extra CreativeWork nodes.
 */
export function countNotesInEntry(entry) {
  const template = String(entry?.template || '');
  const zooms = new Set(
    [...template.matchAll(/data-zoom-trigger=["']([^"']+)["']/g)].map((match) => match[1]),
  );
  if (zooms.size > 0) return zooms.size;

  const placeholders = [...template.matchAll(/hint-placeholder-count=["'](\d+)["']/g)].map((match) =>
    Number(match[1]),
  );
  if (placeholders.length > 0) return Math.max(...placeholders.filter((n) => Number.isFinite(n) && n > 0));

  const works = jsonLdNodes(entry?.jsonLd).filter((node) => node && node['@type'] === 'CreativeWork');
  if (works.length > 1) return works.length;

  return 1;
}

export function computeInventoryStats(entries) {
  const countries = new Set();
  let fichas = 0;
  let billetes = 0;
  let monedas = 0;
  let paginas = 0;

  for (const entry of entries) {
    const catalogPath = entry?.path;
    if (!catalogPath) continue;
    paginas += 1;
    const role = catalogRole(catalogPath, entry.ogType);
    if (role !== 'piece') continue;
    fichas += 1;
    const country = normalizeCatalogCountry(entry.record?.country, catalogPath);
    if (country && country !== 'Otros') countries.add(country);
    if (isCoinEntry(catalogPath, entry.record?.kind)) {
      monedas += 1;
    } else {
      billetes += countNotesInEntry(entry);
    }
  }

  return {
    billetes,
    monedas,
    paises: countries.size,
    fichas,
    paginas,
  };
}

export function loadCatalogEntriesFromDisk(catalogDir = path.join(process.cwd(), 'src/content/catalog')) {
  const files = readdirSync(catalogDir)
    .filter((file) => file.endsWith('.json'))
    .sort();
  const entries = [];
  for (const file of files) {
    let data;
    try {
      data = JSON.parse(readFileSync(path.join(catalogDir, file), 'utf8'));
    } catch {
      continue;
    }
    if (!data.path) continue;
    entries.push({
      path: data.path,
      title: data.title,
      ogType: data.ogType,
      template: data.template,
      jsonLd: data.jsonLd,
      record: data.record,
      keywords: data.keywords,
    });
  }
  return entries;
}

export function getCollectionStatsFromDisk(catalogDir) {
  return computeInventoryStats(loadCatalogEntriesFromDisk(catalogDir));
}
