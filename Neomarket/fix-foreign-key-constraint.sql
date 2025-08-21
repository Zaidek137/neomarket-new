-- Execute this SQL in your Supabase SQL Editor to fix the foreign key constraint issue
-- This allows logging even after proposals are deleted

-- The issue is that voting_logs has a foreign key to proposals, but when we delete proposals
-- the logs can't reference them anymore. We need to modify the constraint to handle this.

-- Option 1: Change the foreign key constraint to SET NULL on delete
-- This will set proposal_id to NULL when the referenced proposal is deleted
ALTER TABLE voting_logs 
DROP CONSTRAINT IF EXISTS voting_logs_proposal_id_fkey;

ALTER TABLE voting_logs 
ADD CONSTRAINT voting_logs_proposal_id_fkey 
FOREIGN KEY (proposal_id) 
REFERENCES proposals(id) 
ON DELETE SET NULL;

-- Option 2: If you prefer to keep the logs with proposal_id intact, 
-- we can remove the foreign key constraint entirely for logging flexibility
-- Uncomment the following lines if you prefer this approach:

-- ALTER TABLE voting_logs 
-- DROP CONSTRAINT IF EXISTS voting_logs_proposal_id_fkey;
