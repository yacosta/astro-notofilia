/**
 * Allowlist major search-crawler ASNs via Cloudflare IP Access Rules so
 * Bot Fight Mode does not challenge Googlebot / Bingbot before they reach
 * /sitemap.xml (GSC "General HTTP error").
 *
 * IP Access Rules are evaluated before Bot Fight Mode; a matching Allow rule
 * prevents BFM from issuing a JS challenge. WAF custom Skip rules cannot
 * bypass free Bot Fight Mode.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  (Zone → Firewall Services → Edit, Zone → Zone → Read)
 * Optional:
 *   CLOUDFLARE_ZONE_ID / CLOUDFLARE_ZONE_NAME (default: notofilia.com)
 *   ALLOW_CRAWLERS_DRY_RUN=1  (print plan only)
 *
 * Usage: node scripts/allow-search-crawlers.mjs
 *
 * Also lowers Security Level if it is stuck on "I'm Under Attack".
 */

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME || 'notofilia.com';
let zoneId = process.env.CLOUDFLARE_ZONE_ID || process.env.CF_ZONE_ID || '';
const dryRun = process.env.ALLOW_CRAWLERS_DRY_RUN === '1';

/** ASN allowlist for Search Console / organic crawlers (not AI training bots). */
const CRAWLER_ASNS = [
  { asn: 'AS15169', notes: 'Allow Google (Googlebot / Search Console)' },
  { asn: 'AS396982', notes: 'Allow Google Cloud crawler ranges' },
  { asn: 'AS8075', notes: 'Allow Microsoft Bingbot' },
];

if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN.');
  console.error('Create a token at https://dash.cloudflare.com/profile/api-tokens');
  console.error(
    'Permissions: Zone → Firewall Services → Edit, Zone → Zone → Read (include notofilia.com).',
  );
  console.error('See docs/search-console-sitemap.md for dashboard steps without the API.');
  process.exit(1);
}

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

async function listAccessRules(zid) {
  const rules = [];
  let page = 1;
  for (;;) {
    const batch = await cf(
      `/zones/${zid}/firewall/access_rules/rules?page=${page}&per_page=100`,
    );
    rules.push(...(batch.result || []));
    const info = batch.result_info || {};
    if (!info.total_pages || page >= info.total_pages) break;
    page += 1;
  }
  return rules;
}

function normalizeAsn(value) {
  const digits = String(value || '').replace(/^AS/i, '');
  return `AS${digits}`;
}

async function ensureAsnAllow(zid, existing, { asn, notes }) {
  const want = normalizeAsn(asn);
  const match = existing.find(
    (rule) =>
      rule.configuration?.target === 'asn' &&
      normalizeAsn(rule.configuration?.value) === want,
  );

  if (match) {
    if (match.mode === 'whitelist' || match.mode === 'allow') {
      console.log(`OK existing Allow for ${want} (${match.id})`);
      return { created: false, id: match.id };
    }
    console.warn(
      `Found ${want} access rule in mode="${match.mode}" — leaving unchanged; set to Allow in the dashboard if needed.`,
    );
    return { created: false, id: match.id, warned: true };
  }

  if (dryRun) {
    console.log(`[dry-run] would create Allow ASN ${want}: ${notes}`);
    return { created: false, dryRun: true };
  }

  const created = await cf(`/zones/${zid}/firewall/access_rules/rules`, {
    method: 'POST',
    body: JSON.stringify({
      mode: 'whitelist',
      configuration: { target: 'asn', value: want.replace(/^AS/i, '') },
      notes,
    }),
  });
  console.log(`Created Allow for ${want} → ${created.result?.id || 'ok'}`);
  return { created: true, id: created.result?.id };
}

async function ensureSecurityLevel(zid) {
  const current = await cf(`/zones/${zid}/settings/security_level`);
  const value = current.result?.value;
  console.log(`Security Level: ${value}`);
  if (value !== 'under_attack') return;

  if (dryRun) {
    console.log('[dry-run] would set Security Level from under_attack → medium');
    return;
  }

  await cf(`/zones/${zid}/settings/security_level`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'medium' }),
  });
  console.log('Set Security Level under_attack → medium (required for crawler sitemap fetches).');
}

async function reportBotFight(zid) {
  try {
    const setting = await cf(`/zones/${zid}/settings/bot_fight_mode`);
    console.log(`Bot Fight Mode setting: ${JSON.stringify(setting.result?.value)}`);
  } catch (error) {
    // Newer dashboards moved this into Security Settings; older API may 404.
    console.log(`Bot Fight Mode setting: unavailable via legacy API (${error.message})`);
  }
}

const zid = await resolveZoneId();
console.log(`${dryRun ? '[dry-run] ' : ''}Allowlisting search crawlers for zone ${zid} (${zoneName})`);

await reportBotFight(zid);
await ensureSecurityLevel(zid);

const existing = await listAccessRules(zid);
let created = 0;
for (const entry of CRAWLER_ASNS) {
  const result = await ensureAsnAllow(zid, existing, entry);
  if (result.created) created += 1;
}

console.log(
  created
    ? `Done. Created ${created} IP Access Allow rule(s). Re-test with: npm run check:sitemap:live`
    : 'Done. No new rules required (or dry-run). Re-test with: npm run check:sitemap:live',
);
console.log(
  'Dashboard: Security → Security rules → IP access rules; Security → Settings → Bot fight mode.',
);
