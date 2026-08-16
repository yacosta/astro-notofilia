export const POLYMER_COUNTRY: Record<string, string>;
export const HUB_PATHS: Set<string>;
export const INVENTORY_VOCABULARY_ES: string;
export const INVENTORY_VOCABULARY_EN: string;

export type CatalogRole = 'hub' | 'profile' | 'piece';

export type InventoryEntry = {
  path?: string;
  title?: string;
  ogType?: string;
  template?: string;
  jsonLd?: unknown;
  record?: { country?: string; kind?: string };
  keywords?: string[];
};

export type CollectionStats = {
  billetes: number;
  monedas: number;
  paises: number;
  fichas: number;
  paginas: number;
};

export function isCatalogHub(catalogPath?: string, ogType?: string): boolean;
export function isCatalogProfile(catalogPath?: string, ogType?: string): boolean;
export function catalogRole(catalogPath?: string, ogType?: string): CatalogRole;
export function normalizeCatalogCountry(raw: unknown, catalogPath: string): string;
export function isCoinEntry(catalogPath?: string, recordKind?: string): boolean;
export function countNotesInEntry(entry: InventoryEntry): number;
export function computeInventoryStats(entries: InventoryEntry[]): CollectionStats;
export function loadCatalogEntriesFromDisk(catalogDir?: string): InventoryEntry[];
export function getCollectionStatsFromDisk(catalogDir?: string): CollectionStats;
