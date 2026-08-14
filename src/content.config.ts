import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const correctionSchema = z.object({
  date: z.coerce.date(),
  text: z.string().min(1),
});

const primarySourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

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
  // --- Editorial trust / valuation metadata ---
  /** Last substantive review or update (ISO date). Falls back to publishedAt in JSON-LD. */
  updatedAt: z.coerce.date().optional(),
  /** Named reviewer or editorial desk shown in the byline. */
  reviewedBy: z.string().optional(),
  /** Public correction log entries (newest last). */
  corrections: z.array(correctionSchema).max(12).optional(),
  /**
   * When set, renders the “Sobre este valor” callout and marks the post as
   * price-related for structured data.
   */
  claimKind: z.enum([
    'seller_asking',
    'dealer_retail',
    'catalog_valuation',
    'melt_value',
    'auction_result',
    'auction_record',
    'media_claim',
  ]).optional(),
  /** Optional override of the default callout copy for this claimKind. */
  claimNote: z.string().optional(),
  /** ISO 4217 or clear label (USD, MXN, CLP, EUR…). */
  claimCurrency: z.string().optional(),
  /** Date the cited valuation refers to (guide issue, auction day, etc.). */
  claimValuationDate: z.coerce.date().optional(),
  /** Link to auction archive, catalog page, or other realized-price evidence. */
  claimEvidenceUrl: z.string().url().optional(),
  claimEvidenceLabel: z.string().optional(),
  /** Extra primary-source links beyond `sourceUrl` (mints, auction houses, catalogs). */
  primarySources: z.array(primarySourceSchema).max(8).optional(),
  draft: z.boolean().default(false),
});

// "Noticias" — curated news. Each post is a Markdown file in
// src/content/noticias/ → /noticias/<id>/. Typically a short summary that
// points to an external source (set `source` + `sourceUrl`).
const noticias = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/noticias' }),
  schema: postSchema,
});

// "Blog" — original evergreen guides. Each post is a Markdown file in
// src/content/blog/ → /blog/<id>/. Full long-form articles (with a body
// "Fuentes" section), not external pointers.
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: postSchema,
});

// "Logros" — monthly milestones for the virtual collection. Each post is a
// Markdown file in src/content/logros/ → /logros/<id>/.
const logros = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/logros' }),
  schema: postSchema,
});

// Catalog pages share one Astro route/layout. Their preserved dc-runtime body
// and interaction logic are imported once from the former standalone pages.
const catalog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/catalog' }),
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
