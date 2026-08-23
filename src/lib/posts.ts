import { getCollection, type CollectionEntry } from 'astro:content';

export type PostCollection = 'blog' | 'noticias' | 'logros';

export type PublishedPost<C extends PostCollection = PostCollection> = CollectionEntry<C>;

/** Published (non-draft) posts for a collection, newest first. */
export async function getPublishedPosts<C extends PostCollection>(
  collection: C,
): Promise<PublishedPost<C>[]> {
  const posts = await getCollection(collection, ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  ) as PublishedPost<C>[];
}

const TITLE_SUFFIX = ' · Notofilia';
const TITLE_TOTAL_MAX = 60;
/** Default base budget so base + ` · Notofilia` ≤ 60. */
const TITLE_BASE_MAX = TITLE_TOTAL_MAX - TITLE_SUFFIX.length; // 48

const META_CONNECTORS = new Set([
  'de',
  'la',
  'el',
  'los',
  'las',
  'del',
  'en',
  'y',
  'a',
  'un',
  'una',
  'para',
  'con',
  'por',
  'que',
  'al',
]);

/** Truncate on a word boundary; `budget` is max length of the kept text (no ellipsis). */
function truncateAtWord(text: string, budget: number): string {
  if (text.length <= budget) return text;
  let slice = text.slice(0, budget);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 0) slice = slice.slice(0, lastSpace);
  return slice.trimEnd();
}

function stripTrailingConnectors(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  while (words.length > 0) {
    const last = words[words.length - 1].toLowerCase().replace(/[.,;:!?…]+$/u, '');
    if (!META_CONNECTORS.has(last)) break;
    words.pop();
  }
  return words.join(' ').replace(/[,;:\-–—]\s*$/u, '').trimEnd();
}

/**
 * Build a `<title>` with brand suffix, always ≤ 60 chars total.
 * Truncates the base on a word boundary; `…` is included in the base budget when needed.
 */
export function titleTag(title: string, max = TITLE_BASE_MAX): string {
  const baseBudget = Math.min(max, TITLE_TOTAL_MAX - TITLE_SUFFIX.length);
  if (title.length <= baseBudget) {
    return `${title}${TITLE_SUFFIX}`;
  }

  // Ellipsis counts toward the base so final length ≤ 60.
  const content = truncateAtWord(title, baseBudget - 1);
  const base = `${content}…`;
  return `${base}${TITLE_SUFFIX}`;
}

/**
 * Truncate excerpt for meta description (≤ 150 chars).
 * Word-boundary cut, strip trailing Spanish connectors, ellipsis only when truncated.
 */
export function metaDescription(excerpt: string, max = 150): string {
  if (excerpt.length <= max) return excerpt;

  let truncated = truncateAtWord(excerpt, max - 1);
  truncated = stripTrailingConnectors(truncated);
  // Safety: never exceed max after ellipsis.
  if (truncated.length > max - 1) {
    truncated = truncateAtWord(truncated, max - 1);
    truncated = stripTrailingConnectors(truncated);
  }
  return `${truncated}…`.slice(0, max);
}
