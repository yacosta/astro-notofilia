# DNS for AI Discovery (DNS-AID)

Notofilia publishes an HTTP agent index at
[`/.well-known/agent-index.json`](https://www.notofilia.com/.well-known/agent-index.json)
and an MCP Server Card at
[`/.well-known/mcp/server-card.json`](https://www.notofilia.com/.well-known/mcp/server-card.json).

DNS-AID records must be created in the **Cloudflare DNS** zone for `notofilia.com`
(already on Cloudflare nameservers with DNSSEC enabled). Application code cannot
publish these records by itself.

## Required records

Create the following **SVCB** records (Cloudflare DNS → Add record → type `SVCB`).
If the dashboard UI lacks SVCB, use the API script below or Cloudflare API directly.

### Organizational index

| Field | Value |
|---|---|
| Name | `_index._agents` |
| Priority | `1` |
| Target | `notofilia.com` |
| Params | `alpn="h2,h3" port=443` |

Equivalent zone file form:

```dns
_index._agents.notofilia.com. 3600 IN SVCB 1 notofilia.com. alpn="h2,h3" port=443
```

### MCP agent entrypoint

| Field | Value |
|---|---|
| Name | `_mcp._agents` |
| Priority | `1` |
| Target | `notofilia.com` |
| Params | `alpn="h2,h3" port=443` |

```dns
_mcp._agents.notofilia.com. 3600 IN SVCB 1 notofilia.com. alpn="h2,h3" port=443
```

Optional primary-owner style record (flat name, draft-02):

```dns
notofilia-mcp.notofilia.com. 3600 IN SVCB 1 notofilia.com. alpn="mcp,h2,h3" port=443
```

## DNSSEC

Keep **DNSSEC enabled** on the zone (already on for notofilia.com) so validating
resolvers return authenticated answers (`AD=1` over DoH).

## Publish via API

Set:

- `CLOUDFLARE_API_TOKEN` — Zone.DNS Edit on `notofilia.com`
- `CLOUDFLARE_ZONE_ID` — zone id for `notofilia.com`

Then:

```bash
node scripts/publish-dns-aid.mjs
```

## Validate

```bash
dig SVCB _index._agents.notofilia.com
dig SVCB _mcp._agents.notofilia.com

curl -sS -X POST https://isitagentready.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.notofilia.com"}'
```

Expect `checks.discoverability.dnsAid.status === "pass"`.
