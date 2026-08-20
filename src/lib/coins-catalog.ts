import fs from 'node:fs';
import path from 'node:path';
import type { CatalogCard } from './catalog-record';

export type CoinPiece = {
  path: string;
  title: string;
  description: string;
  image?: string;
  year: number | null;
  denomination?: string;
  catalogRef?: string;
  issuer?: string;
  country?: string;
};

export type GroupedCoinCards = {
  name: string;
  kicker: string;
  cards: CatalogCard[];
};

const REIGN_ORDER = [
  'Provincias Unidas de los Países Bajos',
  'Reinado de Felipe V',
  'Reinado de Carlos III',
  'Reinado de Carlos IV',
  'Reinado de Fernando VII',
] as const;

const COLONIAL_KICKER = 'Virreinato de la Nueva Granada · Ceca de Santa Fe de Bogotá';
const NETHERLANDS_KICKER = 'República Neerlandesa · Ceca provincial de Utrecht';

type CatalogIndex = {
  items: Array<{
    path: string;
    title: string;
    description?: string;
    image?: string;
    role?: string;
    kind?: string;
    year?: number | null;
    denomination?: string;
    catalogRef?: string;
    issuer?: string;
    country?: string;
  }>;
};

type HubFile = {
  record?: {
    cards?: CatalogCard[];
  };
};

export function coinReignFor(title: string, href = ''): (typeof REIGN_ORDER)[number] {
  const blob = `${title} ${href}`.toLowerCase();
  if (
    blob.includes('utrecht') ||
    blob.includes('ducado-oro-utrecht') ||
    blob.includes('paises bajos') ||
    blob.includes('provincias unidas') ||
    blob.includes('1761-utrecht-gold-ducat')
  ) {
    return 'Provincias Unidas de los Países Bajos';
  }
  if (blob.includes('felipe')) return 'Reinado de Felipe V';
  if (blob.includes('carlos iii') || blob.includes('carlos-iii')) return 'Reinado de Carlos III';
  if (blob.includes('carlos iv') || blob.includes('carlos-iv')) return 'Reinado de Carlos IV';
  if (blob.includes('fernando')) return 'Reinado de Fernando VII';
  return 'Reinado de Felipe V';
}

export function withCoinGroup(card: CatalogCard): CatalogCard {
  const group = card.group || coinReignFor(card.title, card.href);
  const groupKicker =
    card.groupKicker ||
    (group === 'Provincias Unidas de los Países Bajos' ? NETHERLANDS_KICKER : COLONIAL_KICKER);
  return {
    ...card,
    group,
    groupKicker,
  };
}

export function loadCoinPieces(
  indexPath = path.join(process.cwd(), 'public/data/catalog-index.json'),
): CoinPiece[] {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as CatalogIndex;
  return (index.items ?? [])
    .filter((item) => item.role === 'piece' && item.kind === 'coin')
    .map((item) => ({
      path: item.path,
      title: item.title,
      description: item.description || '',
      image: item.image,
      year: item.year ?? null,
      denomination: item.denomination,
      catalogRef: item.catalogRef,
      issuer: item.issuer,
      country: item.country,
    }));
}

export function loadColonialCoinCards(
  hubPath = path.join(process.cwd(), 'src/content/catalog/moneda-colonial-espanola.json'),
): CatalogCard[] {
  const hub = JSON.parse(fs.readFileSync(hubPath, 'utf8')) as HubFile;
  return (hub.record?.cards ?? []).map(withCoinGroup);
}

/** Prefer hub cards (images/alt) and include any indexed coins missing from the hub. */
export function coinCatalogCards(): CatalogCard[] {
  const hubCards = loadColonialCoinCards();
  const known = new Set(hubCards.map((card) => card.href));
  const extras = loadCoinPieces()
    .filter((piece) => !known.has(piece.path))
    .map((piece) =>
      withCoinGroup({
        href: piece.path,
        title: piece.title,
        denomination: piece.denomination,
        year: piece.year ? String(piece.year) : undefined,
        image: piece.image,
        alt: piece.title,
      }),
    );
  return [...hubCards, ...extras];
}

export function groupedCoinCards(cards = coinCatalogCards()): GroupedCoinCards[] {
  const buckets = new Map<string, GroupedCoinCards>();
  for (const name of REIGN_ORDER) {
    buckets.set(name, { name, kicker: COLONIAL_KICKER, cards: [] });
  }
  for (const card of cards) {
    const grouped = withCoinGroup(card);
    const name = grouped.group || 'Otras piezas';
    const existing = buckets.get(name);
    if (existing) {
      existing.cards.push(grouped);
      continue;
    }
    buckets.set(name, {
      name,
      kicker: grouped.groupKicker || COLONIAL_KICKER,
      cards: [grouped],
    });
  }
  return [...buckets.values()].filter((group) => group.cards.length > 0);
}
