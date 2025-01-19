-- Create shared_agents table
CREATE TABLE public.shared_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    share_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    credentials jsonb NOT NULL,
    views integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create shared_sessions table
CREATE TABLE public.shared_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_agent_id uuid NOT NULL REFERENCES shared_agents(id) ON DELETE CASCADE,
    session_id text NOT NULL UNIQUE,
    message_count integer NOT NULL DEFAULT 0,
    last_message_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT shared_sessions_message_count_check CHECK (message_count >= 0)
);

-- Add indexes for shared_agents
CREATE INDEX idx_shared_agents_agent_id ON shared_agents(agent_id);
CREATE INDEX idx_shared_agents_share_id ON shared_agents(share_id);
CREATE INDEX idx_shared_agents_views ON shared_agents(views);

-- Add indexes for shared_sessions
CREATE INDEX idx_shared_sessions_shared_agent_id ON shared_sessions(shared_agent_id);
CREATE INDEX idx_shared_sessions_session_id ON shared_sessions(session_id);
CREATE INDEX idx_shared_sessions_last_message_at ON shared_sessions(last_message_at);

-- Enable RLS on both tables
ALTER TABLE shared_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_agents
CREATE POLICY "Users can manage their shared agents" ON shared_agents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_agents.agent_id
            AND agents.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = shared_agents.agent_id
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view shared agents" ON shared_agents
    FOR SELECT
    USING (true);

-- Create policies for shared_sessions
CREATE POLICY "Users can view sessions for their shared agents" ON shared_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_agents
            JOIN agents ON agents.id = shared_agents.agent_id
            WHERE shared_agents.id = shared_sessions.shared_agent_id
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create and update sessions" ON shared_sessions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update their own session" ON shared_sessions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER set_shared_agents_updated_at
    BEFORE UPDATE ON shared_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shared_sessions_updated_at
    BEFORE UPDATE ON shared_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE shared_agents IS 'Stores information about shared agents and their credentials';
COMMENT ON COLUMN shared_agents.agent_id IS 'Reference to the agent being shared';
COMMENT ON COLUMN shared_agents.share_id IS 'Unique identifier for the share link';
COMMENT ON COLUMN shared_agents.credentials IS 'Encrypted API credentials';
COMMENT ON COLUMN shared_agents.views IS 'Number of times the shared agent has been viewed';

COMMENT ON TABLE shared_sessions IS 'Tracks sessions for shared agents';
COMMENT ON COLUMN shared_sessions.shared_agent_id IS 'Reference to the shared agent';
COMMENT ON COLUMN shared_sessions.session_id IS 'Unique identifier for the session';
COMMENT ON COLUMN shared_sessions.message_count IS 'Number of messages in this session';
COMMENT ON COLUMN shared_sessions.last_message_at IS 'Timestamp of the last message';