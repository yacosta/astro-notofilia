/**
 * Publish DNS-AID SVCB records for notofilia.com via Cloudflare API.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  (Zone.DNS Edit)
 *   CLOUDFLARE_ZONE_ID
 *
 * Usage: node scripts/publish-dns-aid.mjs
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!token || !zoneId) {
  console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID');
  process.exit(1);
}

const records = [
  {
    type: 'SVCB',
    name: '_index._agents.notofilia.com',
    ttl: 3600,
    data: {
      priority: 1,
      target: 'notofilia.com',
      value: 'alpn="h2,h3" port=443',
    },
  },
  {
    type: 'SVCB',
    name: '_mcp._agents.notofilia.com',
    ttl: 3600,
    data: {
      priority: 1,
      target: 'notofilia.com',
      value: 'alpn="h2,h3" port=443',
    },
  },
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
  const body = await res.json();
  if (!body.success) {
    throw new Error(`${path} failed: ${JSON.stringify(body.errors || body)}`);
  }
  return body;
}

for (const rec of records) {
  const list = await cf(
    `/zones/${zoneId}/dns_records?type=SVCB&name=${encodeURIComponent(rec.name)}`,
  );
  const existing = list.result?.[0];
  // Cloudflare SVCB "content" / data shape varies by API version; try structured form.
  const payload = {
    type: 'SVCB',
    name: rec.name,
    ttl: rec.ttl,
    data: {
      priority: rec.data.priority,
      target: rec.data.target,
      value: rec.data.value,
    },
  };

  if (existing?.id) {
    const updated = await cf(`/zones/${zoneId}/dns_records/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    console.log('updated', rec.name, updated.result?.id);
  } else {
    const created = await cf(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('created', rec.name, created.result?.id);
  }
}

console.log('DNS-AID SVCB records published. Verify with dig / isitagentready scan.');
