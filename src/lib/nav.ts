/**
 * Primary site navigation — shared by SiteHeader and generated from the same
 * curated collection entry points as the /coleccion/ hub.
 */
import { FEATURED_ENTRIES } from './catalog-hub';

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

export type NavSection = {
  id: string;
  label: string;
  labelEn?: string;
  href?: string;
  description?: string;
  descriptionEn?: string;
  links: NavLink[];
  groups?: NavGroup[];
};

/** Trailing drawer items — after collection accordions. Contacto stays last. */
export const BLOG_LINK: NavLink = {
  href: '/blog/',
  label: 'Blog',
  labelEn: 'Blog',
};

export const NEWS_LINK: NavLink = {
  href: '/noticias/',
  label: 'Noticias',
  labelEn: 'News',
};

export const GLOSSARY_LINK: NavLink = {
  href: '/glosario/',
  label: 'Glosario',
  labelEn: 'Glossary',
};

export const CONTACT_LINK: NavLink = {
  href: '/contacto/',
  label: 'Contacto',
  labelEn: 'Contact',
};

export const DRAWER_TRAILING_LINKS: NavLink[] = [
  BLOG_LINK,
  NEWS_LINK,
  GLOSSARY_LINK,
  CONTACT_LINK,
];

/** Top-level links always reachable without JavaScript. Contacto stays last. */
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', labelEn: 'Home' },
  { href: '/coleccion/', label: 'Colección', labelEn: 'Collection' },
  { href: '/#logros-heading', label: 'Logros del Mes', labelEn: 'Monthly milestones' },
  ...DRAWER_TRAILING_LINKS,
];

const DRAWER_TRAILING_HREFS = new Set(DRAWER_TRAILING_LINKS.map((link) => link.href));

/** Drawer destinations above the collection accordions (Blog through Contacto render after). */
export const DRAWER_PRIMARY_LINKS: NavLink[] = PRIMARY_LINKS.filter(
  (link) => !DRAWER_TRAILING_HREFS.has(link.href),
);

/** Featured notafilia destinations (coins live under the Numismática accordion). */
export const COLLECTION_LINKS: NavLink[] = FEATURED_ENTRIES.filter(
  (entry) => entry.href !== '/coleccion/numismatica/',
).map((entry) => ({
  href: entry.href,
  label: entry.title,
  labelEn: entry.titleEn,
}));

export const NUMISMATICA_LINKS: NavLink[] = [
  { href: '/coleccion/numismatica/', label: 'Catálogo de Numismática', labelEn: 'Numismatics catalog', lead: true },
];

export const NUMISMATICA_GROUPS: NavGroup[] = [
  {
    id: 'monedas-colombia',
    label: 'Colombia',
    labelEn: 'Colombia',
    links: [
      {
        href: '/coleccion/moneda-colonial-espanola/',
        label: 'Moneda colonial española',
        labelEn: 'Spanish colonial coinage',
        lead: true,
      },
      {
        href: '/coleccion/moneda-colonial-espanola/2-escudos-felipe-v-bogota/',
        label: 'Felipe V — Doblón de 2 Escudos, Bogotá',
        labelEn: 'Felipe V — 2 Escudos doubloon, Bogotá',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/2-escudos-carlos-iv-1791/',
        label: 'Carlos IV — 2 Escudos, Bogotá 1791',
        labelEn: 'Carlos IV — 2 Escudos, Bogotá 1791',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/',
        label: 'Fernando VII — 1 Escudo, Bogotá 1820',
        labelEn: 'Fernando VII — 1 Escudo, Bogotá 1820',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/',
        label: 'Carlos III — 1 Escudo, Bogotá 1774',
        labelEn: 'Carlos III — 1 Escudo, Bogotá 1774',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1787/',
        label: 'Carlos III — 1 Escudo, Bogotá 1787',
        labelEn: 'Carlos III — 1 Escudo, Bogotá 1787',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iv-1802/',
        label: 'Carlos IV — 1 Escudo, Bogotá 1802',
        labelEn: 'Carlos IV — 1 Escudo, Bogotá 1802',
      },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1811/',
        label: 'Fernando VII — 1 Escudo, Bogotá 1811',
        labelEn: 'Fernando VII — 1 Escudo, Bogotá 1811',
      },
    ],
  },
  {
    id: 'monedas-mundial',
    label: 'Mundial',
    labelEn: 'World',
    links: [
      {
        href: '/coleccion/ducado-oro-utrecht-1761/',
        label: 'Ducado de oro — Utrecht, 1761',
        labelEn: '1761 Utrecht Gold Ducat',
        lead: true,
      },
    ],
  },
];

