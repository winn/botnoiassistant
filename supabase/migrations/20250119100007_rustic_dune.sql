-- Add is_public column to agents table if not exists
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_agents_is_public ON agents(is_public);

-- Add comment
COMMENT ON COLUMN agents.is_public IS 'Whether this agent is publicly accessible';

-- Create policy for public access
DROP POLICY IF EXISTS "Anyone can view public agents" ON agents;
CREATE POLICY "Anyone can view public agents" ON agents
    FOR SELECT
    USING (is_public = true);