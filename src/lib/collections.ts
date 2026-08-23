import type { PostCollection, PublishedPost } from './posts';
import { SITE } from './site';
import { CLAIM_LABELS, claimNoteFor, isClaimKind } from './claims';
import { EDITORIAL_POLICY_URL, EDITORIAL_TEAM, personJsonLd } from './editorial';
import { CLAIM_LABELS_EN, CLAIM_NOTES_EN } from './ui-i18n';
import { toIsoDate } from './dates';

export type CollectionMeta = {
  id: PostCollection;
  label: string;
  labelEn: string;
  heading: string;
  headingEn: string;
  intro: string;
  introEn: string;
  emptyMessage: string;
  emptyMessageEn: string;
  title: string;
  description: string;
  keywords: string[];
  showSource: boolean;
  sourceLinkLabel: string;
  sourceLinkLabelEn: string;
  backLabel: string;
  backLabelEn: string;
  jsonLdName: string;
  jsonLdDescription: string;
  /** schema.org type for individual posts in this section. */
  articleType: 'NewsArticle' | 'BlogPosting' | 'Article';
};

export const COLLECTIONS: Record<PostCollection, CollectionMeta> = {
  blog: {
    id: 'blog',
    label: 'Blog',
    labelEn: 'Blog',
    heading: 'Blog de Numismática y Notafilia',
    headingEn: 'Numismatics and Notaphily Blog',
    intro:
      'Guías y artículos para aprender sobre el coleccionismo de billetes y monedas: historia, técnica y consejos prácticos.',
    introEn:
      'Guides and articles on collecting banknotes and coins: history, technique, and practical advice.',
    emptyMessage: 'Muy pronto publicaremos las primeras guías.',
    emptyMessageEn: 'The first guides will be published soon.',
    title: 'Blog de Numismática y Notafilia · Notofilia',
    description:
      'Guías de numismática y notafilia: cómo empezar una colección de billetes, historia monetaria de Colombia y Puerto Rico y consejos para coleccionistas.',
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
    sourceLinkLabelEn: 'Read the original source',
    backLabel: 'Volver al Blog',
    backLabelEn: 'Back to the Blog',
    jsonLdName: 'Blog de Numismática y Notafilia',
    jsonLdDescription:
      'Guías y artículos sobre numismática y notafilia: cómo coleccionar billetes y monedas, historia monetaria y consejos para el coleccionista.',
    articleType: 'BlogPosting',
  },
  logros: {
    id: 'logros',
    label: 'Logros del Mes',
    labelEn: 'Monthly milestones',
    heading: 'Logros del Mes — Colección Virtual',
    headingEn: 'Monthly Milestones — Virtual Collection',
    intro:
      'Un resumen mensual de lo nuevo en la Colección Virtual de Notofilia: piezas añadidas, fichas publicadas y avances del catálogo.',
    introEn:
      'A monthly summary of what is new in Notofilia’s Virtual Collection: pieces added, records published, and catalog progress.',
    emptyMessage: 'Muy pronto publicaremos el primer resumen mensual de la Colección Virtual.',
    emptyMessageEn: 'The first monthly summary of the Virtual Collection will be published soon.',
    title: 'Logros del Mes — Colección Virtual · Notofilia',
    description:
      'Logros mensuales de la Colección Virtual de Notofilia: nuevas fichas, billetes y monedas incorporados al catálogo digital.',
    keywords: [
      'colección virtual Notofilia',
      'logros del mes',
      'catálogo de billetes',
      'catálogo de monedas',
      'notafilia',
      'numismática',
      'colección privada',
    ],
    showSource: false,
    sourceLinkLabel: 'Leer la fuente original',
    sourceLinkLabelEn: 'Read the original source',
    backLabel: 'Volver a Logros del Mes',
    backLabelEn: 'Back to Monthly milestones',
    jsonLdName: 'Logros del Mes — Colección Virtual',
    jsonLdDescription:
      'Resúmenes mensuales de avances en la Colección Virtual de Notofilia: nuevas piezas y fichas del catálogo.',
    articleType: 'BlogPosting',
  },
  noticias: {
    id: 'noticias',
    label: 'Noticias',
    labelEn: 'News',
    heading: 'Noticias de Numismática y Notafilia',
    headingEn: 'Numismatics and Notaphily News',
    intro: 'Una selección de noticias, hallazgos y notas sobre monedas y billetes históricos.',
    introEn: 'A selection of news, finds, and notes on historical coins and banknotes.',
    emptyMessage: 'Muy pronto publicaremos las primeras noticias.',
    emptyMessageEn: 'The first news items will be published soon.',
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
    sourceLinkLabelEn: 'Read the original article',
    backLabel: 'Volver a Noticias',
    backLabelEn: 'Back to News',
    jsonLdName: 'Noticias de Numismática y Notafilia',
    jsonLdDescription:
      'Noticias y artículos sobre numismática y notafilia: subastas, emisiones y hallazgos para coleccionistas.',
    articleType: 'NewsArticle',
  },
};

