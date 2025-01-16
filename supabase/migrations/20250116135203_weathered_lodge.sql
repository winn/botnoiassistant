/*
  # Database Schema for Agents, Tools, and Settings

  1. New Tables
    - agents: Stores AI agent configurations
    - tools: Stores function tool definitions
    - settings: Stores application settings
  
  2. Security
    - Enable RLS on all tables
    - Add public access policies
  
  3. Performance
    - Add indexes for frequently queried columns
    - Add updated_at triggers for change tracking
*/

-- Create agents table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    character text NOT NULL,
    actions text NOT NULL,
    enabled_tools jsonb DEFAULT '[]'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create tools table if it doesn't exist
DO $$ BEGIN
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create settings table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on tables if not already enabled
DO $$ BEGIN
  ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable full public access to agents" ON agents;
  CREATE POLICY "Enable full public access to agents"
    ON agents
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable full public access to tools" ON tools;
  CREATE POLICY "Enable full public access to tools"
    ON tools
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable full public access to settings" ON settings;
  CREATE POLICY "Enable full public access to settings"
    ON settings
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$ BEGIN
  CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;