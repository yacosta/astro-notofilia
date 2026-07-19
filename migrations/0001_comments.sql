CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_article_status_created
  ON comments (article_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_status_created
  ON comments (status, created_at DESC);
