/**
 * Curated primary navigation — collection hubs plus the small coin catalog.
 * Individual banknote fichas stay on landing pages and in the XML sitemap.
 */
import { loadCoinPieces } from './coins-catalog';

export type NavLink = {
  href: string;
  label: string;
  labelEn?: string;
  lead?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  labelEn?: string;
  links: NavLink[];
};

export type NavMenu = {
  id: string;
  href: string;
  label: string;
  labelEn?: string;
  description?: string;
  descriptionEn?: string;
  groups: NavGroup[];
};

export const HOME_LINK: NavLink = {
  href: '/',
  label: 'Inicio',
  labelEn: 'Home',
};

export const CONTACT_LINK: NavLink = {
  href: '/contacto/',
  label: 'Contacto',
  labelEn: 'Contact',
};

export const ABOUT_LINK: NavLink = {
  href: '/nosotros/',
  label: 'Sobre Notofilia',
  labelEn: 'About Notofilia',
};

export const EDITORIAL_LINK: NavLink = {
  href: '/editorial/',
  label: 'Política editorial y valoración',
  labelEn: 'Editorial & Valuation Policy',
};

export const GUIDES_LINK: NavLink = {
  href: '/blog/',
  label: 'Guías para coleccionistas',
  labelEn: 'Collector Guides',
};

export const NEWS_LINK: NavLink = {
  href: '/noticias/',
  label: 'Noticias numismáticas',
  labelEn: 'Numismatic News',
};

export const GLOSSARY_LINK: NavLink = {
  href: '/glosario/',
  label: 'Glosario',
  labelEn: 'Glossary',
};

export const PRIVACY_LINK: NavLink = {
  href: '/politica-privacidad-cookies/',
  label: 'Política de privacidad y cookies',
  labelEn: 'Privacy & Cookie Policy',
};

export const REPORT_ERROR_LINK: NavLink = {
  href: '/contacto/?motivo=error',
  label: 'Reportar un error',
  labelEn: 'Report an Error',
};

/** Short English labels for coin fichas listed in the Collection menu. */
const COIN_NAV_LABELS_EN: Record<string, string> = {
  '/coleccion/colombia/santa-marta-1-4-real-1820/': 'Santa Marta cuartillo, 1820',
  '/coleccion/ducado-oro-utrecht-1761/': 'Utrecht gold ducat, 1761',
  '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/':
    'Charles III — 1 gold escudo, Bogotá 1774',
  '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1787/':
    'Charles III — 1 gold escudo, Bogotá 1787',
  '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iv-1802/':
    'Charles IV — 1 gold escudo, Bogotá 1802',
  '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1811/':
    'Ferdinand VII — 1 gold escudo, Bogotá 1811',
  '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/':
    'Ferdinand VII — 1 gold escudo, Bogotá 1820',
  '/coleccion/moneda-colonial-espanola/2-escudos-carlos-iv-1791/':
    'Charles IV — 2 gold escudos, Bogotá 1791',
  '/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/':
    'Philip V — 2-escudo gold cob, Santa Fe de Bogotá',
};

const COIN_NAV_LABELS_ES: Record<string, string> = {
  '/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/':
    'Felipe V — Doblón de 2 Escudos, Santa Fe de Bogotá',
};

function withTrailingSlash(href: string): string {
  if (href.includes('?') || href.includes('#')) return href;
  return href.endsWith('/') ? href : `${href}/`;
}

function coinNavLinks(): NavLink[] {
  return loadCoinPieces()
    .slice()
    .sort((a, b) => {
      const yearA = a.year ?? 9999;
      const yearB = b.year ?? 9999;
      if (yearA !== yearB) return yearA - yearB;
      return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
    })
    .map((piece) => {
      const href = withTrailingSlash(piece.path);
      const fromIndex = piece.title.replace(/\s*\|\s*Notofilia\s*$/i, '').trim();
      return {
        href,
        label: COIN_NAV_LABELS_ES[href] ?? fromIndex,
        labelEn: COIN_NAV_LABELS_EN[href],
      };
    });
}

/** Every banknote catalog hub / country landing — not individual notes. */
export const COLLECTION_NOTAPHILY: NavGroup = {
  id: 'virtual-notaphily',
  label: 'Colecciones virtuales — Notafilia',
  labelEn: 'Virtual collections — Notaphily',
  links: [
    { href: '/coleccion/colombia/', label: 'Colombia', labelEn: 'Colombia', lead: true },
    {
      href: '/coleccion/colombia/banca-libre/',
      label: 'Banca Libre (Colombia)',
      labelEn: 'Free Banking (Colombia)',
    },
    {
      href: '/coleccion/colombia/emisiones-en-el-extranjero/',
      label: 'Emisiones colombianas en el extranjero',
      labelEn: 'Colombian notes issued abroad',
    },
    { href: '/coleccion/estados-unidos/', label: 'Estados Unidos', labelEn: 'United States' },
    {
      href: '/coleccion/estados-unidos/#united-states-notes',
      label: 'United States Notes',
      labelEn: 'United States Notes',
    },
    {
      href: '/coleccion/reserva-federal/',
      label: 'Reserva Federal (EE. UU.)',
      labelEn: 'Federal Reserve (U.S.)',
    },
    {
      href: '/coleccion/departamento-del-tesoro-de-ee-uu/',
      label: 'Departamento del Tesoro (EE. UU.)',
      labelEn: 'U.S. Treasury',
    },
    {
      href: '/coleccion/certificados-de-pago-militar/',
      label: 'Certificados de Pago Militar',
      labelEn: 'Military Payment Certificates',
    },
    {
      href: '/coleccion/food-coupons-usda/',
      label: 'Cupones de alimentos USDA',
      labelEn: 'USDA Food Coupons',
    },
    {
      href: '/coleccion/emisiones-promocionales/',
      label: 'Emisiones promocionales (EE. UU.)',
      labelEn: 'U.S. promotional issues',
    },
    {
      href: '/coleccion/moneda-colonial/',
      label: 'Moneda colonial americana',
      labelEn: 'American colonial currency',
    },
    { href: '/coleccion/puerto-rico/', label: 'Puerto Rico', labelEn: 'Puerto Rico' },
    { href: '/coleccion/filipinas/', label: 'Filipinas', labelEn: 'Philippines' },
    { href: '/coleccion/ecuador/', label: 'Ecuador', labelEn: 'Ecuador' },
    {
      href: '/coleccion/polimero-mundial/',
      label: 'Billetes de polímero mundial',
      labelEn: 'World Polymer Banknotes',
    },
    { href: '/coleccion/pop-art/', label: 'Pop-art currency', labelEn: 'Pop Art Currency' },
  ],
};

