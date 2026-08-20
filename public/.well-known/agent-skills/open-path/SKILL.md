---
name: open-path
description: Navigate a browser already on Notofilia to a site-relative path. Use with WebMCP when a human or browser agent should open a catalog hub, ficha, or editorial page.
---

# Open a Notofilia path (WebMCP)

This skill is **browser-only**. Remote MCP and REST clients cannot change the user's viewport; they should return the canonical URL instead (see `search-catalog`).

## When to use

- A page on `notofilia.com` (or `www`, which redirects to apex) has loaded `/webmcp.js`
- The agent should **navigate** to another first-party path rather than merely cite it

## Tool

Registered name: `notofilia_open_path`

```json
{
  "path": "/coleccion/colombia/"
}
```

| Field | Required | Rules |
|---|---|---|
| `path` | yes | Must be site-relative and start with `/`. Example: `/en/collection/colombia/`. |

The tool calls `location.assign(path)` and returns `{ "navigated": path }`.

## Do not

- Pass absolute URLs (`https://…`) — they are rejected
- Navigate off-origin
- Use this as a substitute for catalog search; resolve the path first with `search-catalog` or a known hub (`/coleccion/`, `/noticias/`, `/glosario/`, `/en/collection/`)

Spanish URLs are canonical. Open `/en/…` only when the user is on the English tree or asked for English.
