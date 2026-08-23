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
  issuersHeading: string;
  issuers: Array<{ name: string; note: string }>;
  featuredHeading: string;
  featuredLead: string;
  relatedHeading: string;
  related: Array<{ href: string; title: string; description: string }>;
  catalogHeading: string;
  catalogLead: string;
  catalogFilterHref: string;
  catalogFilterLabel: string;
  countryName: string;
  featuredPaths: string[];
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
      issuersHeading: 'Emisores y periodos',
      issuers: [
        { name: 'Colonias británicas (antes de 1776)', note: 'Papel provincial: Nueva Jersey, Pensilvania y otras emisiones coloniales.' },
        { name: 'Banca libre y obsoletos (c. 1782–1866)', note: 'Bancos estatales y compañías de seguros anteriores al National Bank Act.' },
        { name: 'Departamento del Tesoro', note: 'Certificados de oro, legal tender y otras series federales.' },
        { name: 'Reserva Federal', note: 'Billetes de distrito, incluido el de Minneapolis de 1929.' },
        { name: 'Departamento de Defensa (MPC)', note: 'Scrip para personal autorizado en bases de ultramar, 1946–1973.' },
      ],
      featuredHeading: 'Ejemplares destacados',
      featuredLead: 'Una muestra de tipos: federal, militar, obsoleto y colonial.',
      relatedHeading: 'Colecciones especiales relacionadas',
      related: [
        { href: '/coleccion/billete-obsoleto-estados-unidos/', title: 'Billetes obsoletos de EE. UU.', description: 'Broken banknotes previos a la banca nacional.' },
        { href: '/coleccion/certificados-de-pago-militar/', title: 'Certificados de Pago Militar', description: 'Series MPC usadas por las fuerzas armadas.' },
        { href: '/coleccion/pop-art/', title: 'Pop-art currency', description: 'Reinterpretaciones contemporáneas y piezas artísticas.' },
        { href: '/coleccion/moneda-colonial/', title: 'Moneda colonial americana', description: 'Papel de las trece colonias británicas.' },
      ],
      catalogHeading: 'Catálogo de Estados Unidos',
      catalogLead: 'Todas las fichas documentadas con país Estados Unidos. El explorador global permite combinar más filtros.',
      catalogFilterHref: '/coleccion/?pais=Estados%20Unidos#explorar',
      catalogFilterLabel: 'Abrir en el catálogo filtrado',
      countryName: 'Estados Unidos',
      featuredPaths: [
        '/coleccion/certificado-de-oro-10-dolares-1928/',
        '/coleccion/cien-dolares-sello-rojo-1966/',
        '/coleccion/certificados-de-pago-militar/1-dolar-serie-681/',
        '/coleccion/hagerstown-bank-maryland/',
        '/coleccion/moneda-colonial/nueva-jersey-6-chelines-1776/',
        '/coleccion/giori-press-test-note/',
      ],
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
      issuersHeading: 'Issuers and periods',
      issuers: [
        { name: 'British colonies (before 1776)', note: 'Provincial paper: New Jersey, Pennsylvania, and other colonial issues.' },
        { name: 'Free banking and obsolete notes (c. 1782–1866)', note: 'State banks and insurance companies before the National Bank Act.' },
        { name: 'United States Treasury', note: 'Gold certificates, legal tender, and other federal series.' },
        { name: 'Federal Reserve', note: 'District notes, including the 1929 Minneapolis issue.' },
        { name: 'Department of Defense (MPC)', note: 'Scrip for authorized personnel on overseas bases, 1946–1973.' },
      ],
      featuredHeading: 'Featured specimens',
      featuredLead: 'A cross-section of types: federal, military, obsolete, and colonial.',
      relatedHeading: 'Related special collections',
      related: [
        { href: '/coleccion/billete-obsoleto-estados-unidos/', title: 'U.S. obsolete banknotes', description: 'Broken banknotes from before national banking.' },
        { href: '/coleccion/certificados-de-pago-militar/', title: 'Military Payment Certificates', description: 'MPC series used by the U.S. armed forces.' },
        { href: '/coleccion/pop-art/', title: 'Pop-art currency', description: 'Contemporary reinterpretations and art pieces.' },
        { href: '/coleccion/moneda-colonial/', title: 'American colonial paper money', description: 'Notes of the thirteen British colonies.' },
      ],
      catalogHeading: 'United States catalog',
      catalogLead: 'Every documented record with country United States. The global browser can combine additional filters.',
      catalogFilterHref: '/en/collection/?pais=Estados%20Unidos#explorar',
      catalogFilterLabel: 'Open in the filtered catalog',
      countryName: 'Estados Unidos',
      featuredPaths: [
        '/coleccion/certificado-de-oro-10-dolares-1928/',
        '/coleccion/cien-dolares-sello-rojo-1966/',
        '/coleccion/certificados-de-pago-militar/1-dolar-serie-681/',
        '/coleccion/hagerstown-bank-maryland/',
        '/coleccion/moneda-colonial/nueva-jersey-6-chelines-1776/',
        '/coleccion/giori-press-test-note/',
      ],
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
