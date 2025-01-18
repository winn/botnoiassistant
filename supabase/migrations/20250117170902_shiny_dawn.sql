/*
  # Fix database relationships

  1. Changes
    - Update conversations table to use UUID for agent_id
    - Add foreign key relationship between conversations and agents
    - Add indexes for better performance

  2. Security
    - No changes to RLS policies needed
*/

-- Modify conversations table to use UUID for agent_id
ALTER TABLE conversations 
  ALTER COLUMN agent_id TYPE uuid USING agent_id::uuid;

-- Add foreign key constraint
ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_agent
  FOREIGN KEY (agent_id)
  REFERENCES agents(id)
  ON DELETE CASCADE;

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id 
  ON conversations(agent_id);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_agent 
  ON conversations(user_id, agent_id);