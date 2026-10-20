CREATE TABLE IF NOT EXISTS profiles (
 user_id TEXT PRIMARY KEY, display_name TEXT NOT NULL,
 subject TEXT NOT NULL DEFAULT 'matematica' CHECK(subject IN ('matematica','romana')),
 level TEXT NOT NULL DEFAULT 'mediu' CHECK(level IN ('incepator','mediu','avansat')),
 grade TEXT NOT NULL DEFAULT 'XII' CHECK(grade IN ('VIII','IX','X','XI','XII')),
 goal TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS questions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
 subject TEXT NOT NULL CHECK(subject IN ('matematica','romana')),
 title TEXT NOT NULL, body TEXT NOT NULL, answer TEXT, answered_by TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, answered_at TEXT
);
CREATE INDEX IF NOT EXISTS questions_owner ON questions(user_id,created_at);
CREATE TABLE IF NOT EXISTS attempts (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL, subject TEXT NOT NULL, level TEXT NOT NULL,
 items TEXT NOT NULL, answers TEXT, score INTEGER, total INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, submitted_at TEXT
);
CREATE INDEX IF NOT EXISTS attempts_owner ON attempts(user_id,created_at);
CREATE TABLE IF NOT EXISTS bookings (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
 subject TEXT NOT NULL CHECK(subject IN ('matematica','romana')),
 preferred TEXT NOT NULL, message TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'noua' CHECK(status IN ('noua','confirmata','inchisa')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS bookings_owner ON bookings(user_id,created_at);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL DEFAULT 1, expires_at INTEGER NOT NULL);
