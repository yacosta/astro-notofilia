import { getCollection, type CollectionEntry } from 'astro:content';

export type PostCollection = 'blog' | 'noticias';

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

/** Truncate for <title> and append brand suffix (≤ ~60 chars total). */
export function titleTag(title: string, max = 48): string {
  const base = title.length > max ? `${title.slice(0, max)}…` : title;
  return `${base} · Notofilia`;
}

/** Truncate excerpt for meta description (≤ 150 chars). */
export function metaDescription(excerpt: string, max = 150): string {
  return excerpt.length > max ? `${excerpt.slice(0, max - 3)}…` : excerpt;
}
