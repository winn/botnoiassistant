/*
  # Conversations Schema

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `agent_id` (text, required) - ID of the agent used
      - `user_input` (text, required) - User's message
      - `ai_response` (text) - AI's response
      - `debug_info` (jsonb) - Debug information
      - `created_at` (timestamptz) - Timestamp of creation
      - `user_id` (uuid) - Reference to auth.users
    
  2. Security
    - Enable RLS on conversations table
    - Add policies for authenticated users to:
      - Read their own conversations
      - Insert new conversations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  user_input text NOT NULL,
  ai_response text,
  debug_info jsonb,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);