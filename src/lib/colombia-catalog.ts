import { firstYear } from './catalog-year';
import type { CatalogCard } from './catalog-record';

export type ColombiaPeriod = {
  group: string;
  groupKicker: string;
};

/** Chronological catalog sections for /coleccion/colombia/. */
export function colombiaPeriodFor(card: Pick<CatalogCard, 'href' | 'year'>): ColombiaPeriod {
  const href = card.href;
  const year = firstYear(card.year);

  if (href.includes('cartagena') || year === 1813) {
    return {
      group: 'Cartagena de Indias (1811–1815)',
      groupKicker: 'Guerra de Independencia',
    };
  }
  if (href.includes('nueva-granada') || year === 1861) {
    return {
      group: 'Estados Unidos de Nueva Granada (1861)',
      groupKicker: 'Guerra Civil de 1860–1862',
    };
  }
  if (href.includes('estado-soberano-panama') || href.includes('estado-soberano-cundinamarca')) {
    return {
      group: 'Estados Unidos de Colombia',
      groupKicker: 'Emisiones de los estados soberanos',
    };
  }
  if (href.includes('republica-bolivar') || href.includes('estado-soberano-cauca')) {
    return {
      group: 'Estados soberanos (1882)',
      groupKicker: 'Primera República',
    };
  }
  if (href.includes('libranza') || href.includes('boyaca')) {
    return {
      group: 'Bonos y Libranzas Fiscales',
      groupKicker: 'Deuda pública estatal',
    };
  }
  if (href.includes('banco-hipotecario')) {
    return {
      group: 'El Banco Hipotecario',
      groupKicker: 'Banca Libre (1881)',
    };
  }
  if (href.includes('banco-de-rio-hacha')) {
    return {
      group: 'El Banco de Rio Hacha',
      groupKicker: 'Banca Libre (1883)',
    };
  }
  if (href.includes('banco-nacional')) {
    return {
      group: 'El Banco Nacional',
      groupKicker: 'La Regeneración (1880–1896)',
    };
  }
  if (href.includes('republica-1904') || href.includes('republica-1910')) {
    return {
      group: 'República de Colombia',
      groupKicker: 'Consolidación nacional',
    };
  }
  if (
    href.includes('error') ||
    href.includes('50000-pesos') ||
    (card.year && /error/i.test(String(card.year)))
  ) {
    return {
      group: 'Errores de impresión',
      groupKicker: 'Banco de la República',
    };
  }
  return {
    group: 'El Banco de la República',
    groupKicker: 'Banca centralizada (desde 1923)',
  };
}

export function withColombiaGroup(card: CatalogCard): CatalogCard {
  const period = colombiaPeriodFor(card);
  return {
    ...card,
    group: card.group || period.group,
    groupKicker: card.groupKicker || period.groupKicker,
  };
}
