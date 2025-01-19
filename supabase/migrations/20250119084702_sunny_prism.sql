-- Add quotas column to shared_agents table
ALTER TABLE shared_agents
ADD COLUMN IF NOT EXISTS quotas jsonb NOT NULL DEFAULT jsonb_build_object(
  'messages_per_session', 50,
  'daily_limit', 1000
);

-- Add daily_usage column to shared_sessions table
ALTER TABLE shared_sessions
ADD COLUMN IF NOT EXISTS daily_usage integer NOT NULL DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_sessions_daily_usage ON shared_sessions(daily_usage);

-- Add function for date extraction if not exists
CREATE OR REPLACE FUNCTION get_date_from_timestamp(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ts::date;
$$;

-- Create index using the immutable function
CREATE INDEX IF NOT EXISTS idx_shared_sessions_date ON shared_sessions(get_date_from_timestamp(created_at));

-- Add comments
COMMENT ON COLUMN shared_agents.quotas IS 'Usage quotas configuration (messages per session, daily limit)';
COMMENT ON COLUMN shared_sessions.daily_usage IS 'Number of messages used today';
COMMENT ON FUNCTION get_date_from_timestamp IS 'Extracts date from timestamp, used for indexing';