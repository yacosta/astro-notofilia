/**
 * Copy and related links for country landing pages (US, Spain).
 */
export type CountryLandingId = 'united-states' | 'spain';

export type CountryLandingCopy = {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  h1: string;
  kicker: string;
  lead: string;
  intro: string[];
  issuersHeading?: string;
  issuers?: Array<{ name: string; note: string }>;
  featuredHeading?: string;
  featuredLead?: string;
  relatedHeading?: string;
  related?: Array<{ href: string; title: string; description: string }>;
  catalogHeading: string;
  catalogLead: string;
  catalogFilterHref: string;
  catalogFilterLabel: string;
  countryName: string;
  featuredPaths?: string[];
};

export const COUNTRY_LANDINGS: Record<
  CountryLandingId,
  { es: CountryLandingCopy; en: CountryLandingCopy }
> = {
  'united-states': {
    es: {
      path: '/coleccion/estados-unidos/',
      title: 'Catálogo de Estados Unidos | Notofilia',
      description:
        'Billetes federales, coloniales, obsoletos y MPC de Estados Unidos documentados en la Colección Virtual.',
      ogTitle: 'Catálogo de Estados Unidos — Notofilia',
      h1: 'Estados Unidos',
      kicker: 'Colección principal',
      lead: 'Federal, colonial, certificados de pago militar, billetes obsoletos y emisiones promocionales de una misma colección documentada.',
      intro: [
        'La colección de Estados Unidos es la segunda más amplia de Notofilia después de Colombia. Reúne papel colonial de las trece colonias, broken banknotes anteriores a la banca nacional, certificados del Tesoro y de la Reserva Federal, scrip militar (MPC) y piezas promocionales o de ensayo.',
        'No es un catálogo completo de la notafilia estadounidense: es el inventario de los ejemplares documentados aquí, con fotografías del espécimen y referencias Friedberg, Haxby, Schwan o Pick cuando existen.',
      ],
      catalogHeading: 'Catálogo de Estados Unidos',
      catalogLead: 'Todas las fichas documentadas con país Estados Unidos. El explorador global permite combinar más filtros.',
      catalogFilterHref: '/coleccion/?pais=Estados%20Unidos#explorar',
      catalogFilterLabel: 'Abrir en el catálogo filtrado',
      countryName: 'Estados Unidos',
    },
    en: {
      path: '/en/collection/united-states/',
      title: 'United States Catalog | Notofilia',
      description:
        'Federal, colonial, obsolete, and MPC United States notes documented in the Virtual Collection.',
      ogTitle: 'United States Catalog — Notofilia',
      h1: 'United States',
      kicker: 'Major collection',
      lead: 'Federal, colonial, military payment certificates, obsolete notes, and promotional issues from one documented collection.',
      intro: [
        'The United States holding is Notofilia’s second-largest country collection after Colombia. It brings together colonial paper of the thirteen colonies, broken banknotes from before national banking, Treasury and Federal Reserve certificates, military payment certificates, and promotional or test pieces.',
        'This is not a complete U.S. notaphily catalog. It is the inventory of specimens documented here, with photographs of the piece shown and Friedberg, Haxby, Schwan, or Pick references when they exist.',
      ],
      catalogHeading: 'United States catalog',
      catalogLead: 'Every documented record with country United States. The global browser can combine additional filters.',
      catalogFilterHref: '/en/collection/?pais=Estados%20Unidos#explorar',
      catalogFilterLabel: 'Open in the filtered catalog',
      countryName: 'Estados Unidos',
    },
  },
  spain: {
    es: {
      path: '/coleccion/espana/',
      title: 'Catálogo de España | Notofilia',
      description:
        'Oro colonial español acuñado en Santa Fe de Bogotá: escudos de Felipe V a Fernando VII en la Colección Virtual.',
      ogTitle: 'Catálogo de España — Notofilia',
      h1: 'España',
      kicker: 'Colección principal',
      lead: 'Oro macuquino y de retrato de la ceca de Santa Fe de Bogotá, acuñado para la Corona española en el Virreinato de la Nueva Granada.',
      intro: [
        'Las fichas atribuidas a España en Notofilia son monedas de oro colonial: escudos y doblones de Felipe V, Carlos III, Carlos IV y Fernando VII, acuñados en Santa Fe de Bogotá (marca NR). Circulaban como moneda de la Corona, no como emisiones republicanas colombianas.',
        'El catálogo de moneda colonial española reúne el mismo grupo con contexto de ceca y ensayadores. Esta página es el destino permanente por país; Colombia documenta por separado el papel y las monedas de necesidad posteriores a la independencia.',
      ],
      issuersHeading: 'Emisores y periodos',
      issuers: [
        { name: 'Ceca de Santa Fe de Bogotá', note: 'Marca NR (Nuevo Reino). Oro de 1 y 2 escudos, siglos XVIII y XIX.' },
        { name: 'Felipe V (macuquina)', note: 'Doblón de 2 escudos acuñado a mano, tipo Calicó 243 / Friedberg Fr-8.' },
        { name: 'Carlos III y Carlos IV', note: 'Retrato oficial y bustos transicionales (1774–1802).' },
        { name: 'Fernando VII', note: 'Emisiones de 1811 y 1820, en plena crisis de la independencia.' },
      ],
      featuredHeading: 'Ejemplares destacados',
      featuredLead: 'La serie de oro colonial documentada, del doblón macuquino al escudo de 1820.',
      relatedHeading: 'Colecciones especiales relacionadas',
      related: [
        { href: '/coleccion/moneda-colonial-espanola/', title: 'Moneda colonial española', description: 'Catálogo de oro de la ceca de Bogotá.' },
        { href: '/coleccion/numismatica/', title: 'Catálogo de monedas', description: 'Numismática: colonial, necesidad y comercio.' },
        { href: '/coleccion/colombia/', title: 'Colombia', description: 'Papel moneda y monedas de la era republicana.' },
      ],
      catalogHeading: 'Catálogo de España',
      catalogLead: 'Todas las fichas documentadas con país España. El explorador global permite combinar más filtros.',
      catalogFilterHref: '/coleccion/?pais=Espa%C3%B1a#explorar',
      catalogFilterLabel: 'Abrir en el catálogo filtrado',
      countryName: 'España',
      featuredPaths: [
        '/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/',
        '/coleccion/moneda-colonial-espanola/2-escudos-carlos-iv-1791/',
        '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/',
        '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/',
      ],
    },
    en: {
      path: '/en/collection/spain/',
      title: 'Spain Catalog | Notofilia',
      description:
        'Spanish colonial gold struck at Santa Fe de Bogotá: escudos from Philip V to Ferdinand VII in the Virtual Collection.',
      ogTitle: 'Spain Catalog — Notofilia',
      h1: 'Spain',
      kicker: 'Major collection',
      lead: 'Cob and portrait gold of the Santa Fe de Bogotá mint, struck for the Spanish Crown in the Viceroyalty of New Granada.',
      intro: [
        'The records attributed to Spain on Notofilia are colonial gold coins: escudos and doubloons of Philip V, Charles III, Charles IV, and Ferdinand VII, struck at Santa Fe de Bogotá (mintmark NR). They circulated as Crown coin, not as later Colombian republican issues.',
        'The Spanish colonial coinage catalog gathers the same group with mint and assayer context. This page is the permanent country destination; Colombia separately documents paper money and necessity coinage after independence.',
      ],
      issuersHeading: 'Issuers and periods',
      issuers: [
        { name: 'Santa Fe de Bogotá mint', note: 'Mintmark NR (Nuevo Reino). 1- and 2-escudo gold, 18th and 19th centuries.' },
        { name: 'Philip V (cob coinage)', note: 'Hand-struck 2-escudos doubloon, Calicó type 243 / Friedberg Fr-8.' },
        { name: 'Charles III and Charles IV', note: 'Official portrait and transitional busts (1774–1802).' },
        { name: 'Ferdinand VII', note: '1811 and 1820 issues, during the independence crisis.' },
      ],
      featuredHeading: 'Featured specimens',
      featuredLead: 'The documented colonial gold series, from the cob doubloon to the 1820 escudo.',
      relatedHeading: 'Related special collections',
      related: [
        { href: '/coleccion/moneda-colonial-espanola/', title: 'Spanish colonial coinage', description: 'Gold catalog of the Bogotá mint.' },
        { href: '/coleccion/numismatica/', title: 'Coin catalog', description: 'Numismatics: colonial, necessity, and trade pieces.' },
        { href: '/coleccion/colombia/', title: 'Colombia', description: 'Paper money and coins of the republican era.' },
      ],
      catalogHeading: 'Spain catalog',
      catalogLead: 'Every documented record with country Spain. The global browser can combine additional filters.',
      catalogFilterHref: '/en/collection/?pais=Espa%C3%B1a#explorar',
      catalogFilterLabel: 'Open in the filtered catalog',
      countryName: 'España',
      featuredPaths: [
        '/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/',
        '/coleccion/moneda-colonial-espanola/2-escudos-carlos-iv-1791/',
        '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/',
        '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/',
      ],
    },
  },
};
