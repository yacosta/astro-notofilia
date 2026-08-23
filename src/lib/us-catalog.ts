import { compareByFirstYear } from './catalog-year';

export const US_MONEDA_COLONIAL = 'Moneda Colonial';
export const US_MONEDA_COLONIAL_EN = 'Colonial Currency';
export const US_BILLETE_OBSOLETO = 'BILLETE OBSOLETO';
export const US_BILLETE_OBSOLETO_EN = 'OBSOLETE NOTES';
export const US_UNITED_STATES_NOTES = 'United States Notes';
export const US_GOLD_CERTIFICATES = 'Gold Certificates';
export const US_SILVER_CERTIFICATES = 'Silver Certificates';
export const US_NATIONAL_BANKNOTES = 'National Banknotes';
export const US_FEDERAL_RESERVE = 'Federal Reserve Bank';
export const US_FOOD_COUPONS = 'Food Coupons USDA';
export const US_MPC = 'Military Payment Certificates (MPC)';
export const US_POP_ART = 'Pop Art';
export const US_TEST_NOTE = 'Nota de Prueba';
export const US_TEST_NOTE_EN = 'Test Note';
export const US_OTHER = 'Otras piezas';
export const US_OTHER_EN = 'Other pieces';

/** Catalog order on /coleccion/estados-unidos/. */
export const US_GROUP_ORDER = [
  US_MONEDA_COLONIAL,
  US_BILLETE_OBSOLETO,
  US_UNITED_STATES_NOTES,
  US_GOLD_CERTIFICATES,
  US_SILVER_CERTIFICATES,
  US_NATIONAL_BANKNOTES,
  US_FEDERAL_RESERVE,
  US_FOOD_COUPONS,
  US_MPC,
  US_POP_ART,
  US_TEST_NOTE,
  US_OTHER,
] as const;

export type UsCatalogGroup = (typeof US_GROUP_ORDER)[number];

export const US_GROUP_EN: Record<UsCatalogGroup, string> = {
  [US_MONEDA_COLONIAL]: US_MONEDA_COLONIAL_EN,
  [US_BILLETE_OBSOLETO]: US_BILLETE_OBSOLETO_EN,
  [US_UNITED_STATES_NOTES]: US_UNITED_STATES_NOTES,
  [US_GOLD_CERTIFICATES]: US_GOLD_CERTIFICATES,
  [US_SILVER_CERTIFICATES]: US_SILVER_CERTIFICATES,
  [US_NATIONAL_BANKNOTES]: US_NATIONAL_BANKNOTES,
  [US_FEDERAL_RESERVE]: US_FEDERAL_RESERVE,
  [US_FOOD_COUPONS]: US_FOOD_COUPONS,
  [US_MPC]: US_MPC,
  [US_POP_ART]: US_POP_ART,
  [US_TEST_NOTE]: US_TEST_NOTE_EN,
  [US_OTHER]: US_OTHER_EN,
};

export const US_GROUP_IDS: Record<UsCatalogGroup, string> = {
  [US_MONEDA_COLONIAL]: 'moneda-colonial',
  [US_BILLETE_OBSOLETO]: 'billete-obsoleto',
  [US_UNITED_STATES_NOTES]: 'united-states-notes',
  [US_GOLD_CERTIFICATES]: 'gold-certificates',
  [US_SILVER_CERTIFICATES]: 'silver-certificates',
  [US_NATIONAL_BANKNOTES]: 'national-banknotes',
  [US_FEDERAL_RESERVE]: 'federal-reserve-bank',
  [US_FOOD_COUPONS]: 'food-coupons-usda',
  [US_MPC]: 'military-payment-certificates',
  [US_POP_ART]: 'pop-art',
  [US_TEST_NOTE]: 'nota-de-prueba',
  [US_OTHER]: 'otras-piezas',
};

/** Visual break before this group (after federal paper). */
export const US_BREAK_BEFORE: ReadonlySet<string> = new Set([US_FOOD_COUPONS]);

export type UsCatalogItem = {
  path: string;
  title: string;
  year?: number | null;
  role?: string;
  kind?: string;
};

function rankOf(order: readonly string[], name: string): number {
  const index = order.indexOf(name);
  return index === -1 ? order.length : index;
}

/** Dollar-cent rank from a slug (50-centavos → 50, 10-dolares → 1000). */
export function denominationCentRank(path: string): number {
  const slug = path.toLowerCase();
  const cents = slug.match(/(\d+)-centavos?/);
  if (cents) return Number(cents[1]);
  const dollars = slug.match(/(\d+)-dolar(?:es)?/);
  if (dollars) return Number(dollars[1]) * 100;
  return 99_999;
}

function mpcSeriesRank(path: string): number {
  const match = path.toLowerCase().match(/serie-(\d+)/);
  return match ? Number(match[1]) : 99_999;
}

const OBSOLETE_NEEDLES = [
  'adrian-insurance',
  'citizens-bank-of-louisiana',
  'city-bank-new-haven',
  'hagerstown-bank',
  'state-bank-new-brunswick',
  'billete-obsoleto',
] as const;

