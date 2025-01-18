-- Rename column from enabledTools to enabled_tools
ALTER TABLE agents
  RENAME COLUMN "enabledTools" TO enabled_tools;

-- Update indexes
DROP INDEX IF EXISTS idx_agents_enabled_tools;
CREATE INDEX idx_agents_enabled_tools ON agents(enabled_tools);

-- Update comments
COMMENT ON COLUMN agents.enabled_tools IS 'List of tools/functions the agent can use';