export const NOTAFILIA_GROUPS: NavGroup[] = [
  {
    id: 'colombia',
    label: 'Colombia',
    labelEn: 'Colombia',
    links: [
      { href: '/coleccion/colombia/', label: 'Catálogo de Billetes de Colombia', labelEn: 'Colombia banknote catalog', lead: true },
      { href: '/coleccion/colombia/banco-hipotecario-5-pesos-1881/', label: 'Banco Hipotecario — 5 Pesos (1881)', labelEn: 'Banco Hipotecario — 5 Pesos (1881)' },
      { href: '/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/', label: 'Banco de Rio Hacha — 5 Pesos (1883)', labelEn: 'Banco de Rio Hacha — 5 Pesos (1883)' },
      { href: '/coleccion/colombia/cartagena-1-real-1813/', label: 'Cartagena de Indias — 1 Real (1813)', labelEn: 'Cartagena de Indias — 1 Real (1813)' },
      { href: '/coleccion/colombia/emisiones-en-el-extranjero/', label: 'Emisiones en el extranjero', labelEn: 'Issues printed abroad' },
    ],
  },
  {
    id: 'estados-unidos',
    label: 'Estados Unidos',
    labelEn: 'United States',
    links: [
      {
        href: '/coleccion/?pais=Estados%20Unidos#explorar',
        label: 'Catálogo de Estados Unidos',
        labelEn: 'United States catalog',
        lead: true,
      },
      { href: '/coleccion/billete-obsoleto-estados-unidos/', label: 'Billetes obsoletos de EE. UU.', labelEn: 'U.S. obsolete banknotes' },
      { href: '/coleccion/certificados-de-pago-militar/', label: 'Certificados de Pago Militar', labelEn: 'Military Payment Certificates' },
      { href: '/coleccion/pop-art/', label: 'Pop-art currency' },
    ],
  },
  {
    id: 'puerto-rico',
    label: 'Puerto Rico',
    links: [{ href: '/coleccion/puerto-rico/', label: 'Catálogo de Billetes de Puerto Rico', labelEn: 'Puerto Rico banknote catalog', lead: true }],
  },
  {
    id: 'ecuador',
    label: 'Ecuador',
    links: [{ href: '/coleccion/ecuador/', label: 'Catálogo de Billetes de Ecuador', labelEn: 'Ecuador banknote catalog', lead: true }],
  },
  {
    id: 'polimero',
    label: 'Billetes de polímero mundial',
    labelEn: 'World polymer notes',
    links: [{ href: '/coleccion/polimero-mundial/', label: 'Catálogo de polímero mundial', labelEn: 'World polymer catalog', lead: true }],
  },
];

/** Collection accordions only — Blog, Noticias, Glosario, and Logros live in PRIMARY_LINKS. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'numismatica',
    label: 'Colección virtual - Numismática',
    labelEn: 'Virtual collection - Numismatics',
    href: '/coleccion/numismatica/',
    links: NUMISMATICA_LINKS,
    groups: NUMISMATICA_GROUPS,
  },
  {
    id: 'notafilia',
    label: 'Colección virtual - Notafilia',
    labelEn: 'Virtual collection - Notaphily',
    href: '/coleccion/',
    description: 'Catálogo global con búsqueda y filtros por país, tipo y material.',
    descriptionEn: 'Global catalog with search and filters by country, type, and material.',
    links: [],
    groups: NOTAFILIA_GROUPS,
  },
];