export function usCatalogGroupFor(item: Pick<UsCatalogItem, 'path'>): UsCatalogGroup {
  const path = item.path.toLowerCase();

  if (path.includes('/pop-art/')) return US_POP_ART;
  if (path.includes('giori-press') || path.includes('nota-de-prueba') || path.includes('test-note')) {
    return US_TEST_NOTE;
  }
  if (path.includes('food-coupon') || path.includes('food-coupons-usda')) return US_FOOD_COUPONS;
  if (path.includes('certificados-de-pago-militar') || path.includes('/mpc')) return US_MPC;
  if (path.includes('/moneda-colonial/')) return US_MONEDA_COLONIAL;
  if (OBSOLETE_NEEDLES.some((needle) => path.includes(needle))) return US_BILLETE_OBSOLETO;
  if (path.includes('sello-rojo') || path.includes('united-states-note')) return US_UNITED_STATES_NOTES;
  if (path.includes('certificado-de-oro') || path.includes('gold-certificate')) return US_GOLD_CERTIFICATES;
  if (
    path.includes('certificado-de-plata') ||
    path.includes('norte-africa') ||
    path.includes('silver-certificate')
  ) {
    return US_SILVER_CERTIFICATES;
  }
  if (path.includes('national-bank') || path.includes('billete-nacional')) return US_NATIONAL_BANKNOTES;
  if (
    path.includes('reserva-federal') ||
    path.includes('federal-reserve') ||
    path.includes('diez-dolares-1934') ||
    path.includes('veinte-dolares-hawaii') ||
    path.includes('cien-dolares-minneapolis')
  ) {
    return US_FEDERAL_RESERVE;
  }

  return US_OTHER;
}

export function compareUsCatalogItems(a: UsCatalogItem, b: UsCatalogItem): number {
  const groupA = usCatalogGroupFor(a);
  const groupB = usCatalogGroupFor(b);
  const groupDelta = rankOf(US_GROUP_ORDER, groupA) - rankOf(US_GROUP_ORDER, groupB);
  if (groupDelta) return groupDelta;

  if (groupA === US_FOOD_COUPONS) {
    const yearDelta = compareByFirstYear(a, b);
    if (yearDelta) return yearDelta;
    const denomDelta = denominationCentRank(a.path) - denominationCentRank(b.path);
    if (denomDelta) return denomDelta;
  }

  if (groupA === US_MPC) {
    const seriesDelta = mpcSeriesRank(a.path) - mpcSeriesRank(b.path);
    if (seriesDelta) return seriesDelta;
    const denomDelta = denominationCentRank(a.path) - denominationCentRank(b.path);
    if (denomDelta) return denomDelta;
  }

  return compareByFirstYear(a, b) || a.title.localeCompare(b.title, 'es');
}

/** Portrait pages that must never appear on /coleccion/estados-unidos/. */
export const US_CATALOG_BIOGRAPHY_PATHS = [
  '/coleccion/moneda-colonial/perfil-alexander-hamilton/',
  '/coleccion/moneda-colonial/perfil-andrew-jackson/',
  '/coleccion/moneda-colonial/perfil-benjamin-franklin/',
  '/coleccion/moneda-colonial/perfil-george-washington/',
  '/coleccion/moneda-colonial/perfil-thomas-jefferson/',
  '/coleccion/certificados-de-pago-militar/perfil-jefe-ouray/',
  '/coleccion/polimero-mundial/perfil-malietoa-tanumafili-ii/',
  '/coleccion/polimero-mundial/perfil-manuel-rodriguez/',
] as const;

const US_CATALOG_BIOGRAPHY_TITLES = new Set([
  'alexander hamilton',
  'andrew jackson',
  'benjamin franklin',
  'george washington',
  'thomas jefferson',
  'jefe ouray',
  'malietoa tanumafili ii',
  'manuel rodríguez erdoíza',
  'manuel rodriguez erdoiza',
]);

export function isCatalogBiography(
  item: Pick<UsCatalogItem, 'role' | 'kind' | 'path'> & { title?: string },
): boolean {
  if (item.role === 'profile' || item.kind === 'profile') return true;
  if (/\/perfil-/.test(item.path)) return true;
  if (US_CATALOG_BIOGRAPHY_PATHS.includes(item.path as (typeof US_CATALOG_BIOGRAPHY_PATHS)[number])) {
    return true;
  }
  const title = item.title?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return Boolean(title && US_CATALOG_BIOGRAPHY_TITLES.has(title));
}

export function groupUsCatalogItems<T extends UsCatalogItem>(items: T[]): Array<{
  group: UsCatalogGroup;
  id: string;
  titleEn: string;
  breakBefore: boolean;
  items: T[];
}> {
  const buckets = new Map<UsCatalogGroup, T[]>();
  for (const group of US_GROUP_ORDER) buckets.set(group, []);
  for (const item of items) {
    const group = usCatalogGroupFor(item);
    buckets.get(group)!.push(item);
  }

  return US_GROUP_ORDER.flatMap((group) => {
    const grouped = [...buckets.get(group)!].sort(compareUsCatalogItems);
    if (grouped.length === 0) return [];
    return [
      {
        group,
        id: US_GROUP_IDS[group],
        titleEn: US_GROUP_EN[group],
        breakBefore: US_BREAK_BEFORE.has(group),
        items: grouped,
      },
    ];
  });
}
