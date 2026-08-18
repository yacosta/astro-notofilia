/**
 * Single source of truth for collection inventory counts.
 * Every public figure (hero, footer, /coleccion/, JSON-LD, API, llms.txt)
 * must come from getCollectionStats() — never a hand-written digit.
 */
import { getCollection } from 'astro:content';
import {
  computeInventoryStats,
  getCollectionStatsFromDisk,
  INVENTORY_VOCABULARY_EN,
  INVENTORY_VOCABULARY_ES,
} from './catalog-inventory.mjs';

export type CollectionStats = {
  /** Individual notes documented (one ficha may hold several). */
  billetes: number;
  /** Individual coin fichas. */
  monedas: number;
  /** Distinct issuing countries on piece fichas. */
  paises: number;
  /** Catalog entries for collected pieces (not hubs or profiles). */
  fichas: number;
  /** Indexed catalog URLs (fichas + hubs + profiles). */
  paginas: number;
};

export { INVENTORY_VOCABULARY_EN, INVENTORY_VOCABULARY_ES, getCollectionStatsFromDisk };

let cached: Promise<CollectionStats> | undefined;

function asStats(value: {
  billetes: number;
  monedas: number;
  paises: number;
  fichas: number;
  paginas: number;
}): CollectionStats {
  return {
    billetes: value.billetes,
    monedas: value.monedas,
    paises: value.paises,
    fichas: value.fichas,
    paginas: value.paginas,
  };
}

/**
 * Read the catalog content collection once per build and return live counts.
 */
export function getCollectionStats(): Promise<CollectionStats> {
  if (!cached) {
    cached = (async () => {
      const entries = await getCollection('catalog');
      return asStats(
        computeInventoryStats(
          entries.map((entry) => ({
            path: entry.data.path,
            title: entry.data.title,
            ogType: entry.data.ogType,
            template: entry.data.template,
            jsonLd: entry.data.jsonLd,
            record: entry.data.record,
            keywords: entry.data.keywords,
          })),
        ),
      );
    })();
  }
  return cached;
}

export function formatStatsEs(s: CollectionStats): string {
  return `${s.billetes} billetes · ${s.monedas} monedas · ${s.paises} países · ${s.fichas} fichas · ${s.paginas} páginas`;
}

export function formatStatsEn(s: CollectionStats): string {
  return `${s.billetes} banknotes · ${s.monedas} coins · ${s.paises} countries · ${s.fichas} catalog entries · ${s.paginas} pages`;
}

export function inventoryProperties(s: CollectionStats, locale: 'es' | 'en' = 'es') {
  const names =
    locale === 'en'
      ? {
          billetes: 'Banknotes',
          monedas: 'Coins',
          paises: 'Countries',
          fichas: 'Catalog entries',
          paginas: 'Pages',
        }
      : {
          billetes: 'Billetes',
          monedas: 'Monedas',
          paises: 'Países',
          fichas: 'Fichas',
          paginas: 'Páginas',
        };
  return [
    { '@type': 'PropertyValue', name: names.billetes, value: String(s.billetes) },
    { '@type': 'PropertyValue', name: names.monedas, value: String(s.monedas) },
    { '@type': 'PropertyValue', name: names.paises, value: String(s.paises) },
    { '@type': 'PropertyValue', name: names.fichas, value: String(s.fichas) },
    { '@type': 'PropertyValue', name: names.paginas, value: String(s.paginas) },
  ];
}
