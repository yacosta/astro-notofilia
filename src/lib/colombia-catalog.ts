import { firstYear, compareByFirstYear } from './catalog-year';
import type { CatalogCard } from './catalog-record';

export const COLOMBIA_SIGLO_PASADO = 'Billetes del Siglo Pasado';
export const COLOMBIA_SIGLO_PASADO_EN = 'Banknotes of the Last Century';
export const COLOMBIA_DEUDA = 'Deuda Pública Estatal';
export const COLOMBIA_DEUDA_EN = 'State Public Debt';
export const COLOMBIA_BANREP = 'Billetes del Banco de la República (Desde 1923)';
export const COLOMBIA_BANREP_EN = 'Banco de la República Banknotes (From 1923)';

export const COLOMBIA_SECTION_ORDER = [
  COLOMBIA_SIGLO_PASADO,
  COLOMBIA_DEUDA,
  COLOMBIA_BANREP,
] as const;

export const COLOMBIA_SIGLO_PASADO_GROUPS = [
  'Catálogo de Billetes de Colombia',
  'Estados Unidos de Nueva Granada (1861)',
  'Estados Unidos de Colombia',
  'Estados soberanos (1882)',
  'Banca Libre',
  'El Banco Nacional',
  'República de Colombia',
] as const;

export const COLOMBIA_DEUDA_GROUPS = ['Bonos y Libranzas Fiscales'] as const;

/** Denomination headings in catalog order. Empty headings are omitted at render time. */
export const COLOMBIA_BANREP_GROUPS = [
  '1/2 Peso',
  '1 Peso',
  '2 Pesos',
  '5 Pesos',
  '10 Pesos',
  '20 Pesos',
  '50 Pesos',
  '100 Pesos',
  '200 Pesos',
  '500 Pesos',
  '1000 Pesos',
  '2000 Pesos',
  '5000 Pesos',
  '10000 Pesos',
  '20000 Pesos',
  '50000 Pesos',
  '100000 Pesos',
] as const;

const BANCA_LIBRE_SUBGROUPS = [
  'El Banco Hipotecario',
  'El Banco de Rio Hacha',
  'El Banco del Cauca',
  'El Banco de Medellín',
  'El Banco de Pamplona',
  'El Banco del Norte',
  'El Banco de la Unión',
  'El Banco Internacional',
  'Vicente B. Villa é Hijos',
  'El Banco Unión',
  'El Banco de Panamá',
  'El Banco de Oriente',
  'Banco de Antioquia',
  'El Banco de Barranquilla',
  'El Banco de Caldas',
  'El Banco de Colombia',
  'Departamento de Antioquia',
] as const;

const BANCA_LIBRE_MATCHERS: ReadonlyArray<{
  needle: string;
  subgroup: (typeof BANCA_LIBRE_SUBGROUPS)[number];
}> = [
  { needle: 'banco-hipotecario', subgroup: 'El Banco Hipotecario' },
  { needle: 'banco-de-rio-hacha', subgroup: 'El Banco de Rio Hacha' },
  { needle: 'banco-del-cauca', subgroup: 'El Banco del Cauca' },
  { needle: 'banco-de-medellin', subgroup: 'El Banco de Medellín' },
  { needle: 'banco-de-pamplona', subgroup: 'El Banco de Pamplona' },
  { needle: 'banco-del-norte', subgroup: 'El Banco del Norte' },
  { needle: 'banco-de-la-union', subgroup: 'El Banco de la Unión' },
  { needle: 'banco-internacional', subgroup: 'El Banco Internacional' },
  { needle: 'vicente-villa', subgroup: 'Vicente B. Villa é Hijos' },
  { needle: 'banco-union-cartagena', subgroup: 'El Banco Unión' },
  { needle: 'banco-de-panama', subgroup: 'El Banco de Panamá' },
  { needle: 'banco-de-oriente', subgroup: 'El Banco de Oriente' },
  { needle: 'banco-de-antioquia', subgroup: 'Banco de Antioquia' },
  { needle: 'banco-de-barranquilla', subgroup: 'El Banco de Barranquilla' },
  { needle: 'banco-de-caldas', subgroup: 'El Banco de Caldas' },
  { needle: 'banco-de-colombia', subgroup: 'El Banco de Colombia' },
  { needle: 'departamento-de-antioquia', subgroup: 'Departamento de Antioquia' },
];

export type ColombiaPeriod = {
  section: string;
  sectionEn: string;
  sectionKicker: string;
  sectionKickerEn: string;
  group: string;
  groupEn: string;
  groupKicker?: string;
  groupKickerEn?: string;
  subgroup?: string;
  subgroupEn?: string;
};

const SIGLO_PASADO_FIELDS = {
  section: COLOMBIA_SIGLO_PASADO,
  sectionEn: COLOMBIA_SIGLO_PASADO_EN,
  sectionKicker: 'Antes del Banco de la República',
  sectionKickerEn: 'Before Banco de la República',
} as const;

