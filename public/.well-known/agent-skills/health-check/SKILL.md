---
name: health-check
description: Check whether Notofilia agent APIs are healthy. Use before catalog search or when diagnosing a failed MCP/REST call.
---

# Health check

Confirms the public agent surface is up. This is a liveness probe, not a catalog query.

## REST

```http
GET https://notofilia.com/api/health
```

`200` JSON:

```json
{
  "status": "ok",
  "service": "notofilia",
  "time": "2026-08-20T12:00:00.000Z"
}
```

No authentication. CORS is open. Treat any non-`ok` `status`, 5xx, or network failure as unhealthy.

## MCP

```http
POST https://notofilia.com/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "health_check", "arguments": {} }
}
```

The tool fetches `/api/health` and returns that JSON as text and `structuredContent`.

## Related

- MCP transport metadata (GET): `https://notofilia.com/mcp`
- Server card: `https://notofilia.com/.well-known/mcp/server-card.json`
