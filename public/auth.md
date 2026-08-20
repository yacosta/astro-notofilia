# auth.md

You are an agent. Notofilia supports **agentic registration** for its public catalog and comment APIs: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation.

Audience: AI agents that need machine-readable access to Notofilia's numismatic catalog, noticias/blog metadata, MCP tools, and (optionally) comment posting on behalf of a human collector.

## Step 1 — Discover

### 1a. Protected Resource Metadata

Fetch [https://notofilia.com/.well-known/oauth-protected-resource](https://notofilia.com/.well-known/oauth-protected-resource) (RFC 9728).

```http
GET https://notofilia.com/.well-known/oauth-protected-resource
```

- `resource`: `https://notofilia.com` (apex; `www` redirects here)
- `authorization_servers`: `["https://notofilia.com"]`
- `scopes_supported`: `catalog:read`, `comments:read`, `comments:write`, `mcp:tools`
- `bearer_methods_supported`: `header`

Path → scope (catalog and MCP reads stay public; send `Authorization: Bearer` when acting for a collector):

| Path | Scope | Token |
|---|---|---|
| `/api/catalog`, `/api/health` | `catalog:read` | optional |
| `GET /api/comments/{slug}` | `comments:read` | optional |
| `POST /api/comments/{slug}` | `comments:write` | claimed identity + Turnstile |
| `/mcp` | `mcp:tools` | optional for read tools |

### 1b. Authorization Server metadata

Fetch [https://notofilia.com/.well-known/oauth-authorization-server](https://notofilia.com/.well-known/oauth-authorization-server) (RFC 8414). OIDC clients may also read [https://notofilia.com/.well-known/openid-configuration](https://notofilia.com/.well-known/openid-configuration).

```http
GET https://notofilia.com/.well-known/oauth-authorization-server
```

Key fields:

- `issuer`: `https://notofilia.com`
- `token_endpoint`: `https://notofilia.com/api/oauth/token`
- `revocation_endpoint` / `agent_auth.revocation_uri`: `https://notofilia.com/api/oauth/revoke`
- `jwks_uri`: `https://notofilia.com/.well-known/jwks.json`
- `agent_auth.skill`: this document
- `agent_auth.register_uri` / `identity_endpoint`: `https://notofilia.com/api/agent/identity`
- `agent_auth.claim_uri` / `claim_endpoint`: `https://notofilia.com/api/agent/identity/claim`
- `agent_auth.identity_types_supported`: `anonymous`, `identity_assertion`

## Step 2 — Choose an identity type

| Method | When to use | Scopes typically issued |
|---|---|---|
| `anonymous` | Read-only catalog / MCP tools | `catalog:read`, `comments:read`, `mcp:tools` |
| `identity_assertion` (`verified_email` or ID-JAG) | Acting for a human (e.g. posting comments) | above + `comments:write` after claim |

## Step 3 — Register

```http
POST /api/agent/identity
Content-Type: application/json

{"type":"anonymous","client_name":"example-agent"}
```

Or with a verified email / ID-JAG assertion:

```http
POST /api/agent/identity
Content-Type: application/json

{
  "type": "identity_assertion",
  "assertion_type": "verified_email",
  "assertion": "collector@example.com",
  "client_name": "example-agent"
}
```

Successful responses include a service-signed `identity_assertion` JWT and, for claimable flows, a `claim_token`.

## Step 4 — Claim (when required)

If registration returns `claim_token`, complete ownership at:

```http
POST /api/agent/identity/claim
Content-Type: application/json

{"claim_token":"...","email":"collector@example.com"}
```

Surface any `user_code` + `verification_uri` to the human. Poll the token endpoint with `grant_type=urn:workos:agent-auth:grant-type:claim` until the claim completes.

## Step 5 — Exchange for an access token

```http
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<identity_assertion>
&scope=catalog:read comments:read mcp:tools
```

For anonymous read access you may also use:

```http
grant_type=client_credentials&scope=catalog:read mcp:tools
```

## Step 6 — Call APIs

Send `Authorization: Bearer <access_token>` when calling protected routes. Public read endpoints (`/api/catalog`, `/api/health`, `/mcp` tools that only read) remain available without a token.

Useful discovery documents:

- Protected Resource Metadata (RFC 9728): [https://notofilia.com/.well-known/oauth-protected-resource](https://notofilia.com/.well-known/oauth-protected-resource)
- Authorization Server (RFC 8414): [https://notofilia.com/.well-known/oauth-authorization-server](https://notofilia.com/.well-known/oauth-authorization-server)
- API catalog: [https://notofilia.com/.well-known/api-catalog](https://notofilia.com/.well-known/api-catalog)
- OpenAPI: [https://notofilia.com/openapi.json](https://notofilia.com/openapi.json)
- MCP Server Card: [https://notofilia.com/.well-known/mcp/server-card.json](https://notofilia.com/.well-known/mcp/server-card.json)
- Agent index (DNS-AID HTTP): [https://notofilia.com/.well-known/agent-index.json](https://notofilia.com/.well-known/agent-index.json)

## Step 7 — Revoke

```http
POST /api/oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=<access_token>
```

## Contact

Human operators: [contacto](https://notofilia.com/contacto/). Prefer machine discovery documents over scraping HTML.
