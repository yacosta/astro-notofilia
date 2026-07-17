const MONTHS_SHORT_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

/** Short Spanish date for homepage strips, e.g. "16 de jul. de 2026". */
export function formatDateShortEs(d: Date): string {
  return `${d.getUTCDate()} de ${MONTHS_SHORT_ES[d.getUTCMonth()]}. de ${d.getUTCFullYear()}`;
}

/** Long Spanish date for article/index pages, e.g. "16 de julio de 2026". */
export function formatDateLongEs(d: Date): string {
  return d.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** ISO calendar date (YYYY-MM-DD) in UTC. */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
