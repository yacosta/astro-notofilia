import { json, corsOptions } from '../_lib/json.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 25) || 25));

  const indexUrl = new URL('/data/catalog-index.json', url.origin);
  let items = [];
  try {
    const res = await fetch(indexUrl.toString(), {
      headers: { accept: 'application/json' },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (res.ok) {
      const data = await res.json();
      items = Array.isArray(data.items) ? data.items : [];
    }
  } catch (error) {
    console.error('catalog index fetch failed', error);
    return json({ error: 'Catalog index unavailable.' }, { status: 503 });
  }

  if (q) {
    items = items.filter((item) => {
      const hay = `${item.title || ''} ${item.description || ''} ${item.path || ''} ${(item.keywords || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const sliced = items.slice(0, limit).map((item) => ({
    path: item.path,
    title: item.title,
    description: item.description,
    url: item.url || `https://notofilia.com${item.path}`,
    keywords: item.keywords || [],
  }));

  return json(
    { count: sliced.length, total: items.length, items: sliced },
    { headers: { 'cache-control': 'public, max-age=300' } },
  );
}
