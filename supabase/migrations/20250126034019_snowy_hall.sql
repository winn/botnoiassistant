-- Add greeting column to agents table
ALTER TABLE agents
ADD COLUMN greeting text;

-- Set default greeting for existing agents
UPDATE agents
SET greeting = 'Hello! I''m here to help you. How can I assist you today?'
WHERE greeting IS NULL;

-- Make greeting column required
ALTER TABLE agents
ALTER COLUMN greeting SET NOT NULL;

-- Add comment
COMMENT ON COLUMN agents.greeting IS 'Initial message sent when agent is selected';

-- Add constraint to ensure greeting is not empty
ALTER TABLE agents
ADD CONSTRAINT agents_greeting_not_empty CHECK (length(trim(greeting)) > 0);