import { z } from 'astro/zod';
import { SITE } from './site';

/** Image ref for catalog media (paths under /uploads or absolute). */
export const catalogImageSchema = z.object({
  src: z.string().min(1),
  srcWebp: z.string().optional(),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const catalogCrumbSchema = z.object({
  name: z.string().min(1),
  /** Omit href for the current page crumb. */
  href: z.string().startsWith('/').optional(),
});

export const catalogLinkSchema = z.object({
  href: z.string().startsWith('/'),
  title: z.string().min(1),
});

/** Visible sentinel when a ficha fact is unknown. Honesty is an authority signal. */
export const UNCONFIRMED_VALUE = 'no confirmado';

export const CATALOG_SOURCE_KINDS = [
  'central_bank',
  'printer',
  'museum',
  'auction',
  'catalog',
  'press',
  'specimen',
  'retail',
  'secondary',
] as const;

export type CatalogSourceKind = (typeof CATALOG_SOURCE_KINDS)[number];

export const catalogSourceKindSchema = z.enum(CATALOG_SOURCE_KINDS);

export const catalogSourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().optional(),
  note: z.string().optional(),
  /**
   * Citation class for the primary-to-commercial floor.
   * Required on re-sourced fichas (`record.resourced`).
   */
  kind: catalogSourceKindSchema.optional(),
});

/** Ficha fields that must remain visible even when the value is “no confirmado”. */
export const HONESTY_FIELD_KEYS = [
  'printRun',
  'knownVarieties',
  'circulationDates',
  'rarityBasis',
  'shownSpecimenState',
  'factualReviewDate',
] as const;

export type HonestyFieldKey = (typeof HONESTY_FIELD_KEYS)[number];

export const HONESTY_FIELD_LABELS: Record<HonestyFieldKey, string> = {
  printRun: 'Tirada',
  knownVarieties: 'Variedades conocidas',
  circulationDates: 'Fechas de circulación',
  rarityBasis: 'Base de la rareza',
  shownSpecimenState: 'Estado del ejemplar mostrado',
  factualReviewDate: 'Fecha de última revisión factual',
};

export const catalogCardSchema = z.object({
  href: z.string().min(1),
  title: z.string().min(1),
  denomination: z.string().optional(),
  year: z.string().optional(),
  image: z.string().optional(),
  imageWebp: z.string().optional(),
  alt: z.string().optional(),
  /** Optional heading used when a hub renders cards in thematic groups. */
  group: z.string().min(1).optional(),
  groupKicker: z.string().min(1).optional(),
});

/**
 * Structured metadata for an individual note/coin (or related) record.
 * Progressive: all fields optional except identity/title so legacy pages can
 * adopt the model field-by-field without rewriting the HTML template.
 */
export const catalogMetadataSchema = z.object({
  denomination: z.string().optional(),
  currency: z.string().optional(),
  issueDate: z.string().optional(),
  issuer: z.string().optional(),
  printer: z.string().optional(),
  catalogNumber: z.string().optional(),
  series: z.string().optional(),
  serialNumber: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  watermark: z.string().optional(),
  securityFeatures: z.array(z.string().min(1)).max(24).optional(),
  condition: z.string().optional(),
  gradingService: z.string().optional(),
  status: z
    .enum(['specimen', 'circulated', 'uncirculated', 'error', 'proof', 'other'])
    .optional(),
  acquisition: z.string().optional(),
  provenance: z.string().optional(),
  // Coin-oriented extras (still valid on mixed records)
  mint: z.string().optional(),
  composition: z.string().optional(),
  weight: z.string().optional(),
  diameter: z.string().optional(),
  edge: z.string().optional(),
  /** Print run. Use `UNCONFIRMED_VALUE` when unknown — do not omit on re-sourced fichas. */
  printRun: z.string().optional(),
  knownVarieties: z.string().optional(),
  circulationDates: z.string().optional(),
  rarityBasis: z.string().optional(),
  shownSpecimenState: z.string().optional(),
  /** ISO date (YYYY-MM-DD) or `UNCONFIRMED_VALUE`. */
  factualReviewDate: z.string().optional(),
});

