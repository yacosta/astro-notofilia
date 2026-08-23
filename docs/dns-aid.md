# DNS for AI Discovery (DNS-AID)

Notofilia publishes an HTTP agent index at
[`/.well-known/agent-index.json`](https://notofilia.com/.well-known/agent-index.json)
and an MCP Server Card at
[`/.well-known/mcp/server-card.json`](https://notofilia.com/.well-known/mcp/server-card.json).

DNS-AID **SVCB** records must exist in the Cloudflare DNS zone for `notofilia.com`.
DNSSEC is already enabled on the zone (`AD=1` over DoH). Application deploys cannot
create these records without a Cloudflare API token that has **Zone.DNS Edit**.

## Required records

| Name | Type | Priority | Target | Params |
|---|---|---|---|---|
| `_index._agents` | SVCB | `1` | `notofilia.com` | `alpn="h2,h3" port=443` |
| `_mcp._agents` | SVCB | `1` | `notofilia.com` | `alpn="h2,h3" port=443` |

Zone-file form:

```dns
_index._agents.notofilia.com. 3600 IN SVCB 1 notofilia.com. alpn="h2,h3" port=443
_mcp._agents.notofilia.com.   3600 IN SVCB 1 notofilia.com. alpn="h2,h3" port=443
```

These match the well-known entrypoints queried by isitagentready
(`_index._agents`, `_mcp._agents`, `_a2a._agents`).

## Option A — Cloudflare dashboard (fastest)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → zone **notofilia.com** → **DNS** → **Records**
2. **Add record** → type **SVCB**
3. Name: `_index._agents` · Priority: `1` · Target: `notofilia.com` · Value/Params: `alpn="h2,h3" port=443` · Proxy: **DNS only**
4. Repeat for name `_mcp._agents` with the same priority/target/params
5. Confirm **DNSSEC** remains **On** (SSL/TLS → DNSSEC)

If the UI has no SVCB type, use Option B.

## Option B — API / GitHub Action

1. Create an API token: https://dash.cloudflare.com/profile/api-tokens  
   Permissions: **Zone → DNS → Edit**, **Zone → Zone → Read**, include zone `notofilia.com`
2. Add repository secrets on `yacosta/astro-notofilia`:
   - `CLOUDFLARE_API_TOKEN` (required)
   - `CLOUDFLARE_ZONE_ID` (optional; auto-resolved from `notofilia.com`)
3. Run workflow **Publish DNS-AID** (Actions → workflow_dispatch), or:

```bash
export CLOUDFLARE_API_TOKEN=…
node scripts/publish-dns-aid.mjs
```

## Validate

```bash
dig SVCB _index._agents.notofilia.com +dnssec
dig SVCB _mcp._agents.notofilia.com +dnssec

curl -sS "https://cloudflare-dns.com/dns-query?name=_index._agents.notofilia.com&type=SVCB&do=1" \
  -H 'accept: application/dns-json'

curl -sS -X POST https://isitagentready.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://notofilia.com"}'
```

Expect `checks.discoverability.dnsAid.status === "pass"`.
