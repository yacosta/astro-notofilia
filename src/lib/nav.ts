/**
 * Primary site navigation — shared by SiteHeader and generated from the same
 * curated collection entry points as the /coleccion/ hub.
 */
import { FEATURED_ENTRIES } from './catalog-hub';

export type NavLink = {
  href: string;
  label: string;
  labelEn?: string;
};

export type NavSection = {
  id: string;
  label: string;
  labelEn?: string;
  href?: string;
  links: NavLink[];
};

/** Top-level links always reachable without JavaScript. */
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', labelEn: 'Home' },
  { href: '/coleccion/', label: 'Colección', labelEn: 'Collection' },
  { href: '/buscar/', label: 'Buscar', labelEn: 'Search' },
  { href: '/blog/', label: 'Blog', labelEn: 'Blog' },
  { href: '/noticias/', label: 'Noticias', labelEn: 'News' },
  { href: '/glosario/', label: 'Glosario', labelEn: 'Glossary' },
  { href: '/contacto/', label: 'Contacto', labelEn: 'Contact' },
];

/** Featured collection destinations for drawer + homepage browse strip. */
export const COLLECTION_LINKS: NavLink[] = FEATURED_ENTRIES.map((entry) => ({
  href: entry.href,
  label: entry.title,
}));

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'coleccion',
    label: 'Colección virtual',
    labelEn: 'Virtual collection',
    href: '/coleccion/',
    links: COLLECTION_LINKS,
  },
  {
    id: 'editorial',
    label: 'Editorial',
    labelEn: 'Editorial',
    links: [
      { href: '/blog/', label: 'Blog' },
      { href: '/noticias/', label: 'Noticias', labelEn: 'News' },
      { href: '/#logros-heading', label: 'Logros del Mes', labelEn: 'Monthly milestones' },
      { href: '/glosario/', label: 'Glosario', labelEn: 'Glossary' },
    ],
  },
];
