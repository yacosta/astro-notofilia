/**
 * Purge Cloudflare edge cache for notofilia.com.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  (Zone → Cache Purge on notofilia.com)
 * Optional:
 *   CLOUDFLARE_ZONE_ID    (auto-resolved from CLOUDFLARE_ZONE_NAME if omitted)
 *   CLOUDFLARE_ZONE_NAME  (default: notofilia.com)
 *
 * Usage: node scripts/purge-cf-cache.mjs
 *
 * Prefers purge-everything. If the token cannot purge everything, falls back
 * to a URL list covering HTML indexes plus the long-TTL assets that changed
 * in the bilingual launch (sitemap, web-vitals.js).
 */

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME || 'notofilia.com';
let zoneId = process.env.CLOUDFLARE_ZONE_ID || process.env.CF_ZONE_ID || '';

if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN (Zone → Cache Purge).');
  console.error('Create or edit a token at https://dash.cloudflare.com/profile/api-tokens');
  console.error('Permissions: Zone → Cache Purge, Zone → Zone → Read (include notofilia.com).');
  process.exit(1);
}

const origin = `https://${zoneName}`;
const fallbackFiles = [
  `${origin}/`,
  `${origin}/en/`,
  `${origin}/coleccion/`,
  `${origin}/en/collection/`,
  `${origin}/glosario/`,
  `${origin}/en/glossary/`,
  `${origin}/noticias/`,
  `${origin}/en/news/`,
  `${origin}/blog/`,
  `${origin}/en/blog/`,
  `${origin}/contacto/`,
  `${origin}/en/contact/`,
  `${origin}/editorial/`,
  `${origin}/en/editorial/`,
  `${origin}/buscar/`,
  `${origin}/sitemap.xml`,
  `${origin}/sitemap_index.xml`,
  `${origin}/news-sitemap.xml`,
  `${origin}/web-vitals.js`,
  `${origin}/catalog-zoom.js`,
  `${origin}/llms.txt`,
  `${origin}/llms-full.txt`,
  `https://www.${zoneName}/`,
  `https://www.${zoneName}/en/`,
];

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = new Error(
      `${init.method || 'GET'} ${path} failed (${res.status}): ${JSON.stringify(body.errors || body)}`,
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function resolveZoneId() {
  if (zoneId) return zoneId;
  const listed = await cf(`/zones?name=${encodeURIComponent(zoneName)}&status=active`);
  const match = listed.result?.find((z) => z.name === zoneName);
  if (!match?.id) {
    throw new Error(`Zone not found or token lacks Zone.Read for ${zoneName}`);
  }
  zoneId = match.id;
  console.log(`Resolved zone ${zoneName} → ${zoneId}`);
  return zoneId;
}

function isForbidden(err) {
  const status = err.status;
  const codes = (err.body?.errors || []).map((e) => e.code);
  return status === 403 || status === 401 || codes.includes(10000);
}

const zid = await resolveZoneId();
console.log(`Purging Cloudflare cache for zone ${zid} (${zoneName})`);

try {
  const purged = await cf(`/zones/${zid}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({ purge_everything: true }),
  });
  console.log('Purged everything.', JSON.stringify(purged.result || { success: true }));
} catch (err) {
  if (!isForbidden(err)) throw err;
  console.warn(`purge_everything not allowed (${err.message}); falling back to URL list.`);
  const purged = await cf(`/zones/${zid}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({ files: fallbackFiles }),
  });
  console.log(
    `Purged ${fallbackFiles.length} URL(s).`,
    JSON.stringify(purged.result || { success: true }),
  );
}
