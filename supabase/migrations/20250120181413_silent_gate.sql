-- Add session_quota column to agents table
ALTER TABLE agents
ADD COLUMN session_quota integer NOT NULL DEFAULT 5;

-- Add constraint to ensure quota is positive
ALTER TABLE shared_sessions
ADD CONSTRAINT agents_session_quota_check CHECK (session_quota >= 0);

-- Add comment
COMMENT ON COLUMN agents.session_quota IS 'Maximum number of messages allowed per session';

-- Update shared_sessions to use agent's quota
CREATE OR REPLACE FUNCTION get_agent_session_quota(agent_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (SELECT session_quota FROM agents WHERE id = agent_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing sessions to use agent quota
UPDATE shared_sessions
SET session_quota = (
    SELECT session_quota 
    FROM agents 
    WHERE agents.id = shared_sessions.agent_id
);