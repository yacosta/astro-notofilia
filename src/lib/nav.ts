/**
 * Curated primary navigation — hubs and browsing paths only.
 * Individual catalog records stay on collection landing pages and in the XML sitemap.
 */
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

export const COLLECTION_BROWSE: NavGroup = {
  id: 'browse',
  label: 'Explorar',
  labelEn: 'Browse',
  links: [
    { href: '/coleccion/', label: 'Catálogo completo', labelEn: 'Full Catalog', lead: true },
    { href: '/coleccion/numismatica/', label: 'Monedas', labelEn: 'Coins' },
    { href: '/coleccion/#recent', label: 'Añadidos recientes', labelEn: 'Recently Added' },
    { href: '/coleccion/#countries', label: 'Todos los países', labelEn: 'All Countries' },
  ],
};

export const COLLECTION_COUNTRIES: NavGroup = {
  id: 'major-countries',
  label: 'Colección Virtual — Notafilia',
  labelEn: 'Virtual Collection — Notaphily',
  links: [
    { href: '/coleccion/colombia/', label: 'Colombia', labelEn: 'Colombia' },
    { href: '/coleccion/estados-unidos/', label: 'Estados Unidos', labelEn: 'United States' },
    { href: '/coleccion/espana/', label: 'España', labelEn: 'Spain' },
    { href: '/coleccion/puerto-rico/', label: 'Puerto Rico', labelEn: 'Puerto Rico' },
    { href: '/coleccion/filipinas/', label: 'Filipinas', labelEn: 'Philippines' },
  ],
};

export const COLLECTION_SPECIAL: NavGroup = {
  id: 'special',
  label: 'Colecciones especiales',
  labelEn: 'Special Collections',
  links: [
    { href: '/coleccion/polimero-mundial/', label: 'Billetes de polímero mundial', labelEn: 'World Polymer Banknotes' },
    { href: '/coleccion/certificados-de-pago-militar/', label: 'Certificados de Pago Militar', labelEn: 'Military Payment Certificates' },
    { href: '/coleccion/?tipo=specimen', label: 'Specimens', labelEn: 'Specimens' },
    { href: '/coleccion/?tipo=error', label: 'Errores de imprenta', labelEn: 'Printing Errors' },
    { href: '/coleccion/billete-obsoleto-estados-unidos/', label: 'Billetes obsoletos de EE. UU.', labelEn: 'U.S. Obsolete Banknotes' },
    { href: '/coleccion/pop-art/', label: 'Pop-art currency', labelEn: 'Pop Art Currency' },
  ],
};

export const COLLECTION_MENU: NavMenu = {
  id: 'collection',
  href: '/coleccion/',
  label: 'Colección',
  labelEn: 'Collection',
  description: 'Catálogo global con búsqueda y filtros por país, tipo y material.',
  descriptionEn: 'Global catalog with search and filters by country, type, and material.',
  groups: [COLLECTION_BROWSE, COLLECTION_COUNTRIES, COLLECTION_SPECIAL],
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
  { href: '/coleccion/', label: 'Colección', labelEn: 'Collection' },
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
      { href: '/coleccion/', label: 'Catálogo completo', labelEn: 'Full Catalog' },
      { href: '/coleccion/numismatica/', label: 'Monedas', labelEn: 'Coins' },
      { href: '/coleccion/polimero-mundial/', label: 'Billetes de polímero mundial', labelEn: 'World Polymer Banknotes' },
      { href: '/coleccion/#recent', label: 'Añadidos recientes', labelEn: 'Recently Added' },
      { href: '/coleccion/#countries', label: 'Todos los países', labelEn: 'All Countries' },
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
