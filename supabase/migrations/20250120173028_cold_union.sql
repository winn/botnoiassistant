-- Create shared_sessions table
CREATE TABLE IF NOT EXISTS public.shared_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_shared_sessions_agent_id 
    ON shared_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_session_id 
    ON shared_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_last_message_at 
    ON shared_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_created_at 
    ON shared_sessions(created_at);

-- Create RLS policies
CREATE POLICY "Allow public session creation"
    ON shared_sessions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_sessions.agent_id
            AND agents.is_public = true
        )
    );

CREATE POLICY "Allow public session viewing"
    ON shared_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_sessions.agent_id
            AND agents.is_public = true
        )
    );

CREATE POLICY "Allow public session updates"
    ON shared_sessions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_sessions.agent_id
            AND agents.is_public = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_sessions.agent_id
            AND agents.is_public = true
        )
    );

-- Add updated_at trigger
CREATE TRIGGER set_shared_sessions_updated_at
    BEFORE UPDATE ON shared_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE shared_sessions IS 'Stores chat sessions for public agents';
COMMENT ON COLUMN shared_sessions.agent_id IS 'Reference to the public agent';
COMMENT ON COLUMN shared_sessions.session_id IS 'Unique identifier for the session';
COMMENT ON COLUMN shared_sessions.message_count IS 'Number of messages in this session';
COMMENT ON COLUMN shared_sessions.daily_usage IS 'Number of messages used today';
COMMENT ON COLUMN shared_sessions.last_message_at IS 'Timestamp of the last message';