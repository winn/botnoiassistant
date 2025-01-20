-- Add session_quota column to agents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'session_quota'
    ) THEN
        ALTER TABLE agents
        ADD COLUMN session_quota integer NOT NULL DEFAULT 5;

        -- Add constraint to ensure quota is positive
        ALTER TABLE agents
        ADD CONSTRAINT agents_session_quota_check CHECK (session_quota >= 0);

        -- Add comment
        COMMENT ON COLUMN agents.session_quota IS 'Maximum number of messages allowed per session';
    END IF;
END $$;

-- Create or replace function to get agent's quota
CREATE OR REPLACE FUNCTION get_agent_session_quota(agent_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (SELECT session_quota FROM agents WHERE id = agent_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_agents_session_quota ON agents(session_quota);