export function isPostCollection(value: string): value is PostCollection {
  return value === 'blog' || value === 'noticias' || value === 'logros';
}

export function collectionIndexJsonLd(
  meta: CollectionMeta,
  posts: PublishedPost[] = [],
) {
  const url = `${SITE}/${meta.id}/`;
  const itemList =
    posts.length > 0
      ? {
          '@type': 'ItemList',
          name: meta.jsonLdName,
          numberOfItems: posts.length,
          itemListElement: posts.slice(0, 40).map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE}/${meta.id}/${post.id}/`,
            name: post.data.title,
          })),
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
        ...(itemList ? { mainEntity: { '@id': `${url}#itemlist` } } : {}),
      },
      ...(itemList
        ? [
            {
              ...itemList,
              '@id': `${url}#itemlist`,
            },
          ]
        : []),
    ],
  };
}

type PostData = {
  title: string;
  excerpt: string;
  publishedAt: Date;
  updatedAt?: Date;
  cover?: string;
  source?: string;
  sourceUrl?: string;
  reviewedBy?: string;
  claimKind?: string;
  claimNote?: string;
  claimCurrency?: string;
  claimValuationDate?: Date;
  claimEvidenceUrl?: string;
  primarySources?: Array<{ label: string; url: string }>;
  corrections?: Array<{ date: Date; text: string }>;
};

export function articleJsonLd(meta: CollectionMeta, post: PublishedPost, iso: string) {
  // CollectionEntry union widens Zod fields to optional; values are required at runtime.
  const d = post.data as PostData;
  const path = `/${meta.id}/${post.id}/`;
  const pageUrl = SITE + path;
  const modified = d.updatedAt ? toIsoDate(d.updatedAt) : iso;
  const authorName = d.reviewedBy?.trim() || EDITORIAL_TEAM.name;
  const author = personJsonLd(authorName);

  const citations: Array<string | Record<string, unknown>> = [];
  if (d.sourceUrl) {
    citations.push({
      '@type': 'CreativeWork',
      name: d.source ? `Fuente: ${d.source}` : 'Fuente primaria',
      url: d.sourceUrl,
    });
  }
  for (const src of d.primarySources ?? []) {
    citations.push({
      '@type': 'CreativeWork',
      name: src.label,
      url: src.url,
    });
  }
  if (d.claimEvidenceUrl) {
    citations.push({
      '@type': 'CreativeWork',
      name: 'Evidencia de valoración o remate',
      url: d.claimEvidenceUrl,
    });
  }

  const claimMeta =
    d.claimKind && isClaimKind(d.claimKind)
      ? {
          about: {
            '@type': 'Thing',
            name: CLAIM_LABELS[d.claimKind],
            description: claimNoteFor(d.claimKind, d.claimNote),
          },
          ...(d.claimCurrency
            ? {
                additionalProperty: [
                  {
                    '@type': 'PropertyValue',
                    name: 'Moneda de la cifra citada',
                    value: d.claimCurrency,
                  },
                  ...(d.claimValuationDate
                    ? [
                        {
                          '@type': 'PropertyValue',
                          name: 'Fecha de la valoración citada',
                          value: toIsoDate(d.claimValuationDate),
                        },
                      ]
                    : []),
                ],
              }
            : {}),
        }
      : {};

  return {
    '@context': 'https://schema.org',
    '@type': meta.articleType,
    headline: d.title,
    description: d.excerpt,
    datePublished: iso,
    dateModified: modified,
    inLanguage: 'es',
    ...(d.cover ? { image: `${SITE}/uploads/${d.cover}.jpg` } : {}),
    author,
    editor: personJsonLd(authorName),
    publisher: {
      '@type': 'Organization',
      name: 'Notofilia',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    isPartOf: { '@id': `${SITE}/#website` },
    ...(d.sourceUrl ? { isBasedOn: d.sourceUrl } : {}),
    ...(citations.length > 0 ? { citation: citations } : {}),
    ...claimMeta,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.claim-callout'],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: meta.label, item: `${SITE}/${meta.id}/` },
        { '@type': 'ListItem', position: 3, name: d.title, item: pageUrl },
      ],
    },
    publishingPrinciples: EDITORIAL_POLICY_URL,
  };
}