function bancaLibreBank(
  subgroup: (typeof BANCA_LIBRE_SUBGROUPS)[number],
): ColombiaPeriod {
  return {
    ...SIGLO_PASADO_FIELDS,
    group: 'Banca Libre',
    groupEn: 'Free Banking',
    groupKicker: 'Banca privada regional',
    groupKickerEn: 'Regional private banking',
    subgroup,
    subgroupEn: subgroup,
  };
}

const DEUDA_FIELDS = {
  section: COLOMBIA_DEUDA,
  sectionEn: COLOMBIA_DEUDA_EN,
  sectionKicker: 'Títulos fiscales',
  sectionKickerEn: 'Fiscal paper',
} as const;

const BANREP_FIELDS = {
  section: COLOMBIA_BANREP,
  sectionEn: COLOMBIA_BANREP_EN,
  sectionKicker: 'Banca centralizada',
  sectionKickerEn: 'Central banking',
} as const;

function rankOf(order: readonly string[], name: string | undefined): number {
  if (!name) return order.length;
  const index = order.indexOf(name);
  return index === -1 ? order.length : index;
}

/** Banco de la República notes (1923–present), including modern error fichas. */
export function isColombiaBanRepCatalogPath(href: string): boolean {
  const path = href.toLowerCase();
  if (path.includes('banco-de-la-republica')) return true;
  return (
    path.includes('2000-pesos-1996-error-mariposa') ||
    path.includes('2000-pesos-error-mariposa') ||
    path.includes('2000-pesos-error-corte')
  );
}

/** Pre-1923 Colombian paper (independence, states, free banking, foreign issues). */
export function isColombiaSigloPasadoCatalogPath(href: string): boolean {
  const path = href.toLowerCase();
  if (!path.includes('/colombia/')) return false;
  if (
    path === '/coleccion/colombia/' ||
    path === '/en/collection/colombia/' ||
    path.includes('/colombia/banca-libre/') ||
    path.includes('/colombia/emisiones-en-el-extranjero/') ||
    path.includes('/colombia/siglo-pasado/') ||
    path.includes('/colombia/last-century/') ||
    path.includes('/colombia/banco-de-la-republica/')
  ) {
    return false;
  }
  if (path.includes('/perfil-')) return false;
  if (path.includes('santa-marta') || path.includes('1-4-real')) return false;
  return !isColombiaBanRepCatalogPath(path);
}

/** Match BanRep denomination headings from the Spanish hub href. */
export function banrepDenominationFor(href: string): (typeof COLOMBIA_BANREP_GROUPS)[number] | null {
  const path = href.toLowerCase();
  if (path.includes('100000-pesos') || path.includes('100-mil-pesos')) return '100000 Pesos';
  if (path.includes('50000-pesos') || path.includes('50-mil-pesos')) return '50000 Pesos';
  if (path.includes('20000-pesos')) return '20000 Pesos';
  if (path.includes('10000-pesos')) return '10000 Pesos';
  if (path.includes('5000-pesos')) return '5000 Pesos';
  if (
    path.includes('2000-pesos') ||
    path.includes('error-mariposa') ||
    path.includes('error-corte')
  ) {
    return '2000 Pesos';
  }
  if (path.includes('1000-pesos')) return '1000 Pesos';
  if (path.includes('500-pesos')) return '500 Pesos';
  if (path.includes('200-pesos')) return '200 Pesos';
  if (path.includes('100-pesos')) return '100 Pesos';
  if (path.includes('50-pesos')) return '50 Pesos';
  if (path.includes('20-pesos')) return '20 Pesos';
  if (path.includes('10-pesos')) return '10 Pesos';
  if (path.includes('5-pesos')) return '5 Pesos';
  if (path.includes('2-pesos')) return '2 Pesos';
  if (path.includes('1-peso')) return '1 Peso';
  if (path.includes('medio-peso')) return '1/2 Peso';
  return null;
}

function bancaLibrePeriodFor(href: string): ColombiaPeriod | null {
  for (const { needle, subgroup } of BANCA_LIBRE_MATCHERS) {
    if (href.includes(needle)) return bancaLibreBank(subgroup);
  }
  return null;
}

