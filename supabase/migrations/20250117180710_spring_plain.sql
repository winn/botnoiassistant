-- Rename enabled_tools column to match the code
ALTER TABLE agents
  RENAME COLUMN enabled_tools TO "enabledTools";

-- Recreate indexes with new column name
DROP INDEX IF EXISTS idx_agents_enabled_tools;
CREATE INDEX idx_agents_enabled_tools ON agents("enabledTools");

-- Update comments
COMMENT ON COLUMN agents."enabledTools" IS 'List of tools/functions the agent can use';