const EN_EDITORIAL_POLICY_URL = `${SITE}/en/editorial/`;
const EN_EDITORIAL_TEAM_URL = `${SITE}/en/editorial/team/`;

/** English collection-index JSON-LD. Does not change Spanish labels on ES routes. */
export function collectionIndexJsonLdEn(
  opts: {
    label: string;
    jsonLdName: string;
    jsonLdDescription: string;
    path: string;
    posts: Array<{ title: string; url: string }>;
  },
) {
  const url = `${SITE}${opts.path}`;
  const itemList =
    opts.posts.length > 0
      ? {
          '@type': 'ItemList',
          name: opts.jsonLdName,
          numberOfItems: opts.posts.length,
          itemListElement: opts.posts.slice(0, 40).map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: post.url.startsWith('http') ? post.url : `${SITE}${post.url}`,
            name: post.title,
          })),
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: opts.jsonLdName,
        url,
        description: opts.jsonLdDescription,
        inLanguage: 'en',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/en/` },
            { '@type': 'ListItem', position: 2, name: opts.label, item: url },
          ],
        },
        ...(itemList ? { mainEntity: { '@id': `${url}#itemlist` } } : {}),
      },
      ...(itemList ? [{ ...itemList, '@id': `${url}#itemlist` }] : []),
    ],
  };
}

/** English article JSON-LD for `/en/blog/` (and future `/en/news/`) posts. */
export function articleJsonLdEn(
  meta: CollectionMeta,
  post: { data: PostData },
  iso: string,
  path: string,
) {
  const d = post.data;
  const pageUrl = SITE + path;
  const modified = d.updatedAt ? toIsoDate(d.updatedAt) : iso;
  const authorName = d.reviewedBy?.trim() || EDITORIAL_TEAM.name;
  const author = {
    ...personJsonLd(authorName),
    url: EN_EDITORIAL_TEAM_URL,
  };

  const citations: Array<string | Record<string, unknown>> = [];
  if (d.sourceUrl) {
    citations.push({
      '@type': 'CreativeWork',
      name: d.source ? `Source: ${d.source}` : 'Primary source',
      url: d.sourceUrl,
    });
  }
  for (const src of d.primarySources ?? []) {
    citations.push({
      '@type': 'CreativeWork',
      name: src.label,
      url: src.url,
    });
  }
  if (d.claimEvidenceUrl) {
    citations.push({
      '@type': 'CreativeWork',
      name: 'Valuation or hammer evidence',
      url: d.claimEvidenceUrl,
    });
  }

  const claimMeta =
    d.claimKind && isClaimKind(d.claimKind)
      ? {
          about: {
            '@type': 'Thing',
            name: CLAIM_LABELS_EN[d.claimKind],
            description: d.claimNote || CLAIM_NOTES_EN[d.claimKind],
          },
          ...(d.claimCurrency
            ? {
                additionalProperty: [
                  {
                    '@type': 'PropertyValue',
                    name: 'Currency of the cited figure',
                    value: d.claimCurrency,
                  },
                  ...(d.claimValuationDate
                    ? [
                        {
                          '@type': 'PropertyValue',
                          name: 'Date of the cited valuation',
                          value: toIsoDate(d.claimValuationDate),
                        },
                      ]
                    : []),
                ],
              }
            : {}),
        }
      : {};

  return {
    '@context': 'https://schema.org',
    '@type': meta.articleType,
    headline: d.title,
    description: d.excerpt,
    datePublished: iso,
    dateModified: modified,
    inLanguage: 'en',
    ...(d.cover ? { image: `${SITE}/uploads/${d.cover}.jpg` } : {}),
    author,
    editor: author,
    publisher: {
      '@type': 'Organization',
      name: 'Notofilia',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    isPartOf: { '@id': `${SITE}/en/#website` },
    ...(d.sourceUrl ? { isBasedOn: d.sourceUrl } : {}),
    ...(citations.length > 0 ? { citation: citations } : {}),
    ...claimMeta,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.claim-callout'],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/en/` },
        { '@type': 'ListItem', position: 2, name: meta.labelEn, item: `${SITE}${path.split('/').slice(0, 3).join('/')}/` },
        { '@type': 'ListItem', position: 3, name: d.title, item: pageUrl },
      ],
    },
    publishingPrinciples: EN_EDITORIAL_POLICY_URL,
  };
}
