-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow authenticated users to access own conversations" ON conversations;

-- Remove the foreign key constraint on user_id
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

-- Make user_id completely optional
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create a single policy for complete public access
CREATE POLICY "Enable full public access"
  ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);