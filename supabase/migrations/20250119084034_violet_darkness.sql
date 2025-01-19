-- Drop problematic index if it exists
DROP INDEX IF EXISTS idx_shared_sessions_created_date;

-- Create a more reliable index for date-based queries
CREATE INDEX idx_shared_sessions_created_at ON shared_sessions(created_at);

-- Add function for date extraction
CREATE OR REPLACE FUNCTION get_date_from_timestamp(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ts::date;
$$;

-- Create index using the immutable function
CREATE INDEX idx_shared_sessions_date ON shared_sessions(get_date_from_timestamp(created_at));

-- Add comment
COMMENT ON FUNCTION get_date_from_timestamp IS 'Extracts date from timestamp, used for indexing';