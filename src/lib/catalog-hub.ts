import { computeCollectionStats, type CollectionStats } from './stats';

export type FeaturedEntry = {
  href: string;
  title: string;
  description: string;
  /** Optional query applied when href is the hub browse section. */
  filter?: Record<string, string>;
};

export type RecentPiece = {
  href: string;
  title: string;
  description: string;
  imageBase: string;
  imageAlt: string;
};

/** Curated featured entry points for the global collection hub. */
export const FEATURED_ENTRIES: FeaturedEntry[] = [
  {
    href: '/coleccion/colombia/',
    title: 'Colombia',
    description: 'Banca libre, Banco de la República, specimens y errores.',
  },
  {
    href: '/coleccion/?pais=Estados%20Unidos#explorar',
    title: 'Estados Unidos',
    description: 'Federal, colonial, MPC, obsoletos y emisiones promocionales.',
    filter: { pais: 'Estados Unidos' },
  },
  {
    href: '/coleccion/puerto-rico/',
    title: 'Puerto Rico',
    description: 'Emisiones coloniales y de transición del siglo XIX.',
  },
  {
    href: '/coleccion/ecuador/',
    title: 'Ecuador',
    description: 'Sucres documentados de la colección virtual.',
  },
  {
    href: '/coleccion/polimero-mundial/',
    title: 'Billetes de polímero',
    description: 'Catálogo mundial de sustratos Guardian, Safeguard e híbridos.',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/',
    title: 'Certificados de Pago Militar',
    description: 'Series MPC usadas por las fuerzas armadas de EE. UU.',
  },
  {
    href: '/coleccion/?tipo=specimen#explorar',
    title: 'Specimens',
    description: 'Ejemplares de muestra con cancelaciones y perforaciones.',
    filter: { tipo: 'specimen' },
  },
  {
    href: '/coleccion/?tipo=error#explorar',
    title: 'Errores de imprenta',
    description: 'Cortes descentrados, sobreimpresiones y fallos de color.',
    filter: { tipo: 'error' },
  },
  {
    href: '/coleccion/billete-obsoleto-estados-unidos/',
    title: 'Billetes obsoletos de EE. UU.',
    description: 'Broken banknotes previos a la banca nacional (1782–1866).',
  },
  {
    href: '/coleccion/pop-art/',
    title: 'Pop-art currency',
    description: 'Piezas artísticas y reinterpretaciones contemporáneas.',
  },
];

/** Recently highlighted pieces (shared with homepage Logros strip). */
export const RECENT_PIECES: RecentPiece[] = [
  {
    href: '/coleccion/diez-dolares-1934-distritos/',
    title: '$10 Reserva Federal — Chicago 1934',
    description: 'Serie de 1934, distrito G (Chicago). Friedberg FR-2004G.',
    imageBase: 'us-federal-reserve-note-10-dollars-1934-chicago',
    imageAlt:
      'Anverso del billete de diez dólares de la Reserva Federal de Chicago, serie 1934',
  },
  {
    href: '/coleccion/ringling-bros-50-aniversario-baraboo/#1-dolar',
    title: 'Ringling Bros. — Un Dólar (Baraboo)',
    description: 'Scrip del 50º aniversario (1933), Shafer WI-100-1a.',
    imageBase: 'ringling-bros-50th-anniversary-baraboo-1-dollar',
    imageAlt: 'Anverso y reverso del scrip de un dólar Ringling Bros. Baraboo 1933',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/20-dolares-serie-692/',
    title: 'MPC Serie 692 — Veinte Dólares',
    description: 'Última serie oficial de MPC (1970–1973), jefe Ouray.',
    imageBase: 'mpc-series-692-20-dollars',
    imageAlt: 'Anverso y reverso del MPC Serie 692 de veinte dólares con el jefe Ouray',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/10-dolares-serie-641/',
    title: 'MPC Serie 641 — Diez Dólares',
    description: 'Vietnam (1965–1968), ejemplar PMG 53 About Uncirculated.',
    imageBase: 'mpc-series-641-10-dollars',
    imageAlt: 'Anverso y reverso del MPC Serie 641 de diez dólares usado en Vietnam',
  },
];

export function hubStats(): CollectionStats {
  return computeCollectionStats();
}

export function hubLead(stats: CollectionStats): string {
  return `Explora ${stats.banknotes} billetes y ${stats.coins} monedas de ${stats.countries} países, documentados con imágenes, historia y referencias de catálogo.`;
}
