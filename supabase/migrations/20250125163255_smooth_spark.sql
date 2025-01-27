-- Add isDefault column to agents table
ALTER TABLE agents
ADD COLUMN "isDefault" boolean NOT NULL DEFAULT false;

-- Add index for performance
CREATE INDEX idx_agents_is_default ON agents("isDefault");

-- Add comment
COMMENT ON COLUMN agents."isDefault" IS 'Whether this agent is the default example agent';

-- Update RLS policies to allow public access to default agent
DROP POLICY IF EXISTS "Anyone can view public agents" ON agents;
CREATE POLICY "Anyone can view public or default agents" ON agents
    FOR SELECT
    USING ("isDefault" = true OR is_public = true);