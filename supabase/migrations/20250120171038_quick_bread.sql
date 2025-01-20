-- Create shared_sessions table
CREATE TABLE IF NOT EXISTS public.shared_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_agent_id uuid NOT NULL REFERENCES shared_agents(id) ON DELETE CASCADE,
    session_id text NOT NULL UNIQUE,
    message_count integer NOT NULL DEFAULT 0,
    daily_usage integer NOT NULL DEFAULT 0,
    last_message_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT shared_sessions_message_count_check CHECK (message_count >= 0),
    CONSTRAINT shared_sessions_daily_usage_check CHECK (daily_usage >= 0)
);

-- Enable RLS
ALTER TABLE shared_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_sessions_shared_agent_id 
    ON shared_sessions(shared_agent_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_session_id 
    ON shared_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_last_message_at 
    ON shared_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_created_at 
    ON shared_sessions(created_at);

-- Create policies
CREATE POLICY "Anyone can create sessions"
    ON shared_sessions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can view their own sessions"
    ON shared_sessions
    FOR SELECT
    USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "Anyone can update their own sessions"
    ON shared_sessions
    FOR UPDATE
    USING (session_id = current_setting('app.session_id', true))
    WITH CHECK (session_id = current_setting('app.session_id', true));

-- Add updated_at trigger
CREATE TRIGGER set_shared_sessions_updated_at
    BEFORE UPDATE ON shared_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE shared_sessions IS 'Stores chat sessions for shared agents';
COMMENT ON COLUMN shared_sessions.shared_agent_id IS 'Reference to the shared agent';
COMMENT ON COLUMN shared_sessions.session_id IS 'Unique identifier for the session';
COMMENT ON COLUMN shared_sessions.message_count IS 'Number of messages in this session';
COMMENT ON COLUMN shared_sessions.daily_usage IS 'Number of messages used today';
COMMENT ON COLUMN shared_sessions.last_message_at IS 'Timestamp of the last message';