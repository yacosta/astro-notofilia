import { firstYear, compareByFirstYear } from './catalog-year';
import type { CatalogCard } from './catalog-record';

export const COLOMBIA_SIGLO_PASADO = 'Billetes del Siglo Pasado';
export const COLOMBIA_SIGLO_PASADO_EN = 'Banknotes of the Last Century';
export const COLOMBIA_BANREP = 'Billetes del Banco de la República (Desde 1923)';
export const COLOMBIA_BANREP_EN = 'Banco de la República Banknotes (From 1923)';

export const COLOMBIA_SIGLO_PASADO_GROUPS = [
  'Cartagena de Indias (1811–1815)',
  'Estados Unidos de Nueva Granada (1861)',
  'Estados Unidos de Colombia',
  'Estados soberanos (1882)',
  'Bonos y Libranzas Fiscales',
  'Banca Libre',
  'El Banco Nacional',
  'República de Colombia',
] as const;

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

const BANCA_LIBRE_SUBGROUPS = ['El Banco Hipotecario', 'El Banco de Rio Hacha'] as const;

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

/** Catalog sections for /coleccion/colombia/. */
export function colombiaPeriodFor(card: Pick<CatalogCard, 'href' | 'year'>): ColombiaPeriod {
  const href = card.href;

  if (href.includes('cartagena') || firstYear(card.year) === 1813) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Cartagena de Indias (1811–1815)',
      groupEn: 'Cartagena de Indias (1811–1815)',
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
      ...SIGLO_PASADO_FIELDS,
      group: 'Bonos y Libranzas Fiscales',
      groupEn: 'Fiscal bonds and warrants',
      groupKicker: 'Deuda pública estatal',
      groupKickerEn: 'State public debt',
    };
  }
  if (href.includes('banco-hipotecario')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Banca Libre',
      groupEn: 'Free Banking',
      groupKicker: 'Banca privada regional',
      groupKickerEn: 'Regional private banking',
      subgroup: 'El Banco Hipotecario',
      subgroupEn: 'El Banco Hipotecario',
    };
  }
  if (href.includes('banco-de-rio-hacha')) {
    return {
      ...SIGLO_PASADO_FIELDS,
      group: 'Banca Libre',
      groupEn: 'Free Banking',
      groupKicker: 'Banca privada regional',
      groupKickerEn: 'Regional private banking',
      subgroup: 'El Banco de Rio Hacha',
      subgroupEn: 'El Banco de Rio Hacha',
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
    rankOf([COLOMBIA_SIGLO_PASADO, COLOMBIA_BANREP], periodA.section) -
    rankOf([COLOMBIA_SIGLO_PASADO, COLOMBIA_BANREP], periodB.section);
  if (sectionDelta) return sectionDelta;

  const groupOrder =
    periodA.section === COLOMBIA_BANREP ? COLOMBIA_BANREP_GROUPS : COLOMBIA_SIGLO_PASADO_GROUPS;
  const groupDelta = rankOf(groupOrder, periodA.group) - rankOf(groupOrder, periodB.group);
  if (groupDelta) return groupDelta;

  const subgroupDelta =
    rankOf(BANCA_LIBRE_SUBGROUPS, periodA.subgroup) - rankOf(BANCA_LIBRE_SUBGROUPS, periodB.subgroup);
  if (subgroupDelta) return subgroupDelta;

  return compareByFirstYear(a, b) || indexA - indexB;
}
