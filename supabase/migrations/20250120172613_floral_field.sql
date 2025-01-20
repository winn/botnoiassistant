-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create sessions" ON shared_sessions;
DROP POLICY IF EXISTS "Anyone can view their own sessions" ON shared_sessions;
DROP POLICY IF EXISTS "Anyone can update their own sessions" ON shared_sessions;

-- Create new policies with proper access control
CREATE POLICY "Allow session creation"
    ON shared_sessions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_agents
            WHERE shared_agents.id = shared_sessions.shared_agent_id
        )
    );

CREATE POLICY "Allow session viewing"
    ON shared_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_agents
            WHERE shared_agents.id = shared_sessions.shared_agent_id
        )
    );

CREATE POLICY "Allow session updates"
    ON shared_sessions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM shared_agents
            WHERE shared_agents.id = shared_sessions.shared_agent_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_agents
            WHERE shared_agents.id = shared_sessions.shared_agent_id
        )
    );

-- Add comment explaining the policies
COMMENT ON TABLE shared_sessions IS 'Stores chat sessions for shared agents with public access policies';