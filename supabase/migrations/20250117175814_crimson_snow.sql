-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing agents table if exists
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table
CREATE TABLE public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    character text NOT NULL,
    actions text NOT NULL,
    enabled_tools jsonb DEFAULT '[]'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    user_id uuid REFERENCES auth.users(id),
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT agents_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT agents_character_not_empty CHECK (length(trim(character)) > 0),
    CONSTRAINT agents_actions_not_empty CHECK (length(trim(actions)) > 0)
);

-- Add indexes for performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_is_public ON agents(is_public);
CREATE INDEX idx_agents_user_public ON agents(user_id, is_public);
CREATE INDEX idx_agents_created_at ON agents(created_at);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view public agents"
    ON agents
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can manage their own agents"
    ON agents
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER set_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically set user_id
CREATE TRIGGER set_agents_user_id
    BEFORE INSERT ON agents
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- Add comments for documentation
COMMENT ON TABLE agents IS 'Stores AI agent configurations and personalities';
COMMENT ON COLUMN agents.id IS 'Unique identifier for the agent';
COMMENT ON COLUMN agents.name IS 'Display name of the agent';
COMMENT ON COLUMN agents.character IS 'Character description/personality of the agent';
COMMENT ON COLUMN agents.actions IS 'Behavior instructions for the agent';
COMMENT ON COLUMN agents.enabled_tools IS 'List of tools/functions the agent can use';
COMMENT ON COLUMN agents.faqs IS 'Frequently asked questions and answers for the agent';
COMMENT ON COLUMN agents.user_id IS 'Reference to the user who owns this agent';
COMMENT ON COLUMN agents.is_public IS 'Whether this agent is publicly accessible';