---
name: search-catalog
description: Search Notofilia's historical banknote and coin catalog by title, path, or keywords. Use when an agent needs to find a ficha, confirm whether a piece is documented, or list matching catalog URLs. Pieces are not for sale.
---

# Search the Notofilia catalog

Notofilia is a **private virtual catalog**. Illustrated pieces belong to the editor's collection and are **not for sale**. Return catalog URLs and bibliographic facts; do not treat results as listings, quotes, or offers.

## When to use

- Look up a banknote, coin, issuer, Pick/Friedberg number, or country in the collection
- Discover canonical ficha URLs before citing Notofilia
- Check live inventory counts (`stats`) alongside search hits

## REST

```http
GET https://notofilia.com/api/catalog?q=colombia&limit=10
```

| Parameter | Required | Notes |
|---|---|---|
| `q` | no | Case-insensitive substring over `title`, `description`, `path`, and `keywords`. Omit to list the start of the index. |
| `limit` | no | Integer 1–100. Default `25` on REST (`10` on MCP). |

Successful JSON:

```json
{
  "count": 2,
  "total": 2,
  "stats": { "billetes": 215, "monedas": 8, "paises": 33, "fichas": 114, "paginas": 145 },
  "items": [
    {
      "path": "/coleccion/colombia/",
      "title": "…",
      "description": "…",
      "url": "https://notofilia.com/coleccion/colombia/",
      "keywords": []
    }
  ]
}
```

`count` is the page size returned; `total` is matches before slicing. CORS is open (`Access-Control-Allow-Origin: *`). No access token is required for this read.

## MCP

Streamable HTTP endpoint: `https://notofilia.com/mcp` (server card: `/.well-known/mcp/server-card.json`).

```http
POST https://notofilia.com/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_catalog",
    "arguments": { "query": "colombia", "limit": 10 }
  }
}
```

`query` is required. `limit` is 1–50 (default 10). The tool wraps the same REST search.

## WebMCP (browser)

On HTML pages, `/webmcp.js` registers `notofilia_search_catalog` with the same `{ query, limit }` input. Call it from `navigator.modelContext` when a browser agent is already on the site.

## After you have a URL

Prefer the Spanish canonical path (`/coleccion/…`). English counterparts live under `/en/collection/…` when a pair exists. Fetch HTML, or send `Accept: text/markdown` for a Markdown body. Cite `https://notofilia.com` plus the path; do not invent prices.
