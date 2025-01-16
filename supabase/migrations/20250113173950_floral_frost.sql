/*
  # Fix conversations table structure and policies

  1. Changes
    - Drop existing RLS policies
    - Update table structure to make user_id optional
    - Add new RLS policies for both authenticated and public access
    - Add proper indexes for performance

  2. Security
    - Enable RLS
    - Allow public access for unauthenticated users
    - Add policy for authenticated users to access their own data
    - Add policy for public access to store conversations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;

-- Modify user_id to be optional
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Add new policies
CREATE POLICY "Allow authenticated users to access own conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR user_id IS NULL
  )
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

CREATE POLICY "Allow public access to conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_user ON conversations(agent_id, user_id);