/** Catalog sections for /coleccion/colombia/. */
export function colombiaPeriodFor(card: Pick<CatalogCard, 'href' | 'year'>): ColombiaPeriod {
  const href = card.href;
  const bancaLibre = bancaLibrePeriodFor(href);
  if (bancaLibre) return bancaLibre;

  if (href.includes('cartagena-1-real') || firstYear(card.year) === 1813) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Catálogo de Billetes de Colombia',
      groupEn: 'Colombia Banknote Catalog',
      groupKicker: 'Guerra de Independencia',
      groupKickerEn: 'War of Independence',
    };
  }
  if (href.includes('nueva-granada') || href.includes('new-granada')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Estados Unidos de Nueva Granada (1861)',
      groupEn: 'United States of New Granada (1861)',
      groupKicker: 'Guerra Civil de 1860–1862',
      groupKickerEn: 'Civil War of 1860–1862',
    };
  }
  if (href.includes('estado-soberano-panama') || href.includes('estado-soberano-cundinamarca')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Estados Unidos de Colombia',
      groupEn: 'United States of Colombia',
      groupKicker: 'Emisiones de los estados soberanos',
      groupKickerEn: 'Sovereign-state issues',
    };
  }
  if (href.includes('republica-bolivar') || href.includes('estado-soberano-cauca')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Estados soberanos (1882)',
      groupEn: 'Sovereign states (1882)',
      groupKicker: 'Primera República',
      groupKickerEn: 'First Republic',
    };
  }
  if (href.includes('libranza') || href.includes('boyaca')) {
    return {
      ...DEUDA_FIELDS,
      group: 'Bonos y Libranzas Fiscales',
      groupEn: 'Fiscal bonds and warrants',
    };
  }
  if (href.includes('banco-nacional')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'El Banco Nacional',
      groupEn: 'El Banco Nacional',
      groupKicker: 'La Regeneración (1880–1896)',
      groupKickerEn: 'La Regeneración (1880–1896)',
    };
  }
  if (href.includes('republica-1904') || href.includes('republica-1910')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'República de Colombia',
      groupEn: 'Republic of Colombia',
      groupKicker: 'Consolidación nacional',
      groupKickerEn: 'National consolidation',
    };
  }

  const denomination = banrepDenominationFor(href);
  return {
    ...BANREP_FIELDS,
    group: denomination ?? 'El Banco de la República',
    groupEn: denomination ?? 'El Banco de la República',
  };
}

export function withColombiaGroup(card: CatalogCard): CatalogCard {
  const period = colombiaPeriodFor(card);
  return {
    ...card,
    groupKicker: undefined,
    groupKickerEn: undefined,
    subgroup: undefined,
    subgroupEn: undefined,
    ...period,
  };
}

export function compareColombiaCards(
  a: CatalogCard,
  b: CatalogCard,
  indexA = 0,
  indexB = 0,
): number {
  const periodA = colombiaPeriodFor(a);
  const periodB = colombiaPeriodFor(b);
  const sectionDelta =
    rankOf(COLOMBIA_SECTION_ORDER, periodA.section) - rankOf(COLOMBIA_SECTION_ORDER, periodB.section);
  if (sectionDelta) return sectionDelta;

  const groupOrder =
    periodA.section === COLOMBIA_BANREP
      ? COLOMBIA_BANREP_GROUPS
      : periodA.section === COLOMBIA_DEUDA
        ? COLOMBIA_DEUDA_GROUPS
        : COLOMBIA_SIGLO_PASADO_GROUPS;
  const groupDelta = rankOf(groupOrder, periodA.group) - rankOf(groupOrder, periodB.group);
  if (groupDelta) return groupDelta;

  const subgroupDelta =
    rankOf(BANCA_LIBRE_SUBGROUPS, periodA.subgroup) - rankOf(BANCA_LIBRE_SUBGROUPS, periodB.subgroup);
  if (subgroupDelta) return subgroupDelta;

  return compareByFirstYear(a, b) || indexA - indexB;
}

export type BanrepLandingItem = {
  path: string;
  title: string;
  year?: string | number | null;
};

/** Lowest denomination first, then earliest documented year. */
export function compareBanrepLandingItems(a: BanrepLandingItem, b: BanrepLandingItem): number {
  const rankA = rankOf(COLOMBIA_BANREP_GROUPS, banrepDenominationFor(a.path) ?? undefined);
  const rankB = rankOf(COLOMBIA_BANREP_GROUPS, banrepDenominationFor(b.path) ?? undefined);
  if (rankA !== rankB) return rankA - rankB;
  return compareByFirstYear(a, b) || a.title.localeCompare(b.title, 'es');
}

function banrepDenominationId(group: string): string {
  return group
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Denomination sections for /coleccion/colombia/banco-de-la-republica/. */
export function groupBanrepCatalogItems<T extends BanrepLandingItem>(items: T[]): Array<{
  group: string;
  id: string;
  titleEn: string;
  breakBefore: boolean;
  items: T[];
}> {
  const buckets = new Map<string, T[]>();
  for (const group of COLOMBIA_BANREP_GROUPS) buckets.set(group, []);
  const unmatched: T[] = [];

  for (const item of items) {
    const denomination = banrepDenominationFor(item.path);
    if (denomination) buckets.get(denomination)!.push(item);
    else unmatched.push(item);
  }

  const sections: Array<{
    group: string;
    id: string;
    titleEn: string;
    breakBefore: boolean;
    items: T[];
  }> = COLOMBIA_BANREP_GROUPS.flatMap((group) => {
    const grouped = [...buckets.get(group)!].sort(compareBanrepLandingItems);
    if (grouped.length === 0) return [];
    return [
      {
        group,
        id: `banrep-${banrepDenominationId(group)}`,
        titleEn: group,
        breakBefore: false,
        items: grouped,
      },
    ];
  });

  if (unmatched.length) {
    sections.push({
      group: 'Otras piezas',
      id: 'banrep-otras-piezas',
      titleEn: 'Other pieces',
      breakBefore: false,
      items: [...unmatched].sort(compareBanrepLandingItems),
    });
  }

  return sections;
}
