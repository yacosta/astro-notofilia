const MONTHS_SHORT_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

const MONTHS_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Short Spanish date for homepage strips, e.g. "16 de jul. de 2026". */
export function formatDateShortEs(d: Date): string {
  return `${d.getUTCDate()} de ${MONTHS_SHORT_ES[d.getUTCMonth()]}. de ${d.getUTCFullYear()}`;
}

/** Short English date for homepage strips, e.g. "16 Jul 2026". */
export function formatDateShortEn(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS_SHORT_EN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
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

/** Long English date, e.g. "July 16, 2026". */
export function formatDateLongEn(d: Date): string {
  return d.toLocaleDateString('en', {
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
