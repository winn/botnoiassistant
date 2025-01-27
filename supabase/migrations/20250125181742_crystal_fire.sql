-- Add voice settings columns to agents table
ALTER TABLE agents
ADD COLUMN speech_recognition_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN text_to_speech_enabled boolean NOT NULL DEFAULT true;

-- Add comments
COMMENT ON COLUMN agents.speech_recognition_enabled IS 'Whether speech recognition is enabled for this agent';
COMMENT ON COLUMN agents.text_to_speech_enabled IS 'Whether text-to-speech is enabled for this agent';