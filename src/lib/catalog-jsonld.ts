/**
 * Enrich catalog page JSON-LD at render time:
 * - Keep CreativeWork (never Product) for pieces not for sale
 * - Ensure additionalProperty on CreativeWork nodes
 * - Merge structured `record` metadata into CreativeWork when present
 * - Add ItemList alongside CollectionPage hasPart for catalog indexes
 */

import { recordPropertyValues, type CatalogRecord } from './catalog-record';

type JsonLdNode = Record<string, unknown>;

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

function ensureAdditionalProperty(node: JsonLdNode): void {
  const existing = Array.isArray(node.additionalProperty)
    ? (node.additionalProperty as JsonLdNode[])
    : [];
  const names = new Set(
    existing
      .map((p) => (typeof p?.name === 'string' ? p.name : ''))
      .filter(Boolean),
  );

  const extras: JsonLdNode[] = [];
  if (!names.has('Disponibilidad')) {
    extras.push(property('Disponibilidad', 'No está a la venta — colección privada documentada'));
  }
  if (!names.has('Tipo de ficha')) {
    extras.push(property('Tipo de ficha', 'Registro de colección virtual'));
  }
  if (typeof node.creditText === 'string' && !names.has('Crédito')) {
    extras.push(property('Crédito', node.creditText));
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
 * Returns enriched JSON-LD suitable for BaseHead. Mutates a deep clone only.
 */
export function enrichCatalogJsonLd(jsonLd: unknown, record?: CatalogRecord): unknown {
  if (!jsonLd || typeof jsonLd !== 'object') return jsonLd;

  const clone = structuredClone(jsonLd) as JsonLdNode;
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
      ensureAdditionalProperty(node);
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
