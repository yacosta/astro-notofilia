import type { PostCollection, PublishedPost } from './posts';
import { SITE } from './site';

export type CollectionMeta = {
  id: PostCollection;
  label: string;
  heading: string;
  intro: string;
  emptyMessage: string;
  title: string;
  description: string;
  keywords: string[];
  showSource: boolean;
  sourceLinkLabel: string;
  backLabel: string;
  jsonLdName: string;
  jsonLdDescription: string;
};

export const COLLECTIONS: Record<PostCollection, CollectionMeta> = {
  blog: {
    id: 'blog',
    label: 'Blog',
    heading: 'Blog de Numismática y Notafilia',
    intro:
      'Guías y artículos para aprender sobre el coleccionismo de billetes y monedas: historia, técnica y consejos prácticos.',
    emptyMessage: 'Muy pronto publicaremos las primeras guías.',
    title: 'Blog de Numismática y Notafilia · Notofilia',
    description:
      'Guías sobre numismática y notafilia: cómo empezar una colección de billetes, historia monetaria de Colombia y Puerto Rico y consejos para coleccionistas.',
    keywords: [
      'colección de billetes',
      'colección de monedas',
      'billetes de la república de colombia',
      'diferencia entre numismática y notafilia',
      'cómo empezar una colección de billetes',
      'guía para principiantes colección billetes colombia',
      'historia billetes de colombia banco república',
      'personajes en los billetes de colombia',
      'cómo identificar billetes falsos colombia',
    ],
    showSource: false,
    sourceLinkLabel: 'Leer la fuente original',
    backLabel: 'Volver al Blog',
    jsonLdName: 'Blog de Numismática y Notafilia',
    jsonLdDescription:
      'Guías y artículos sobre numismática y notafilia: cómo coleccionar billetes y monedas, historia monetaria y consejos para el coleccionista.',
  },
  noticias: {
    id: 'noticias',
    label: 'Noticias',
    heading: 'Noticias de Numismática y Notafilia',
    intro: 'Una selección de noticias, hallazgos y notas sobre monedas y billetes históricos.',
    emptyMessage: 'Muy pronto publicaremos las primeras noticias.',
    title: 'Noticias de Numismática y Notafilia · Notofilia',
    description:
      'Noticias y artículos sobre numismática y notafilia: emisiones, hallazgos y valor de billetes y monedas de colección de Colombia y del mundo.',
    keywords: [
      'billetes raros',
      'monedas raras',
      'billetes de la república de colombia',
      'diferencia entre numismática y notafilia',
      'cómo empezar una colección de billetes',
      'guía para principiantes colección billetes colombia',
      'billetes más valiosos de colombia 2026',
      'personajes en los billetes de colombia',
      'cómo identificar billetes falsos colombia',
    ],
    showSource: true,
    sourceLinkLabel: 'Leer la nota original',
    backLabel: 'Volver a Noticias',
    jsonLdName: 'Noticias de Numismática y Notafilia',
    jsonLdDescription:
      'Noticias y artículos sobre numismática y notafilia: subastas, emisiones y hallazgos para coleccionistas.',
  },
};

export function isPostCollection(value: string): value is PostCollection {
  return value === 'blog' || value === 'noticias';
}

export function collectionIndexJsonLd(meta: CollectionMeta) {
  const url = `${SITE}/${meta.id}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.jsonLdName,
    url,
    description: meta.jsonLdDescription,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: meta.label, item: url },
      ],
    },
  };
}

export function articleJsonLd(meta: CollectionMeta, post: PublishedPost, iso: string) {
  // CollectionEntry union widens Zod fields to optional; values are required at runtime.
  const d = post.data as {
    title: string;
    excerpt: string;
    publishedAt: Date;
    cover?: string;
    sourceUrl?: string;
  };
  const path = `/${meta.id}/${post.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: d.title,
    description: d.excerpt,
    datePublished: iso,
    ...(d.cover ? { image: `${SITE}/uploads/${d.cover}.jpg` } : {}),
    author: { '@type': 'Organization', name: 'Notofilia' },
    publisher: {
      '@type': 'Organization',
      name: 'Notofilia',
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + path },
    ...(d.sourceUrl ? { isBasedOn: d.sourceUrl } : {}),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: meta.label, item: `${SITE}/${meta.id}/` },
        { '@type': 'ListItem', position: 3, name: d.title, item: SITE + path },
      ],
    },
  };
}
