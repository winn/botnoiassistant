/*
  # Create shared agents table

  1. New Tables
    - `shared_agents`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `share_id` (uuid, unique)
      - `credentials` (jsonb)
      - `views` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for owners to manage their shared agents
    - Add policy for anyone to view shared agents
*/

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

-- Add indexes
CREATE INDEX idx_shared_agents_agent_id ON shared_agents(agent_id);
CREATE INDEX idx_shared_agents_share_id ON shared_agents(share_id);

-- Enable RLS
ALTER TABLE shared_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Add updated_at trigger
CREATE TRIGGER set_shared_agents_updated_at
    BEFORE UPDATE ON shared_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE shared_agents IS 'Stores information about shared agents and their credentials';
COMMENT ON COLUMN shared_agents.agent_id IS 'Reference to the agent being shared';
COMMENT ON COLUMN shared_agents.share_id IS 'Unique identifier for the share link';
COMMENT ON COLUMN shared_agents.credentials IS 'Encrypted API credentials';
COMMENT ON COLUMN shared_agents.views IS 'Number of times the shared agent has been viewed';