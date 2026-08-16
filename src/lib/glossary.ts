import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from './site';

export type GlossaryEntry = CollectionEntry<'glosario'>;

export const GLOSSARY_PATH = '/glosario/';
export const GLOSSARY_TITLE = 'Glosario de Numismática y Notafilia';
export const GLOSSARY_DESCRIPTION =
  'Glosario bilingüe de más de 90 términos de numismática y notafilia: monedas, billetes, diseño, producción y coleccionismo.';
export const GLOSSARY_KEYWORDS = [
  'glosario numismatico',
  'glosario notafilia',
  'terminos de billetes',
  'terminos de monedas',
  'viñeta',
  'guilloche',
  'specimen',
  'pick number',
  'banca libre',
  'cospel',
  'planchuela',
  'escala sheldon',
  'escripofilia',
  'macuquina',
  'billete mula',
];

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

export function glossaryTermUrl(slug: string): string {
  return `${SITE}${glossaryTermPath(slug)}`;
}

export function glossaryIndexUrl(): string {
  return `${SITE}${GLOSSARY_PATH}`;
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
      },
    ],
  };
}
