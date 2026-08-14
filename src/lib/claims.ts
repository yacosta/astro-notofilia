/**
 * Valuation claim kinds for price-related editorial posts.
 * Used by ClaimCallout and article JSON-LD.
 */

export const CLAIM_KINDS = [
  'seller_asking',
  'dealer_retail',
  'catalog_valuation',
  'melt_value',
  'auction_result',
  'auction_record',
  'media_claim',
] as const;

export type ClaimKind = (typeof CLAIM_KINDS)[number];

export const CLAIM_LABELS: Record<ClaimKind, string> = {
  seller_asking: 'Precio de venta (anuncio)',
  dealer_retail: 'Estimación de comercio',
  catalog_valuation: 'Valoración de catálogo',
  melt_value: 'Valor de fundición',
  auction_result: 'Resultado de subasta documentado',
  auction_record: 'Récord de subasta',
  media_claim: 'Cifra divulgada por medios',
};

/** Default “Sobre este valor” copy when `claimNote` is omitted. */
export const CLAIM_DEFAULT_NOTES: Record<ClaimKind, string> = {
  seller_asking:
    'El monto citado es un precio de venta publicado por un tercero, no una venta verificada. El valor real depende de autenticidad, variedad, estado de conservación y demanda del mercado.',
  dealer_retail:
    'La cifra corresponde a una estimación o cotización de comercio numismático, no necesariamente a una transacción cerrada. Autenticidad, variedad, estado y demanda pueden modificar el resultado.',
  catalog_valuation:
    'Se trata de una valoración de catálogo o guía de precios de referencia. No equivale a una oferta de compra ni a un remate cerrado; el mercado puede situarse por encima o por debajo.',
  melt_value:
    'El monto refleja el valor intrínseco del metal (fundición), no el valor coleccionable de la pieza. Autenticidad, rareza y conservación suelen pesar más que el metal solo.',
  auction_result:
    'La cifra es un resultado de subasta documentado para un ejemplar concreto (estado, certificación y fecha). Otras piezas similares pueden rematarse por montos distintos.',
  auction_record:
    'Se cita un récord o tope de subasta reportado para una variedad o grado. No implica que cualquier ejemplar ordinario alcance esa cifra.',
  media_claim:
    'La cifra procede de un medio o portavoz secundario y no ha sido verificada por Notofilia como venta cerrada. El valor real depende de autenticidad, variedad, estado y demanda.',
};

export function isClaimKind(value: unknown): value is ClaimKind {
  return typeof value === 'string' && (CLAIM_KINDS as readonly string[]).includes(value);
}

export function claimNoteFor(kind: ClaimKind, override?: string): string {
  const trimmed = override?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : CLAIM_DEFAULT_NOTES[kind];
}
