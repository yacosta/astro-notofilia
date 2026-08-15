/** First calendar year in a catalog year label such as "1947, 1969" or "1910&ndash;1915". */
const YEAR_RE = /(?:1[7-9]\d{2}|20\d{2})/g;

export function yearsInLabel(label: string | number | null | undefined): number[] {
  if (label == null || label === '') return [];
  const text = String(label).replace(/&ndash;|&mdash;|–|—/g, '-');
  return [...text.matchAll(YEAR_RE)].map((match) => Number(match[0]));
}

export function firstYear(label: string | number | null | undefined): number | null {
  const years = yearsInLabel(label);
  return years.length ? Math.min(...years) : null;
}

export function compareByFirstYear(
  a: { year?: string | number | null },
  b: { year?: string | number | null },
): number {
  const yearA = firstYear(a.year);
  const yearB = firstYear(b.year);
  if (yearA == null && yearB == null) return 0;
  if (yearA == null) return 1;
  if (yearB == null) return -1;
  return yearA - yearB;
}
