/**
 * ES ↔ EN URL pair registry — the only map of counterparts.
 * Consumers: BaseHead hreflang, language switcher (A6), sitemap (A5).
 *
 * Do not hardcode counterpart URLs in layouts or the switcher.
 * Catalog pairs are generated from `i18n.en.path` so A4 can append by
 * adding that field without editing this file twice.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type Locale = 'es' | 'en';

export type PairKind =
  | 'home'
  | 'collection' // hubs under /coleccion/ and /en/collection/
  | 'catalog' // individual fichas
  | 'news'
  | 'blog'
  | 'milestones'
  | 'glossary'
  | 'static';

export type Pair = {
  /** Spanish pathname, trailing slash (`/` for home). */
  es: string;
  /** English pathname, trailing slash (`/en/` for home). */
  en: string;
  kind: PairKind;
};

/** A3 seed pairs plus A4 static / section indexes actually shipped in English. */
export const SEED_PAIRS: readonly Pair[] = [
  { es: '/', en: '/en/', kind: 'home' },
  { es: '/coleccion/colombia/', en: '/en/collection/colombia/', kind: 'collection' },
  { es: '/coleccion/numismatica/', en: '/en/collection/numismatics/', kind: 'collection' },
  { es: '/noticias/', en: '/en/news/', kind: 'news' },
  { es: '/blog/', en: '/en/blog/', kind: 'blog' },
  { es: '/glosario/', en: '/en/glossary/', kind: 'glossary' },
  { es: '/editorial/', en: '/en/editorial/', kind: 'static' },
  { es: '/editorial/equipo/', en: '/en/editorial/team/', kind: 'static' },
  { es: '/contacto/', en: '/en/contact/', kind: 'static' },
  { es: '/nosotros/', en: '/en/about/', kind: 'static' },
  { es: '/coleccion/estados-unidos/', en: '/en/collection/united-states/', kind: 'collection' },
  { es: '/coleccion/espana/', en: '/en/collection/spain/', kind: 'collection' },
  { es: '/politica-privacidad-cookies/', en: '/en/privacy-cookies/', kind: 'static' },
  { es: '/j-s-g-boggs/', en: '/en/j-s-g-boggs/', kind: 'static' },
];

/**
 * Section-index prefixes from ARCHITECTURE.md §2.
 * Used only by `switchUrl` fallback — these are not registered pairs.
 * Longest prefix wins.
 */
const SECTION_INDEXES: ReadonlyArray<{ es: string; en: string }> = [
  { es: '/coleccion/numismatica/', en: '/en/collection/numismatics/' },
  { es: '/coleccion/estados-unidos/', en: '/en/collection/united-states/' },
  { es: '/coleccion/espana/', en: '/en/collection/spain/' },
  { es: '/coleccion/', en: '/en/collection/' },
  { es: '/noticias/', en: '/en/news/' },
  { es: '/nosotros/', en: '/en/about/' },
  { es: '/blog/', en: '/en/blog/' },
  { es: '/logros/', en: '/en/milestones/' },
  { es: '/glosario/', en: '/en/glossary/' },
  { es: '/editorial/', en: '/en/editorial/' },
  { es: '/contacto/', en: '/en/contact/' },
  { es: '/buscar/', en: '/en/search/' },
  { es: '/politica-privacidad-cookies/', en: '/en/privacy-cookies/' },
  { es: '/j-s-g-boggs/', en: '/en/j-s-g-boggs/' },
];

type CatalogFile = {
  path?: string;
  i18n?: { en?: { path?: string } };
  record?: { kind?: string; render?: string };
};

function pairKindFromCatalog(data: CatalogFile): PairKind {
  const kind = data.record?.kind;
  if (kind === 'banknote' || kind === 'coin' || kind === 'profile') return 'catalog';
  return 'collection';
}

function fromCatalog(): Pair[] {
  const catalogDir = path.join(process.cwd(), 'src/content/catalog');
  let files: string[];
  try {
    files = readdirSync(catalogDir).filter((file) => file.endsWith('.json'));
  } catch {
    return [];
  }

  const pairs: Pair[] = [];
  for (const file of files) {
    let data: CatalogFile;
    try {
      data = JSON.parse(readFileSync(path.join(catalogDir, file), 'utf8')) as CatalogFile;
    } catch {
      continue;
    }
    const es = typeof data.path === 'string' ? data.path : '';
    const en = typeof data.i18n?.en?.path === 'string' ? data.i18n.en.path : '';
    if (!es || !en) continue;
    pairs.push({
      es: normalizePath(es),
      en: normalizePath(en),
      kind: pairKindFromCatalog(data),
    });
  }
  return pairs;
}

