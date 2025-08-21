-- Execute this SQL in your Supabase SQL Editor to fix RLS policy issues
-- This will update the Row Level Security policies to allow proper voting functionality

-- First, drop the existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active proposals" ON proposals;
DROP POLICY IF EXISTS "Only admins can create proposals" ON proposals;
DROP POLICY IF EXISTS "Only admins can update proposals" ON proposals;
DROP POLICY IF EXISTS "Users can view their own votes" ON votes;
DROP POLICY IF EXISTS "Users can create votes" ON votes;
DROP POLICY IF EXISTS "Anyone can view voting logs" ON voting_logs;

-- Create more permissive policies for proposals
CREATE POLICY "Allow read access to proposals" ON proposals
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to proposals" ON proposals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to proposals" ON proposals
    FOR UPDATE USING (true);

-- Create more permissive policies for votes
CREATE POLICY "Allow read access to votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to votes" ON votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to votes" ON votes
    FOR UPDATE USING (true);

-- Create more permissive policies for voting logs
CREATE POLICY "Allow read access to voting_logs" ON voting_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to voting_logs" ON voting_logs
    FOR INSERT WITH CHECK (true);

-- Alternatively, if you want to completely disable RLS for now (for testing):
-- ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE voting_logs DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to the authenticated role
GRANT ALL ON proposals TO authenticated;
GRANT ALL ON votes TO authenticated;
GRANT ALL ON voting_logs TO authenticated;

-- Grant necessary permissions to the anon role (for public access)
GRANT SELECT ON proposals TO anon;
GRANT SELECT ON votes TO anon;
GRANT SELECT ON voting_logs TO anon;

-- Also grant usage on the sequences/functions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
