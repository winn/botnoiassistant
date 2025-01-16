/*
  # Unified User Schema with Relationships

  1. New Tables
    - Create all base tables if they don't exist
    - Add user_id and relationships
    - Add proper foreign key constraints
    - Add indexes for performance
  
  2. Security
    - Enable RLS on all tables
    - Add policies for user-based access control
    - Ensure data isolation between users

  3. Features
    - Public/private sharing for agents and tools
    - Automatic user_id assignment
    - Efficient indexing
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    character text NOT NULL,
    actions text NOT NULL,
    enabled_tools jsonb DEFAULT '[]'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    user_id uuid REFERENCES auth.users(id),
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    input_schema jsonb NOT NULL,
    output_schema jsonb NOT NULL,
    method text NOT NULL DEFAULT 'GET',
    endpoint text NOT NULL,
    headers jsonb DEFAULT '{}'::jsonb,
    body_template jsonb DEFAULT '{}'::jsonb,
    user_id uuid REFERENCES auth.users(id),
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL,
    value jsonb NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (key, user_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id text NOT NULL,
    user_input text NOT NULL,
    ai_response text,
    debug_info jsonb,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

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
CREATE POLICY "Users can manage their own agents" ON agents
    FOR ALL
    USING (user_id = auth.uid() OR is_public = true)
    WITH CHECK (user_id = auth.uid());

-- Policies for tools
CREATE POLICY "Users can manage their own tools" ON tools
    FOR ALL
    USING (user_id = auth.uid() OR is_public = true)
    WITH CHECK (user_id = auth.uid());

-- Policies for settings
CREATE POLICY "Users can manage their own settings" ON settings
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policies for conversations
CREATE POLICY "Users can manage their own conversations" ON conversations
    FOR ALL
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
CREATE TRIGGER set_agents_user_id
    BEFORE INSERT ON agents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_tools_user_id
    BEFORE INSERT ON tools
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_settings_user_id
    BEFORE INSERT ON settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_conversations_user_id
    BEFORE INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();