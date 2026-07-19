# Comment moderation

Comments on news articles are stored in the Cloudflare D1 database
`comments_db`. New submissions are always created with the `pending` status and
do not appear publicly until approved.

## Review pending comments

Open **Cloudflare → Storage & databases → D1 → comments_db → Console** and run:

```sql
SELECT id, article_slug, author_name, body, created_at
FROM comments
WHERE status = 'pending'
ORDER BY created_at ASC;
```

## Approve a comment

Replace `COMMENT_ID` with the comment's numeric ID:

```sql
UPDATE comments
SET status = 'approved', approved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = COMMENT_ID AND status = 'pending';
```

## Reject a comment

```sql
UPDATE comments
SET status = 'rejected'
WHERE id = COMMENT_ID AND status = 'pending';
```

## Remove a published comment

Changing an approved comment to `rejected` removes it from the public article
without deleting the record:

```sql
UPDATE comments
SET status = 'rejected'
WHERE id = COMMENT_ID;
```

## Required Cloudflare configuration

- D1 binding: `COMMENTS_DB` → `comments_db`
- Encrypted secret: `TURNSTILE_SECRET_KEY`
- Turnstile widget hostname: `notofilia.com`

The Turnstile secret must never be committed to the repository or exposed in
browser code.
