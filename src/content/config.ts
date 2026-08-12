import { defineCollection, z } from 'astro:content';

// Shared schema for the editorial collections (blog, noticias, logros).
const postSchema = z.object({
  title: z.string(),
  publishedAt: z.coerce.date(),
  excerpt: z.string(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  coverCaption: z.string().optional(),
  // How the cover is fitted: 'cover' (default, crops to a 16:9 band) or
  // 'contain' (shows the whole image at natural size — for banknote scans).
  coverFit: z.enum(['cover', 'contain']).optional(),
  // Optional SEO keyword list for this post's <meta name="keywords">.
  keywords: z.array(z.string()).optional(),
  // Contextual paths into related editorial, catalog, profile, or glossary pages.
  relatedLinks: z.array(z.object({
    href: z.string().startsWith('/'),
    title: z.string(),
    description: z.string().optional(),
  })).max(4).optional(),
  // Auto-share to X / Instagram on publish (see docs/social-posting.md).
  // Set social: false to skip. socialCaption overrides the default caption.
  social: z.boolean().default(true),
  socialCaption: z.string().optional(),
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

// "Logros" — monthly milestones for the virtual collection. Each post is a
// Markdown file in src/content/logros/ → /logros/<slug>/.
const logros = defineCollection({ type: 'content', schema: postSchema });

// Catalog pages share one Astro route/layout. Their preserved dc-runtime body
// and interaction logic are imported once from the former standalone pages.
const catalog = defineCollection({
  type: 'data',
  schema: z.object({
    path: z.string().startsWith('/coleccion/').endsWith('/'),
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).default([]),
    robots: z.string().default('index, follow'),
    ogType: z.enum(['website', 'article', 'profile']).default('article'),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().startsWith('/').optional(),
    jsonLd: z.unknown().optional(),
    styles: z.string().default(''),
    template: z.string(),
    logic: z.string().default(''),
    legacyFile: z.string(),
    sourceHash: z.string(),
  }),
});

export const collections = { noticias, blog, logros, catalog };
