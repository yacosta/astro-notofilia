/**
 * Enrich catalog page JSON-LD at render time:
 * - Keep CreativeWork (never Product) for pieces not for sale
 * - Ensure additionalProperty on CreativeWork nodes
 * - Merge structured `record` metadata into CreativeWork when present
 * - Add ItemList alongside CollectionPage hasPart for catalog indexes
 */

import { recordPropertyValues, type CatalogRecord } from './catalog-record';
import { SITE } from './site';
import type { Locale } from './ui-i18n';

type JsonLdNode = Record<string, unknown>;

const LEGACY_WWW = 'https://www.notofilia.com';

/** Rewrite legacy www absolute URLs to the canonical apex host. */
function canonicalizeHost(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.includes(LEGACY_WWW) ? value.split(LEGACY_WWW).join(SITE) : value;
  }
  if (Array.isArray(value)) return value.map(canonicalizeHost);
  if (value && typeof value === 'object') {
    const out: JsonLdNode = {};
    for (const [k, v] of Object.entries(value as JsonLdNode)) {
      out[k] = canonicalizeHost(v);
    }
    return out;
  }
  return value;
}

function asNodes(jsonLd: unknown): JsonLdNode[] {
  if (!jsonLd || typeof jsonLd !== 'object') return [];
  const root = jsonLd as JsonLdNode;
  if (Array.isArray(root['@graph'])) {
    return root['@graph'].filter((n): n is JsonLdNode => !!n && typeof n === 'object');
  }
  return [root];
}

function property(name: string, value: string) {
  return {
    '@type': 'PropertyValue',
    name,
    value,
  };
}

function ensureAdditionalProperty(node: JsonLdNode, locale: Locale = 'es'): void {
  const existing = Array.isArray(node.additionalProperty)
    ? (node.additionalProperty as JsonLdNode[])
    : [];
  const names = new Set(
    existing
      .map((p) => (typeof p?.name === 'string' ? p.name : ''))
      .filter(Boolean),
  );

  const availability =
    locale === 'en'
      ? { name: 'Availability', value: 'Not for sale — documented private collection' }
      : { name: 'Disponibilidad', value: 'No está a la venta — colección privada documentada' };
  const recordType =
    locale === 'en'
      ? { name: 'Record type', value: 'Virtual collection record' }
      : { name: 'Tipo de ficha', value: 'Registro de colección virtual' };
  const creditName = locale === 'en' ? 'Credit' : 'Crédito';

  const extras: JsonLdNode[] = [];
  if (!names.has(availability.name) && !names.has('Disponibilidad') && !names.has('Availability')) {
    extras.push(property(availability.name, availability.value));
  }
  if (!names.has(recordType.name) && !names.has('Tipo de ficha') && !names.has('Record type')) {
    extras.push(property(recordType.name, recordType.value));
  }
  if (typeof node.creditText === 'string' && !names.has(creditName) && !names.has('Crédito') && !names.has('Credit')) {
    extras.push(property(creditName, node.creditText));
  }

  if (extras.length > 0) {
    node.additionalProperty = [...existing, ...extras];
  }
}

function itemListFromHasPart(page: JsonLdNode): JsonLdNode | null {
  const parts = page.hasPart;
  if (!Array.isArray(parts) || parts.length === 0) return null;

  return {
    '@type': 'ItemList',
    name: typeof page.name === 'string' ? `Índice: ${page.name}` : 'Índice de catálogo',
    numberOfItems: parts.length,
    itemListElement: parts.map((part, index) => {
      const p = (part && typeof part === 'object' ? part : {}) as JsonLdNode;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: typeof p.name === 'string' ? p.name : undefined,
        url: typeof p.url === 'string' ? p.url : undefined,
        item: {
          '@type': 'CreativeWork',
          name: p.name,
          url: p.url,
        },
      };
    }),
  };
}

