-- Add quotas column to shared_agents table
ALTER TABLE shared_agents
ADD COLUMN quotas jsonb NOT NULL DEFAULT jsonb_build_object(
  'messages_per_session', 50,
  'daily_limit', 1000
);

-- Add daily_usage column to shared_sessions table
ALTER TABLE shared_sessions
ADD COLUMN daily_usage integer NOT NULL DEFAULT 0;

-- Add indexes for performance
CREATE INDEX idx_shared_sessions_daily_usage ON shared_sessions(daily_usage);
CREATE INDEX idx_shared_sessions_created_date ON shared_sessions((created_at::date));

-- Add comments
COMMENT ON COLUMN shared_agents.quotas IS 'Usage quotas configuration (messages per session, daily limit)';
COMMENT ON COLUMN shared_sessions.daily_usage IS 'Number of messages used today';