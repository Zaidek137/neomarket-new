-- Execute this SQL in your Supabase SQL Editor to add delete permissions for proposals

-- Add delete policy for proposals (admins can delete)
CREATE POLICY "Allow delete access to proposals" ON proposals
    FOR DELETE USING (true); -- Admin check is done in the app

-- Grant delete permissions to authenticated users
GRANT DELETE ON proposals TO authenticated;
