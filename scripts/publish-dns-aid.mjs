/**
 * Publish DNS-AID SVCB records for notofilia.com via Cloudflare API.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  (Zone.DNS Edit on notofilia.com)
 * Optional:
 *   CLOUDFLARE_ZONE_ID    (auto-resolved from CLOUDFLARE_ZONE_NAME if omitted)
 *   CLOUDFLARE_ZONE_NAME  (default: notofilia.com)
 *
 * Usage: node scripts/publish-dns-aid.mjs
 */

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME || 'notofilia.com';
let zoneId = process.env.CLOUDFLARE_ZONE_ID || process.env.CF_ZONE_ID || '';

if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN (Zone.DNS Edit).');
  console.error('Create a token at https://dash.cloudflare.com/profile/api-tokens');
  console.error('Permissions: Zone → DNS → Edit, Zone → Zone → Read (include notofilia.com).');
  process.exit(1);
}

const records = [
  {
    type: 'SVCB',
    name: `_index._agents.${zoneName}`,
    ttl: 3600,
    comment: 'DNS-AID organization agent index (draft-mozleywilliams-dnsop-dnsaid)',
    data: {
      priority: 1,
      target: zoneName,
      value: 'alpn="h2,h3" port=443',
    },
  },
  {
    type: 'SVCB',
    name: `_mcp._agents.${zoneName}`,
    ttl: 3600,
    comment: 'DNS-AID MCP agent entrypoint → https://www.notofilia.com/mcp',
    data: {
      priority: 1,
      target: zoneName,
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
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = body.errors || body;
    throw new Error(`${init.method || 'GET'} ${path} failed (${res.status}): ${JSON.stringify(err)}`);
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

async function upsertSvcb(rec) {
  const zid = await resolveZoneId();
  const list = await cf(
    `/zones/${zid}/dns_records?type=${encodeURIComponent(rec.type)}&name=${encodeURIComponent(rec.name)}`,
  );
  const existing = (list.result || []).find((r) => r.name === rec.name && r.type === rec.type);

  const payload = {
    type: rec.type,
    name: rec.name,
    ttl: rec.ttl,
    comment: rec.comment,
    data: {
      priority: rec.data.priority,
      target: rec.data.target,
      value: rec.data.value,
    },
  };

  if (existing?.id) {
    const updated = await cf(`/zones/${zid}/dns_records/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    console.log(`updated ${rec.name} (${updated.result?.id})`);
    return updated.result;
  }

  const created = await cf(`/zones/${zid}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log(`created ${rec.name} (${created.result?.id})`);
  return created.result;
}

async function verifyDoH(name) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=SVCB&do=1`;
  const res = await fetch(url, { headers: { accept: 'application/dns-json' } });
  const body = await res.json();
  const answers = body.Answer || [];
  console.log(
    `verify ${name}: Status=${body.Status} AD=${body.AD} answers=${answers.length}`,
    answers.map((a) => a.data).join(' | ') || '(none yet — may need propagation)',
  );
  return answers.length > 0;
}

const zid = await resolveZoneId();
console.log(`Publishing DNS-AID SVCB records in zone ${zid} (${zoneName})`);

for (const rec of records) {
  await upsertSvcb(rec);
}

console.log('\nVerifying via DNS-over-HTTPS…');
let ok = true;
for (const rec of records) {
  // Authoritative write is immediate in CF API; public DoH can lag briefly.
  const found = await verifyDoH(rec.name);
  ok = ok && found;
}

if (!ok) {
  console.log('\nRecords were written via API but DoH has not returned them yet.');
  console.log('Re-check in ~30s: dig SVCB _index._agents.notofilia.com');
} else {
  console.log('\nDNS-AID SVCB records are live.');
}

console.log('Scan: POST https://isitagentready.com/api/scan {"url":"https://www.notofilia.com"}');