export const catalogRecordSchema = z.object({
  /** Permanent public identifier (e.g. NF.reserva-federal.cien-dolares-1990-cleveland). */
  id: z.string().min(1),
  kind: z.enum(['banknote', 'coin', 'profile', 'other']).default('other'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  /** Date, series year, or reign label shown under the title. */
  dateOrSeries: z.string().optional(),
  country: z.string().optional(),
  issuer: z.string().optional(),
  breadcrumb: z.array(catalogCrumbSchema).min(1).max(8),
  images: z
    .object({
      front: catalogImageSchema.optional(),
      reverse: catalogImageSchema.optional(),
      stacked: catalogImageSchema.optional(),
      defaultView: z.enum(['front', 'reverse', 'stacked']).default('stacked'),
    })
    .optional(),
  metadata: catalogMetadataSchema.optional(),
  context: z
    .object({
      historical: z.string().optional(),
      design: z.string().optional(),
      varieties: z.string().optional(),
      population: z.string().optional(),
    })
    .optional(),
  sources: z.array(catalogSourceSchema).max(24).optional(),
  /**
   * When true, this ficha has been through the catalog-sourcing pass:
   * honesty fields filled (including “no confirmado”) and citations classified.
   * Re-sourced pages must not ship with a majority of retail citations.
   */
  resourced: z.boolean().optional(),
  related: z.array(catalogLinkSchema).max(12).optional(),
  previous: catalogLinkSchema.optional(),
  next: catalogLinkSchema.optional(),
  /** Hub card grid (replaces BanknoteCard dc-imports). */
  cards: z.array(catalogCardSchema).max(200).optional(),
  eyebrow: z.string().optional(),
  /**
   * Rendering mode for Phase 3 native Astro catalog pages.
   * - astro-static: frozen HTML shell + catalog-zoom.js (no dc-runtime)
   * - astro-hub: frozen narrative + Astro card grid
   * - primary: full Astro chrome (title/media/metadata) without legacy body
   * - augment: legacy progressive mode (deprecated)
   */
  render: z.enum(['astro-static', 'astro-hub', 'primary', 'augment']).default('astro-static'),
});

export type CatalogImage = z.infer<typeof catalogImageSchema>;
export type CatalogRecord = z.infer<typeof catalogRecordSchema>;
export type CatalogMetadata = z.infer<typeof catalogMetadataSchema>;
export type CatalogCard = z.infer<typeof catalogCardSchema>;
export type MetadataRow = { label: string; value: string; unconfirmed?: boolean };

export function isUnconfirmedValue(value: string): boolean {
  return value.trim().toLowerCase() === UNCONFIRMED_VALUE;
}

/** Format an ISO factual-review date for the Spanish ficha; leave sentinels and free text. */
export function formatFactualReviewDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || isUnconfirmedValue(trimmed)) return trimmed || undefined;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!iso) return trimmed;
  const date = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return trimmed;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

const STATUS_LABELS: Record<NonNullable<CatalogMetadata['status']>, string> = {
  specimen: 'Specimen',
  circulated: 'Circulado',
  uncirculated: 'Sin circular',
  error: 'Error de imprenta / acuñación',
  proof: 'Proof',
  other: 'Otro',
};

