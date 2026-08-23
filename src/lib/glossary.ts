import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from './site';

export type GlossaryEntry = CollectionEntry<'glosario'>;

export const GLOSSARY_PATH = '/glosario/';
export const GLOSSARY_PATH_EN = '/en/glossary/';
export const GLOSSARY_TITLE = 'Glosario de Numismática y Notafilia';
export const GLOSSARY_TITLE_EN = 'Glossary of Numismatics and Notaphily';
export const GLOSSARY_DESCRIPTION =
  'Glosario bilingüe de más de 90 términos de numismática y notafilia: monedas, billetes, diseño, producción y coleccionismo.';
export const GLOSSARY_DESCRIPTION_EN =
  'Bilingual glossary of 90+ numismatics and notaphily terms: coins, banknotes, design, production, and collecting.';

/** Same slugify as the legacy glossary (hash ids and related-link fragments). */
export function slugifyGlossary(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function glossaryTermPath(slug: string): string {
  return `${GLOSSARY_PATH}${slug}/`;
}

export function glossaryTermPathEn(termEn: string): string {
  return `${GLOSSARY_PATH_EN}${slugifyGlossary(termEn)}/`;
}

export function glossaryTermUrl(slug: string): string {
  return `${SITE}${glossaryTermPath(slug)}`;
}

export function glossaryTermUrlEn(termEn: string): string {
  return `${SITE}${glossaryTermPathEn(termEn)}`;
}

export function glossaryIndexUrl(): string {
  return `${SITE}${GLOSSARY_PATH}`;
}

export function glossaryIndexUrlEn(): string {
  return `${SITE}${GLOSSARY_PATH_EN}`;
}

export function definitionEs(entry: GlossaryEntry): string {
  return entry.body.trim();
}

/** Fragment id on the index — preserves /glosario/#c-day style catalog links. */
export function glossaryAnchor(entry: GlossaryEntry): string {
  return slugifyGlossary(entry.data.termEs);
}

export async function getGlossaryTerms(): Promise<GlossaryEntry[]> {
  const terms = await getCollection('glosario');
  const sorted = terms.sort((a, b) => a.data.termEs.localeCompare(b.data.termEs, 'es'));
  const lookup = buildGlossaryLookup(sorted);
  for (const term of sorted) {
    for (const name of term.data.seeAlso) {
      if (!lookup.get(name) && !lookup.get(slugifyGlossary(name))) {
        throw new Error(`Unknown glossary seeAlso "${name}" on ${term.id}`);
      }
    }
  }
  return sorted;
}

export function glossaryCategories(terms: GlossaryEntry[]): string[] {
  return [...new Set(terms.map((term) => term.data.category))];
}

export function buildGlossaryLookup(terms: GlossaryEntry[]): Map<string, GlossaryEntry> {
  const lookup = new Map<string, GlossaryEntry>();
  for (const term of terms) {
    lookup.set(term.data.termEs, term);
    lookup.set(term.id, term);
    lookup.set(slugifyGlossary(term.data.termEs), term);
    for (const alias of term.data.aliases ?? []) {
      lookup.set(alias, term);
    }
  }
  return lookup;
}

export function resolveSeeAlso(
  names: string[],
  lookup: Map<string, GlossaryEntry>,
): Array<{ href: string; label: string }> {
  return names.flatMap((name) => {
    const match = lookup.get(name) ?? lookup.get(slugifyGlossary(name));
    if (!match) return [];
    return [{ href: glossaryTermPath(match.id), label: match.data.termEs }];
  });
}

export function resolveSeeAlsoEn(
  names: string[],
  lookup: Map<string, GlossaryEntry>,
): Array<{ href: string; label: string }> {
  return names.flatMap((name) => {
    const match = lookup.get(name) ?? lookup.get(slugifyGlossary(name));
    if (!match) return [];
    return [{ href: glossaryTermPathEn(match.data.termEn), label: match.data.termEn }];
  });
}

export async function getGlossaryTermsEn(): Promise<GlossaryEntry[]> {
  const terms = await getGlossaryTerms();
  return [...terms].sort((a, b) => a.data.termEn.localeCompare(b.data.termEn, 'en'));
}

export function glossaryIndexJsonLd(terms: GlossaryEntry[]) {
  const url = glossaryIndexUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Glosario', item: url },
        ],
      },
      {
        '@type': 'DefinedTermSet',
        '@id': `${url}#glossary`,
        name: GLOSSARY_TITLE,
        url,
        inLanguage: 'es',
        hasDefinedTerm: terms.map((term) => ({
          '@type': 'DefinedTerm',
          '@id': `${glossaryTermUrl(term.id)}#term`,
          name: term.data.termEs,
          alternateName: term.data.termEn,
          description: definitionEs(term),
          url: glossaryTermUrl(term.id),
          inDefinedTermSet: `${url}#glossary`,
        })),
      },
    ],
  };
}

export function glossaryIndexJsonLdEn(terms: GlossaryEntry[]) {
  const url = glossaryIndexUrlEn();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/en/` },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: url },
        ],
      },
      {
        '@type': 'DefinedTermSet',
        '@id': `${url}#glossary`,
        name: GLOSSARY_TITLE_EN,
        url,
        inLanguage: 'en',
        hasDefinedTerm: terms.map((term) => ({
          '@type': 'DefinedTerm',
          '@id': `${glossaryTermUrlEn(term.data.termEn)}#term`,
          name: term.data.termEn,
          alternateName: term.data.termEs,
          description: term.data.definitionEn,
          url: glossaryTermUrlEn(term.data.termEn),
          inDefinedTermSet: `${url}#glossary`,
        })),
      },
    ],
  };
}

export function glossaryTermJsonLdEn(entry: GlossaryEntry) {
  const url = glossaryTermUrlEn(entry.data.termEn);
  const setUrl = glossaryIndexUrlEn();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/en/` },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: setUrl },
          { '@type': 'ListItem', position: 3, name: entry.data.termEn, item: url },
        ],
      },
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name: entry.data.termEn,
        alternateName: entry.data.termEs,
        description: entry.data.definitionEn,
        url,
        inLanguage: 'en',
        inDefinedTermSet: `${setUrl}#glossary`,
        ...(entry.data.wikipediaUrl ? { sameAs: entry.data.wikipediaUrl } : {}),
      },
    ],
  };
}

export function glossaryTermJsonLd(entry: GlossaryEntry) {
  const url = glossaryTermUrl(entry.id);
  const setUrl = glossaryIndexUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Glosario', item: setUrl },
          { '@type': 'ListItem', position: 3, name: entry.data.termEs, item: url },
        ],
      },
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name: entry.data.termEs,
        alternateName: entry.data.termEn,
        description: definitionEs(entry),
        url,
        inLanguage: 'es',
        inDefinedTermSet: `${setUrl}#glossary`,
        ...(entry.data.wikipediaUrl ? { sameAs: entry.data.wikipediaUrl } : {}),
      },
    ],
  };
}
