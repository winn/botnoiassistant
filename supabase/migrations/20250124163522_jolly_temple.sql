-- Add conversation_history column to shared_sessions table
ALTER TABLE shared_sessions
ADD COLUMN conversation_history jsonb DEFAULT '[]'::jsonb;

-- Add index for performance
CREATE INDEX idx_shared_sessions_conversation_history ON shared_sessions USING gin(conversation_history);

-- Add comment
COMMENT ON COLUMN shared_sessions.conversation_history IS 'Array of conversation messages with roles and content';