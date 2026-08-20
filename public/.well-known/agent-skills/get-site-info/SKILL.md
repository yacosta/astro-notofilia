---
name: get-site-info
description: Return Notofilia site identity and the URLs of agent discovery documents (MCP, OpenAPI, OAuth, llms.txt, skills index). Use when bootstrapping an agent or listing how to talk to the site.
---

# Get Notofilia site info

Use this skill to learn **who** Notofilia is and **where** machine-readable entrypoints live. It does not search the catalog (use `search-catalog`) and does not check liveness (use `health-check`).

## MCP

```http
POST https://notofilia.com/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "get_site_info", "arguments": {} }
}
```

Typical structured fields:

- `name` — `Notofilia`
- `url` — `https://notofilia.com`
- `description` — digital catalog / virtual collection of historical banknotes and coins
- `discovery` — absolute URLs for API catalog, MCP server card, `auth.md`, OpenAPI, agent index, and this skills index

## WebMCP (browser)

`/webmcp.js` registers `notofilia_site_info` (no arguments). It returns the same identity plus site-relative discovery paths resolved against `location.origin`.

## Documents to prefer (do not scrape HTML first)

| Document | URL |
|---|---|
| Skills index | `https://notofilia.com/.well-known/agent-skills/index.json` |
| MCP server card | `https://notofilia.com/.well-known/mcp/server-card.json` |
| Agent index (DNS-AID HTTP) | `https://notofilia.com/.well-known/agent-index.json` |
| API catalog (RFC 9727) | `https://notofilia.com/.well-known/api-catalog` |
| OpenAPI | `https://notofilia.com/openapi.json` |
| Auth.md | `https://notofilia.com/auth.md` |
| llms.txt | `https://notofilia.com/llms.txt` |
| OAuth protected resource | `https://notofilia.com/.well-known/oauth-protected-resource` |
| OAuth authorization server | `https://notofilia.com/.well-known/oauth-authorization-server` |

Spanish is the primary editorial language (root URLs). English lives under `/en/` with translated slugs. Do not geo-redirect. Pieces shown on the site are **not for sale**.