/** Stable permanent id derived from the catalog path. */
export function permanentIdFromPath(path: string): string {
  const cleaned = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^coleccion\//, '')
    .replace(/\//g, '.');
  return `NF.${cleaned || 'unknown'}`;
}

export function absoluteUpload(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${SITE}${path}`;
}

function toMetadataRow(label: string, value: string | undefined): MetadataRow | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const trimmed = value.trim();
  return { label, value: trimmed, unconfirmed: isUnconfirmedValue(trimmed) };
}

/** Ordered rows for the structured metadata definition list. */
export function metadataRows(
  meta: CatalogMetadata | undefined,
  extras?: { country?: string; issuer?: string },
): MetadataRow[] {
  if (!meta && !extras?.country && !extras?.issuer) return [];

  const m = meta ?? {};
  const rows: Array<{ label: string; value: string | undefined }> = [
    { label: 'País', value: extras?.country },
    { label: 'Entidad emisora', value: m.issuer ?? extras?.issuer },
    { label: 'Denominación', value: m.denomination },
    { label: 'Moneda', value: m.currency },
    { label: 'Fecha de emisión', value: m.issueDate },
    { label: 'Serie', value: m.series },
    { label: 'Número de serie', value: m.serialNumber },
    { label: 'Impresor', value: m.printer },
    { label: 'Ceca / ensayador', value: m.mint },
    { label: 'Número de catálogo', value: m.catalogNumber },
    { label: 'Material', value: m.material },
    { label: 'Composición', value: m.composition },
    { label: 'Dimensiones', value: m.dimensions },
    { label: 'Diámetro', value: m.diameter },
    { label: 'Peso', value: m.weight },
    { label: 'Canto', value: m.edge },
    { label: 'Marca de agua', value: m.watermark },
    {
      label: 'Elementos de seguridad',
      value: m.securityFeatures?.length ? m.securityFeatures.join(' · ') : undefined,
    },
    { label: 'Condición', value: m.condition },
    { label: 'Servicio de grading', value: m.gradingService },
    { label: 'Estado de la pieza', value: m.status ? STATUS_LABELS[m.status] : undefined },
    { label: 'Adquisición', value: m.acquisition },
    { label: 'Procedencia', value: m.provenance },
    { label: HONESTY_FIELD_LABELS.printRun, value: m.printRun },
    { label: HONESTY_FIELD_LABELS.knownVarieties, value: m.knownVarieties },
    { label: HONESTY_FIELD_LABELS.circulationDates, value: m.circulationDates },
    { label: HONESTY_FIELD_LABELS.rarityBasis, value: m.rarityBasis },
    { label: HONESTY_FIELD_LABELS.shownSpecimenState, value: m.shownSpecimenState },
    { label: HONESTY_FIELD_LABELS.factualReviewDate, value: formatFactualReviewDate(m.factualReviewDate) },
  ];

  return rows
    .map((r) => toMetadataRow(r.label, r.value))
    .filter((r): r is MetadataRow => r !== null);
}

/** Chicago-ish citation suitable for researchers (Spanish site default). */
export function formatCitation(
  record: Pick<CatalogRecord, 'title' | 'id'>,
  path: string,
  accessed: Date = new Date(),
): string {
  const url = `${SITE}${path.endsWith('/') ? path : `${path}/`}`;
  const iso = accessed.toISOString().slice(0, 10);
  return `Notofilia. «${record.title}». Colección Virtual (${record.id}). ${url} (acceso ${iso}).`;
}

export function formatCitationEn(
  record: Pick<CatalogRecord, 'title' | 'id'>,
  path: string,
  accessed: Date = new Date(),
): string {
  const url = `${SITE}${path.endsWith('/') ? path : `${path}/`}`;
  const iso = accessed.toISOString().slice(0, 10);
  return `Notofilia. “${record.title}”. Virtual Collection (${record.id}). ${url} (accessed ${iso}).`;
}

export function reportMailto(record: Pick<CatalogRecord, 'title' | 'id'>, path: string): string {
  const subject = encodeURIComponent(`Corrección o aporte — ${record.id}`);
  const body = encodeURIComponent(
    [
      `Ficha: ${record.title}`,
      `Identificador: ${record.id}`,
      `URL: ${SITE}${path}`,
      '',
      'Describa el error o la información adicional:',
      '',
    ].join('\n'),
  );
  return `mailto:info@notofilia.com?subject=${subject}&body=${body}`;
}

/** Map structured record fields into CreativeWork additionalProperty values. */
export function recordPropertyValues(record: CatalogRecord): Array<{ '@type': 'PropertyValue'; name: string; value: string }> {
  const rows = metadataRows(record.metadata, {
    country: record.country,
    issuer: record.issuer,
  });
  const props = rows.map((r) => ({
    '@type': 'PropertyValue' as const,
    name: r.label,
    value: r.value,
  }));
  props.unshift({
    '@type': 'PropertyValue',
    name: 'Identificador permanente',
    value: record.id,
  });
  return props;
}