/** Coin hubs plus every coin ficha in the virtual collection. */
export const COLLECTION_NUMISMATICS: NavGroup = {
  id: 'virtual-numismatics',
  label: 'Colecciones virtuales — Numismática',
  labelEn: 'Virtual collections — Numismatics',
  links: [
    { href: '/coleccion/numismatica/', label: 'Numismática', labelEn: 'Numismatics', lead: true },
    {
      href: '/coleccion/moneda-colonial-espanola/',
      label: 'Moneda colonial española',
      labelEn: 'Spanish colonial coinage',
    },
    { href: '/coleccion/espana/', label: 'España', labelEn: 'Spain' },
    ...coinNavLinks(),
  ],
};

export const COLLECTION_MENU: NavMenu = {
  id: 'collection',
  href: '/coleccion/colombia/',
  label: 'Colección',
  labelEn: 'Collection',
  description: 'Colecciones por país, material y tema — notafilia y numismática.',
  descriptionEn: 'Collections by country, material, and theme — notaphily and numismatics.',
  groups: [COLLECTION_NOTAPHILY, COLLECTION_NUMISMATICS],
};

export const RESOURCES_MENU: NavMenu = {
  id: 'resources',
  href: '/blog/',
  label: 'Recursos',
  labelEn: 'Resources',
  description: 'Guías originales, noticias curadas y el glosario de coleccionismo.',
  descriptionEn: 'Original guides, curated news, and the collecting glossary.',
  groups: [
    {
      id: 'resources-links',
      label: 'Recursos',
      labelEn: 'Resources',
      links: [GUIDES_LINK, NEWS_LINK, GLOSSARY_LINK],
    },
  ],
};

export const ABOUT_MENU: NavMenu = {
  id: 'about',
  href: '/nosotros/',
  label: 'Sobre Notofilia',
  labelEn: 'About',
  description: 'Qué es Notofilia y cómo investigamos el catálogo.',
  descriptionEn: 'What Notofilia is and how the catalog is researched.',
  groups: [
    {
      id: 'about-links',
      label: 'Sobre Notofilia',
      labelEn: 'About',
      links: [ABOUT_LINK, EDITORIAL_LINK],
    },
  ],
};

/** Desktop mega / dropdown menus. Contact stays a direct top-level link. */
export const PRIMARY_MENUS: NavMenu[] = [COLLECTION_MENU, RESOURCES_MENU, ABOUT_MENU];

/** Always-visible destinations for no-JS and skip-level fallbacks. */
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/coleccion/colombia/', label: 'Colección', labelEn: 'Collection' },
  GUIDES_LINK,
  NEWS_LINK,
  GLOSSARY_LINK,
  ABOUT_LINK,
  EDITORIAL_LINK,
  CONTACT_LINK,
];

/** Flat About + Contact items at the end of the mobile drawer. */
export const DRAWER_TRAILING_LINKS: NavLink[] = [ABOUT_LINK, EDITORIAL_LINK, CONTACT_LINK];

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    id: 'explore',
    label: 'Explorar',
    labelEn: 'Explore',
    links: [
      { href: '/coleccion/colombia/', label: 'Colombia', labelEn: 'Colombia' },
      { href: '/coleccion/numismatica/', label: 'Monedas', labelEn: 'Coins' },
      { href: '/coleccion/polimero-mundial/', label: 'Billetes de polímero mundial', labelEn: 'World Polymer Banknotes' },
      { href: '/coleccion/estados-unidos/', label: 'Estados Unidos', labelEn: 'United States' },
    ],
  },
  {
    id: 'resources',
    label: 'Recursos',
    labelEn: 'Resources',
    links: [
      GUIDES_LINK,
      { href: '/noticias/', label: 'Noticias', labelEn: 'News' },
      GLOSSARY_LINK,
    ],
  },
  {
    id: 'about',
    label: 'Sobre Notofilia',
    labelEn: 'About',
    links: [ABOUT_LINK, EDITORIAL_LINK, CONTACT_LINK, REPORT_ERROR_LINK],
  },
  {
    id: 'legal',
    label: 'Legal',
    labelEn: 'Legal',
    links: [PRIVACY_LINK],
  },
];
