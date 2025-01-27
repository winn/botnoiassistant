-- Add llm_engine column to agents table
ALTER TABLE agents
ADD COLUMN llm_engine text NOT NULL DEFAULT 'gpt-4';

-- Add constraint to ensure valid LLM engine values
ALTER TABLE agents
ADD CONSTRAINT agents_llm_engine_check CHECK (
  llm_engine IN ('gpt-4', 'claude', 'gemini')
);

-- Add index for performance
CREATE INDEX idx_agents_llm_engine ON agents(llm_engine);

-- Add comment
COMMENT ON COLUMN agents.llm_engine IS 'Language model engine used by this agent (gpt-4, claude, gemini)';