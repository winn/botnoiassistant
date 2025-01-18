-- Drop existing foreign key if exists
ALTER TABLE conversations 
  DROP CONSTRAINT IF EXISTS fk_conversations_agent;

-- Ensure agent_id is UUID and properly referenced
ALTER TABLE conversations 
  ALTER COLUMN agent_id TYPE uuid USING agent_id::uuid;

-- Add foreign key constraint with cascade delete
ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_agent
  FOREIGN KEY (agent_id)
  REFERENCES agents(id)
  ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id 
  ON conversations(agent_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_agent 
  ON conversations(user_id, agent_id);

-- Update RLS policy to include agent relationship
DROP POLICY IF EXISTS "Users can manage their own conversations" ON conversations;
CREATE POLICY "Users can manage their own conversations" ON conversations
  FOR ALL
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = conversations.agent_id 
      AND (agents.user_id = auth.uid() OR agents.is_public = true)
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = conversations.agent_id 
      AND (agents.user_id = auth.uid() OR agents.is_public = true)
    )
  );