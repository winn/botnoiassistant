-- Drop existing tools table if exists
DROP TABLE IF EXISTS tools CASCADE;

-- Create tools table with correct column names
CREATE TABLE public.tools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    input jsonb NOT NULL,
    output jsonb NOT NULL,
    method text NOT NULL DEFAULT 'GET',
    endpoint text NOT NULL,
    headers jsonb DEFAULT '{}'::jsonb,
    body jsonb DEFAULT '{}'::jsonb,
    user_id uuid REFERENCES auth.users(id),
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT tools_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT tools_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT tools_endpoint_not_empty CHECK (length(trim(endpoint)) > 0)
);

-- Add indexes for performance
CREATE INDEX idx_tools_user_id ON tools(user_id);
CREATE INDEX idx_tools_is_public ON tools(is_public);
CREATE INDEX idx_tools_user_public ON tools(user_id, is_public);
CREATE INDEX idx_tools_created_at ON tools(created_at);

-- Enable Row Level Security
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view public tools"
    ON tools
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can manage their own tools"
    ON tools
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER set_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically set user_id
CREATE TRIGGER set_tools_user_id
    BEFORE INSERT ON tools
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- Add comments for documentation
COMMENT ON TABLE tools IS 'Stores function tools configurations';
COMMENT ON COLUMN tools.id IS 'Unique identifier for the tool';
COMMENT ON COLUMN tools.name IS 'Display name of the tool';
COMMENT ON COLUMN tools.description IS 'Description of what the tool does';
COMMENT ON COLUMN tools.input IS 'Input schema and description';
COMMENT ON COLUMN tools.output IS 'Output schema and description';
COMMENT ON COLUMN tools.method IS 'HTTP method (GET/POST)';
COMMENT ON COLUMN tools.endpoint IS 'API endpoint URL';
COMMENT ON COLUMN tools.headers IS 'HTTP headers configuration';
COMMENT ON COLUMN tools.body IS 'Request body template';
COMMENT ON COLUMN tools.user_id IS 'Reference to the user who owns this tool';
COMMENT ON COLUMN tools.is_public IS 'Whether this tool is publicly accessible';