function mergeRecordProperties(node: JsonLdNode, record: CatalogRecord): void {
  const existing = Array.isArray(node.additionalProperty)
    ? (node.additionalProperty as JsonLdNode[])
    : [];
  const names = new Set(
    existing
      .map((p) => (typeof p?.name === 'string' ? p.name : ''))
      .filter(Boolean),
  );
  const extras = recordPropertyValues(record).filter((p) => !names.has(p.name));
  if (extras.length > 0) {
    node.additionalProperty = [...existing, ...extras];
  }
  if (!node.identifier) node.identifier = record.id;
  if (!node.name) node.name = record.title;
}

/**
 * Rewrite a Spanish catalog JSON-LD graph onto its English URL pair.
 * Used for individual fichas (CreativeWork), not hubs.
 */
export function localizeCatalogJsonLdForEn(
  jsonLd: unknown,
  opts: {
    esPath: string;
    enPath: string;
    name: string;
    description: string;
    creditText?: string;
  },
): unknown {
  if (!jsonLd || typeof jsonLd !== 'object') return jsonLd;

  const esAbs = `${SITE}${opts.esPath}`;
  const enAbs = `${SITE}${opts.enPath}`;

  const rewrite = (value: unknown): unknown => {
    if (typeof value === 'string') {
      if (value === esAbs || value === `${esAbs}#page`) {
        return value.replace(esAbs, enAbs);
      }
      if (value.startsWith(esAbs)) return enAbs + value.slice(esAbs.length);
      return value;
    }
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object') {
      const out: JsonLdNode = {};
      for (const [key, nested] of Object.entries(value as JsonLdNode)) {
        out[key] = rewrite(nested);
      }
      return out;
    }
    return value;
  };

  const clone = rewrite(structuredClone(jsonLd)) as JsonLdNode;
  for (const node of asNodes(clone)) {
    const types = Array.isArray(node['@type'])
      ? (node['@type'] as string[])
      : typeof node['@type'] === 'string'
        ? [node['@type']]
        : [];
    if (types.includes('CreativeWork')) {
      node.name = opts.name;
      node.description = opts.description;
      node.inLanguage = 'en';
      node.url = enAbs;
      if (opts.creditText) node.creditText = opts.creditText;
    }
    if (types.includes('ListItem') && node.item === enAbs) {
      node.name = opts.name;
    }
  }
  return clone;
}

/**
 * Returns enriched JSON-LD suitable for BaseHead. Mutates a deep clone only.
 */
export function enrichCatalogJsonLd(
  jsonLd: unknown,
  record?: CatalogRecord,
  locale: Locale = 'es',
): unknown {
  if (!jsonLd || typeof jsonLd !== 'object') return jsonLd;

  const clone = canonicalizeHost(structuredClone(jsonLd)) as JsonLdNode;
  const nodes = asNodes(clone);
  const extras: JsonLdNode[] = [];

  for (const node of nodes) {
    const types = Array.isArray(node['@type'])
      ? (node['@type'] as string[])
      : typeof node['@type'] === 'string'
        ? [node['@type']]
        : [];

    // Never emit Product for collection records.
    if (types.includes('Product')) {
      node['@type'] = types.map((t) => (t === 'Product' ? 'CreativeWork' : t));
      if (Array.isArray(node['@type']) && node['@type'].length === 1) {
        node['@type'] = node['@type'][0];
      }
    }

    if (types.includes('CreativeWork') || (node['@type'] === 'CreativeWork')) {
      ensureAdditionalProperty(node, locale);
      if (record) mergeRecordProperties(node, record);
    }

    if (types.includes('CollectionPage') || node['@type'] === 'CollectionPage') {
      const list = itemListFromHasPart(node);
      if (list) extras.push(list);
    }
  }

  if (Array.isArray(clone['@graph'])) {
    clone['@graph'] = [...(clone['@graph'] as JsonLdNode[]), ...extras];
    return clone;
  }

  if (extras.length === 0) return clone;

  return {
    '@context': clone['@context'] ?? 'https://schema.org',
    '@graph': [clone, ...extras],
  };
}
