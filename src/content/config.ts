import { defineCollection, z } from 'astro:content';

// Shared schema for the two editorial collections.
const postSchema = z.object({
  title: z.string(),
  publishedAt: z.coerce.date(),
  excerpt: z.string(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  // How the cover is fitted: 'cover' (default, crops to a 16:9 band) or
  // 'contain' (shows the whole image at natural size — for banknote scans).
  coverFit: z.enum(['cover', 'contain']).optional(),
  // Optional SEO keyword list for this post's <meta name="keywords">.
  keywords: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
});

// "Noticias" — curated news. Each post is a Markdown file in
// src/content/noticias/ → /noticias/<slug>/. Typically a short summary that
// points to an external source (set `source` + `sourceUrl`).
const noticias = defineCollection({ type: 'content', schema: postSchema });

// "Blog" — original evergreen guides. Each post is a Markdown file in
// src/content/blog/ → /blog/<slug>/. Full long-form articles (with a body
// "Fuentes" section), not external pointers.
const blog = defineCollection({ type: 'content', schema: postSchema });

export const collections = { noticias, blog };
