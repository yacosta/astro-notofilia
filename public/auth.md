# auth.md

You are an agent. Notofilia supports **agentic registration** for its public catalog and comment APIs: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation.

Audience: AI agents that need machine-readable access to Notofilia's numismatic catalog, noticias/blog metadata, MCP tools, and (optionally) comment posting on behalf of a human collector.

## Step 1 — Discover

### 1a. Protected Resource Metadata

```http
GET /.well-known/oauth-protected-resource
```

- `resource`: `https://notofilia.com/`
- `authorization_servers`: `["https://notofilia.com"]`
- `scopes_supported`: `catalog:read`, `comments:read`, `comments:write`, `mcp:tools`
- `bearer_methods_supported`: `header`

### 1b. Authorization Server metadata

```http
GET /.well-known/oauth-authorization-server
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

OIDC clients may also read `/.well-known/openid-configuration`.

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

- API catalog: `/.well-known/api-catalog`
- OpenAPI: `/openapi.json`
- MCP Server Card: `/.well-known/mcp/server-card.json`
- Agent index (DNS-AID HTTP): `/.well-known/agent-index.json`

## Step 7 — Revoke

```http
POST /api/oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=<access_token>
```

## Contact

Human operators: [contacto](https://notofilia.com/contacto/). Prefer machine discovery documents over scraping HTML.
