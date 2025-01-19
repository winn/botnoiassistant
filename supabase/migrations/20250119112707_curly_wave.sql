-- Create user_credentials table
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    credentials jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT unique_user_credentials UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own credentials"
    ON user_credentials
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Add indexes
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);

-- Add updated_at trigger
CREATE TRIGGER set_user_credentials_updated_at
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE user_credentials IS 'Stores user API credentials in JSON format';
COMMENT ON COLUMN user_credentials.credentials IS 'JSON object containing API credentials (openai, botnoi, etc)';