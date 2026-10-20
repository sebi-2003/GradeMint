CREATE TABLE IF NOT EXISTS mail_events (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 kind TEXT NOT NULL,
 recipient TEXT NOT NULL,
 payload TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed','not_configured')),
 provider_id TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS mail_events_owner ON mail_events(user_id,created_at);
