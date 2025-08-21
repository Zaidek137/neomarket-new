-- TEMPORARY: Disable Row Level Security for testing
-- Execute this SQL in your Supabase SQL Editor to temporarily disable RLS
-- This will allow all operations to work while you test the voting system

-- Disable RLS on all voting tables
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE voting_logs DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON proposals TO authenticated;
GRANT ALL ON votes TO authenticated;
GRANT ALL ON voting_logs TO authenticated;

-- Grant read permissions to anonymous users
GRANT SELECT ON proposals TO anon;
GRANT SELECT ON votes TO anon;
GRANT SELECT ON voting_logs TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- NOTE: In production, you should re-enable RLS with proper policies
-- This is just for testing the voting functionality
