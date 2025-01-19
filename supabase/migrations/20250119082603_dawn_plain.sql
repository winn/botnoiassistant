-- Delete test tools and agents
DELETE FROM tools WHERE name LIKE 'test%';
DELETE FROM agents WHERE name = 'botnoi';

-- Add comment for documentation
COMMENT ON TABLE tools IS 'Cleaned up test data on 2025-01-19';
COMMENT ON TABLE agents IS 'Cleaned up test data on 2025-01-19';