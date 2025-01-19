-- Add quotas column to shared_agents table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shared_agents' AND column_name = 'quotas'
  ) THEN
    ALTER TABLE shared_agents
    ADD COLUMN quotas jsonb NOT NULL DEFAULT jsonb_build_object(
      'messages_per_session', 50,
      'daily_limit', 1000
    );
  END IF;
END $$;

-- Add daily_usage column to shared_sessions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shared_sessions' AND column_name = 'daily_usage'
  ) THEN
    ALTER TABLE shared_sessions
    ADD COLUMN daily_usage integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add indexes for performance if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'shared_sessions' AND indexname = 'idx_shared_sessions_daily_usage'
  ) THEN
    CREATE INDEX idx_shared_sessions_daily_usage ON shared_sessions(daily_usage);
  END IF;
END $$;

-- Add function for date extraction if not exists
CREATE OR REPLACE FUNCTION get_date_from_timestamp(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ts::date;
$$;

-- Create index using the immutable function if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'shared_sessions' AND indexname = 'idx_shared_sessions_date'
  ) THEN
    CREATE INDEX idx_shared_sessions_date ON shared_sessions(get_date_from_timestamp(created_at));
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN shared_agents.quotas IS 'Usage quotas configuration (messages per session, daily limit)';
COMMENT ON COLUMN shared_sessions.daily_usage IS 'Number of messages used today';
COMMENT ON FUNCTION get_date_from_timestamp IS 'Extracts date from timestamp, used for indexing';