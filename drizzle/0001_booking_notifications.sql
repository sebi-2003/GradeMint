CREATE TABLE IF NOT EXISTS booking_notifications (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
 reply_to TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed','not_configured')),
 attempts INTEGER NOT NULL DEFAULT 0,
 provider_id TEXT,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