/** Same slugify as `src/lib/glossary.ts` — kept local so this module stays fs-only. */
function slugifyGlossary(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function yamlScalar(raw: string, key: string): string | undefined {
  const re = new RegExp(`^${key}:\\s*(?:["']([^"']*)["']|(\\S.*))\\s*$`, 'm');
  const match = raw.match(re);
  if (!match) return undefined;
  const value = (match[1] ?? match[2] ?? '').trim();
  return value || undefined;
}

function fromGlossary(): Pair[] {
  const glossaryDir = path.join(process.cwd(), 'src/content/glosario');
  let files: string[];
  try {
    files = readdirSync(glossaryDir).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
  } catch {
    return [];
  }

  const pairs: Pair[] = [];
  for (const file of files) {
    let raw: string;
    try {
      raw = readFileSync(path.join(glossaryDir, file), 'utf8');
    } catch {
      continue;
    }
    const termEn = yamlScalar(raw, 'termEn');
    if (!termEn) continue;
    const id = file.replace(/\.md$/, '');
    pairs.push({
      es: normalizePath(`/glosario/${id}/`),
      en: normalizePath(`/en/glossary/${slugifyGlossary(termEn)}/`),
      kind: 'glossary',
    });
  }
  return pairs;
}

function fromMarkdownCollection(
  dirName: string,
  enPrefix: string,
  kind: PairKind,
): Pair[] {
  const dir = path.join(process.cwd(), 'src/content', dirName);
  let files: string[];
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
  } catch {
    return [];
  }

  const pairs: Pair[] = [];
  for (const file of files) {
    let raw: string;
    try {
      raw = readFileSync(path.join(dir, file), 'utf8');
    } catch {
      continue;
    }
    const pairEs = yamlScalar(raw, 'pairEs');
    if (!pairEs) continue;
    const slug = file.replace(/\.md$/, '');
    pairs.push({
      es: normalizePath(pairEs),
      en: normalizePath(`${enPrefix}${slug}/`),
      kind,
    });
  }
  return pairs;
}

function fromBlogEn(): Pair[] {
  return fromMarkdownCollection('blog-en', '/en/blog/', 'blog');
}

function fromNoticiasEn(): Pair[] {
  return fromMarkdownCollection('noticias-en', '/en/news/', 'news');
}

/** Strip query/hash; trailing slash; `/en` → `/en/`. Spanish home stays `/`. */
export function normalizePath(input: string): string {
  let value = (input ?? '').trim();
  const query = value.indexOf('?');
  if (query >= 0) value = value.slice(0, query);
  const hash = value.indexOf('#');
  if (hash >= 0) value = value.slice(0, hash);
  if (!value || value === '/') return '/';
  if (!value.startsWith('/')) value = `/${value}`;
  if (value === '/en') return '/en/';
  if (!value.endsWith('/')) value += '/';
  return value;
}

function assertEnPath(en: string): void {
  if (en !== '/en/' && !en.startsWith('/en/')) {
    throw new Error(`pairs.ts: English path must start with /en/: ${en}`);
  }
}

function registerPair(pair: Pair, esMap: Map<string, Pair>, enMap: Map<string, Pair>): void {
  const es = normalizePath(pair.es);
  const en = normalizePath(pair.en);
  assertEnPath(en);
  const normalized: Pair = { es, en, kind: pair.kind };

  const existingEs = esMap.get(es);
  const existingEn = enMap.get(en);

  if (existingEs && existingEs.en === en && existingEn && existingEn.es === es) {
    // Identical pair from seed + catalog (Colombia hub). Keep the first.
    return;
  }
  if (existingEs && existingEs.en !== en) {
    throw new Error(
      `pairs.ts: duplicate Spanish path ${es} (${existingEs.en} vs ${en})`,
    );
  }
  if (existingEn && existingEn.es !== es) {
    throw new Error(
      `pairs.ts: duplicate English path ${en} (${existingEn.es} vs ${es})`,
    );
  }
  if (existingEs || existingEn) {
    throw new Error(`pairs.ts: conflicting pair for ${es} ↔ ${en}`);
  }

  esMap.set(es, normalized);
  enMap.set(en, normalized);
}

const esMap = new Map<string, Pair>();
const enMap = new Map<string, Pair>();

for (const pair of SEED_PAIRS) registerPair(pair, esMap, enMap);
for (const pair of fromCatalog()) registerPair(pair, esMap, enMap);
for (const pair of fromGlossary()) registerPair(pair, esMap, enMap);
for (const pair of fromBlogEn()) registerPair(pair, esMap, enMap);
for (const pair of fromNoticiasEn()) registerPair(pair, esMap, enMap);

const ALL_PAIRS: readonly Pair[] = [...esMap.values()];

export function getPair(pathname: string): Pair | undefined {
  const pathName = normalizePath(pathname);
  return esMap.get(pathName) ?? enMap.get(pathName);
}

/** Counterpart URL, or undefined — no fallback. Used for hreflang. */
export function alternateUrl(pathname: string, locale: Locale): string | undefined {
  return getPair(pathname)?.[locale];
}

export function allPairs(): readonly Pair[] {
  return ALL_PAIRS;
}

export function localeFromPath(pathname: string): Locale {
  const pathName = normalizePath(pathname);
  return pathName === '/en/' || pathName.startsWith('/en/') ? 'en' : 'es';
}

function sectionIndexFor(pathname: string): string | undefined {
  const locale = localeFromPath(pathname);
  for (const section of SECTION_INDEXES) {
    const prefix = locale === 'en' ? section.en : section.es;
    if (pathname === prefix || pathname.startsWith(prefix)) return prefix;
  }
  return undefined;
}

/**
 * Switcher target: exact alternate if paired; else section index if that
 * index is paired; else homepage of `locale` (`/` or `/en/`).
 * Never 404s.
 */
export function switchUrl(pathname: string, locale: Locale): string {
  const pathName = normalizePath(pathname);
  const exact = getPair(pathName);
  if (exact) return exact[locale];

  const section = sectionIndexFor(pathName);
  if (section) {
    const sectionPair = getPair(section);
    if (sectionPair) return sectionPair[locale];
  }

  return locale === 'en' ? '/en/' : '/';
}
