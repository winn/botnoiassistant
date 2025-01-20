-- Add session_quota column to shared_sessions table
ALTER TABLE shared_sessions
ADD COLUMN session_quota integer NOT NULL DEFAULT 5;

-- Add constraint to ensure quota is positive
ALTER TABLE shared_sessions
ADD CONSTRAINT shared_sessions_session_quota_check CHECK (session_quota >= 0);

-- Add comment
COMMENT ON COLUMN shared_sessions.session_quota IS 'Maximum number of messages allowed per session';