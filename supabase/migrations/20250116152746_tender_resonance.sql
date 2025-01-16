/*
  # Unified User Schema with Relationships

  1. New Tables & Modifications
    - Add user_id to all existing tables
    - Add proper foreign key constraints
    - Add indexes for performance
    - Enable RLS with user-based policies
  
  2. Security
    - Enable RLS on all tables
    - Add policies for user-based access control
    - Ensure data isolation between users

  3. Changes
    - Add user_id column to agents, tools, settings, conversations
    - Add foreign key constraints
    - Add composite indexes for common queries
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Modify agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Modify tools table
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Modify settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Modify conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON tools(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agents_user_public ON agents(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_tools_user_public ON tools(user_id, is_public);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for agents
DROP POLICY IF EXISTS "Users can manage their own agents" ON agents;
CREATE POLICY "Users can manage their own agents" ON agents
  USING (user_id = auth.uid() OR is_public = true)
  WITH CHECK (user_id = auth.uid());

-- Policies for tools
DROP POLICY IF EXISTS "Users can manage their own tools" ON tools;
CREATE POLICY "Users can manage their own tools" ON tools
  USING (user_id = auth.uid() OR is_public = true)
  WITH CHECK (user_id = auth.uid());

-- Policies for settings
DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;
CREATE POLICY "Users can manage their own settings" ON settings
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for conversations
DROP POLICY IF EXISTS "Users can manage their own conversations" ON conversations;
CREATE POLICY "Users can manage their own conversations" ON conversations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Triggers to automatically set user_id
DROP TRIGGER IF EXISTS set_agents_user_id ON agents;
CREATE TRIGGER set_agents_user_id
  BEFORE INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_tools_user_id ON tools;
CREATE TRIGGER set_tools_user_id
  BEFORE INSERT ON tools
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_settings_user_id ON settings;
CREATE TRIGGER set_settings_user_id
  BEFORE INSERT ON settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_conversations_user_id ON conversations;
CREATE TRIGGER set_conversations_user_id
  BEFORE INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();