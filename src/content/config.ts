import { defineCollection, z } from 'astro:content';

// Blog / "Noticias" content collection.
// Each post is a Markdown file in src/content/noticias/. The filename (minus
// .md) becomes the URL slug: /noticias/<slug>/.
//
// A post can be a full original article (write the body in Markdown) and/or a
// curated pointer to an external source (set `source` + `sourceUrl` — the
// template then shows a "read the original" link). `cover` is the base name of
// an image in public/uploads/ WITHOUT extension; the template builds the
// WebP + responsive <picture> from the conventional variant suffixes.
const noticias = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    excerpt: z.string(),
    source: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { noticias };
