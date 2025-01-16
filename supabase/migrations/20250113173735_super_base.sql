/*
  # Create conversations table with authentication

  1. New Tables
    - conversations
      - id (uuid, primary key)
      - agent_id (text)
      - user_input (text)
      - ai_response (text)
      - debug_info (jsonb)
      - created_at (timestamptz)
      - user_id (uuid, nullable)

  2. Security
    - Enable RLS
    - Add policies for authenticated and public access
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  user_input text NOT NULL,
  ai_response text,
  debug_info jsonb,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow public access (no authentication required)
CREATE POLICY "Allow public access to conversations"
  ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);