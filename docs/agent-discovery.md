# Agent discovery on Notofilia

This site publishes the machine-readable surfaces scanned by
[isitagentready.com](https://isitagentready.com):

| Surface | Path |
|---|---|
| API Catalog (RFC 9727) | `/.well-known/api-catalog` |
| OAuth AS metadata (RFC 8414) | `/.well-known/oauth-authorization-server` |
| OIDC discovery | `/.well-known/openid-configuration` |
| OAuth Protected Resource (RFC 9728) | `/.well-known/oauth-protected-resource` |
| Auth.md | `/auth.md` |
| MCP Server Card | `/.well-known/mcp/server-card.json` (and `/.well-known/mcp.json`) |
| Web Bot Auth JWKS directory | `/.well-known/http-message-signatures-directory` |
| OpenAPI | `/openapi.json` |
| Agent index (DNS-AID HTTP) | `/.well-known/agent-index.json` |
| Health | `/api/health` |
| Catalog search API | `/api/catalog` |
| MCP Streamable HTTP | `/mcp` |
| WebMCP (browser tools) | `/webmcp.js` (loaded on pages) |

## Markdown for Agents

Cloudflare Pages middleware (`functions/_middleware.js`) returns
`Content-Type: text/markdown` with `x-markdown-tokens` when the request
`Accept` header prefers `text/markdown` over `text/html`.

If the zone is on a Cloudflare plan that supports **Markdown for Agents**,
enable it in AI Crawl Control for edge conversion as well:

```bash
# Requires Zone Settings write token
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/content_converter" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"on"}'
```

## Web Bot Auth

Public JWKS is published at `/.well-known/http-message-signatures-directory`.
To sign outbound bot requests, generate an Ed25519 key, replace the public JWK
in that file, and keep the private key in a Pages secret (never commit it).

## DNS-AID

See [`dns-aid.md`](./dns-aid.md). SVCB records must be added in Cloudflare DNS.

## Secrets (Pages)

Optional Cloudflare Pages environment variables:

- `AGENT_TOKEN_SECRET` — HMAC secret for agent JWT access tokens
- `TURNSTILE_SECRET_KEY` — existing comments protection
