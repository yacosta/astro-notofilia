---
name: list-comments
description: List approved public comments on a Noticias article by slug. Use for read-only discussion context. Posting a comment is out of scope (Turnstile and/or claimed agent identity).
---

# List approved comments

Read-only. Comments exist on **noticias** articles (`/noticias/{slug}/`), not on catalog fichas.

## REST

```http
GET https://notofilia.com/api/comments/{slug}
```

`slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` (the article slug, not a full path).

`200` JSON:

```json
{
  "comments": [
    {
      "id": 1,
      "authorName": "…",
      "body": "…",
      "createdAt": "…"
    }
  ]
}
```

Only **approved** comments are returned. Invalid slugs yield `400`. No access token is required for GET.

## Out of scope

- `POST /api/comments/{slug}` — human Turnstile challenge; not an agent skill
- Agent identity registration and `comments:write` — see `https://notofilia.com/auth.md`

To find a slug, use `search-catalog` or `/noticias/` / `llms.txt` editorial indexes, then take the last path segment.
