import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Build-time replacement for the old hand-maintained public/news-items.js.
// The homepage runtime does `import("./news-items.js")` and reads NEWS_ITEMS;
// this endpoint emits that module from the Markdown collection so there is a
// single source of truth. Shape matches what the homepage cards consume.
export const GET: APIRoute = async () => {
  const posts = (await getCollection('noticias', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const items = posts.map((p) => {
    const c = p.data.cover;
    return {
      date: p.data.publishedAt.toISOString().slice(0, 10),
      title: p.data.title,
      source: p.data.source ?? 'Notofilia',
      url: `/noticias/${p.slug}/`,
      image: c ? `uploads/${c}.jpg` : '',
      imageWebp: c ? `uploads/${c}.webp` : '',
      imageSmallJpg: c ? `uploads/${c}-640.jpg` : '',
      imageSmallWebp: c ? `uploads/${c}-640.webp` : '',
      imageAlt: p.data.coverAlt ?? '',
    };
  });
  const body =
    '// Generated at build from src/content/noticias/*.md — do not edit by hand.\n' +
    `export const NEWS_ITEMS = ${JSON.stringify(items, null, 2)};\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
};
