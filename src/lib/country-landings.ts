/**
 * Copy and related links for country landing pages (US, Spain, Colombia eras).
 */
export type CountryLandingId =
  | 'united-states'
  | 'spain'
  | 'colombia-siglo-pasado'
  | 'colombia-banrep';

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
  crumbs?: Array<{ href: string; name: string }>;
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
        'En el papel federal de tamaño pequeño (Serie 1928 en adelante), las fichas citan rangos de serie, sellos de color y cronología de diseño a partir de USPaperMoney.info, además de las fuentes oficiales del BEP y del Tesoro.',
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
        'On small-size federal paper (Series 1928 onward), the records cite serial ranges, seal colors, and design chronology from USPaperMoney.info, alongside official BEP and Treasury sources.',
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
  'colombia-siglo-pasado': {
    es: {
      path: '/coleccion/colombia/siglo-pasado/',
      title: 'Catálogo del Siglo Pasado | Notofilia',
      description:
        'Billetes colombianos anteriores a 1923: independencia, estados soberanos, banca libre y el Banco Nacional.',
      ogTitle: 'Catálogo del Siglo Pasado — Notofilia',
      h1: 'Siglo Pasado',
      kicker: 'Colombia',
      lead: 'Papel moneda colombiano anterior a la fundación del Banco de la República en 1923, documentado en la Colección Virtual.',
      intro: [
        'Esta página reúne las fichas de billetes colombianos emitidos antes de 1923: guerra de independencia, estados soberanos, banca libre regional, el Banco Nacional, emisiones de la República y papel impreso en el extranjero para bancos colombianos.',
        'No es un censo completo de la notafilia del siglo XIX. Es el inventario de los ejemplares fotografiados aquí, con referencias Pick u otras cuando existen. El papel del Banco de la República (desde 1923) está en un catálogo aparte.',
      ],
      relatedHeading: 'Otras colecciones de Colombia',
      related: [
        {
          href: '/coleccion/colombia/',
          title: 'Catálogo de Colombia',
          description: 'Todas las eras documentadas, agrupadas por periodo y emisor.',
        },
        {
          href: '/coleccion/colombia/banco-de-la-republica/',
          title: 'Banco de la República',
          description: 'Billetes de banca central desde 1923 hasta el presente.',
        },
        {
          href: '/coleccion/colombia/banca-libre/',
          title: 'Banca Libre',
          description: 'Emisores privados regionales del último tercio del siglo XIX.',
        },
      ],
      catalogHeading: 'Catálogo del Siglo Pasado',
      catalogLead:
        'Todas las fichas de billetes colombianos anteriores a 1923. El catálogo de Colombia agrupa las mismas piezas por era y banco.',
      catalogFilterHref: '/coleccion/colombia/',
      catalogFilterLabel: 'Abrir el catálogo completo de Colombia',
      countryName: 'Colombia',
      crumbs: [{ href: '/coleccion/colombia/', name: 'Colombia' }],
    },
    en: {
      path: '/en/collection/colombia/last-century/',
      title: 'Last Century Catalog | Notofilia',
      description:
        'Colombian banknotes from before 1923: independence, sovereign states, free banking, and El Banco Nacional.',
      ogTitle: 'Last Century Catalog — Notofilia',
      h1: 'Last Century',
      kicker: 'Colombia',
      lead: 'Colombian paper money issued before the founding of Banco de la República in 1923, documented in the Virtual Collection.',
      intro: [
        'This page gathers Colombian banknote records issued before 1923: the war of independence, sovereign-state issues, regional free banking, El Banco Nacional, early Republic notes, and paper printed abroad for Colombian banks.',
        'It is not a complete nineteenth-century census. It is the inventory of specimens photographed here, with Pick or other references when they exist. Banco de la República notes (from 1923) have their own catalog.',
      ],
      relatedHeading: 'Other Colombia collections',
      related: [
        {
          href: '/coleccion/colombia/',
          title: 'Colombia catalog',
          description: 'Every documented era, grouped by period and issuer.',
        },
        {
          href: '/coleccion/colombia/banco-de-la-republica/',
          title: 'Banco de la República',
          description: 'Central-bank notes from 1923 to the present.',
        },
        {
          href: '/coleccion/colombia/banca-libre/',
          title: 'Free Banking',
          description: 'Regional private issuers from the late nineteenth century.',
        },
      ],
      catalogHeading: 'Last Century catalog',
      catalogLead:
        'Every documented Colombian banknote from before 1923. The Colombia catalog groups the same pieces by era and bank.',
      catalogFilterHref: '/en/collection/colombia/',
      catalogFilterLabel: 'Open the full Colombia catalog',
      countryName: 'Colombia',
      crumbs: [{ href: '/coleccion/colombia/', name: 'Colombia' }],
    },
  },
  'colombia-banrep': {
    es: {
      path: '/coleccion/colombia/banco-de-la-republica/',
      title: 'Catálogo del Banco de la República | Notofilia',
      description:
        'Billetes del Banco de la República de 1923 a hoy: pesos oro, specimens y errores de la Colección Virtual.',
      ogTitle: 'Catálogo del Banco de la República — Notofilia',
      h1: 'Banco de la República',
      kicker: 'Colombia',
      lead: 'Papel de banca central colombiana desde 1923 hasta el presente, documentado en la Colección Virtual.',
      intro: [
        'El Banco de la República se fundó en 1923 y concentró la emisión de billetes que hasta entonces había estado en manos de bancos privados y del Estado. Esta página reúne las fichas de esa emisión continua: pesos oro, specimens de trabajo y errores de impresión.',
        'No es el catálogo oficial del banco ni un censo de todas las series. Es el inventario de los ejemplares fotografiados aquí, con referencias Pick u otras cuando existen. Los billetes anteriores a 1923 están en el catálogo del Siglo Pasado.',
        'El listado sigue el orden de denominación —del medio peso al de mayor valor— y, dentro de cada valor, la fecha más temprana del ejemplar documentado.',
      ],
      relatedHeading: 'Otras colecciones de Colombia',
      related: [
        {
          href: '/coleccion/colombia/',
          title: 'Catálogo de Colombia',
          description: 'Todas las eras documentadas, agrupadas por periodo y emisor.',
        },
        {
          href: '/coleccion/colombia/siglo-pasado/',
          title: 'Siglo Pasado',
          description: 'Billetes colombianos anteriores a 1923.',
        },
      ],
      catalogHeading: 'Catálogo del Banco de la República',
      catalogLead:
        'Todas las fichas de billetes impresos por el Banco de la República desde 1923, agrupadas por denominación. El catálogo de Colombia sitúa las mismas piezas en el contexto de las demás eras.',
      catalogFilterHref: '/coleccion/colombia/',
      catalogFilterLabel: 'Abrir el catálogo completo de Colombia',
      countryName: 'Colombia',
      crumbs: [{ href: '/coleccion/colombia/', name: 'Colombia' }],
    },
    en: {
      path: '/en/collection/colombia/banco-de-la-republica/',
      title: 'Banco de la República Catalog | Notofilia',
      description:
        'Banco de la República notes from 1923 to today: pesos oro, specimens, and errors in the Virtual Collection.',
      ogTitle: 'Banco de la República Catalog — Notofilia',
      h1: 'Banco de la República',
      kicker: 'Colombia',
      lead: 'Colombian central-bank paper from 1923 to the present, documented in the Virtual Collection.',
      intro: [
        'Banco de la República was founded in 1923 and concentrated note issue that had previously belonged to private banks and the State. This page gathers records of that continuous issue: pesos oro, working specimens, and printing errors.',
        'This is not the bank’s official catalog, nor a census of every series. It is the inventory of specimens photographed here, with Pick or other references when they exist. Notes from before 1923 are in the Last Century catalog.',
        'The list follows denomination order — from the half peso to the highest value — and, within each value, the earliest documented date of the specimen shown.',
      ],
      relatedHeading: 'Other Colombia collections',
      related: [
        {
          href: '/coleccion/colombia/',
          title: 'Colombia catalog',
          description: 'Every documented era, grouped by period and issuer.',
        },
        {
          href: '/coleccion/colombia/siglo-pasado/',
          title: 'Last Century',
          description: 'Colombian banknotes issued before 1923.',
        },
      ],
      catalogHeading: 'Banco de la República catalog',
      catalogLead:
        'Every documented note printed by Banco de la República from 1923, grouped by denomination. The Colombia catalog places the same pieces alongside the other eras.',
      catalogFilterHref: '/en/collection/colombia/',
      catalogFilterLabel: 'Open the full Colombia catalog',
      countryName: 'Colombia',
      crumbs: [{ href: '/coleccion/colombia/', name: 'Colombia' }],
    },
  },
};
