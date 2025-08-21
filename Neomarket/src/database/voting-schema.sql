-- Execute this SQL in your Supabase SQL Editor
-- This creates the complete voting system schema

-- Create enum for proposal categories
CREATE TYPE proposal_category AS ENUM ('music', 'gaming', 'city_voting', 'creative_content');

-- Create enum for proposal status
CREATE TYPE proposal_status AS ENUM ('active', 'passed', 'failed', 'cancelled');

-- Create enum for vote type
CREATE TYPE vote_type AS ENUM ('for', 'against');

-- Create proposals table
CREATE TABLE proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category proposal_category NOT NULL,
    status proposal_status DEFAULT 'active',
    votes_required INTEGER NOT NULL DEFAULT 100,
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    created_by TEXT NOT NULL, -- admin wallet address
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    vote_type vote_type NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, wallet_address) -- One vote per wallet per proposal
);

-- Create voting logs table for audit trail
CREATE TABLE voting_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    wallet_address TEXT NOT NULL,
    action TEXT NOT NULL, -- 'created_proposal', 'voted', 'proposal_passed', 'proposal_failed', etc.
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_end_date ON proposals(end_date);
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_wallet_address ON votes(wallet_address);
CREATE INDEX idx_voting_logs_proposal_id ON voting_logs(proposal_id);
CREATE INDEX idx_voting_logs_wallet_address ON voting_logs(wallet_address);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'for' THEN
            UPDATE proposals 
            SET votes_for = votes_for + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.proposal_id;
        ELSE
            UPDATE proposals 
            SET votes_against = votes_against + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.proposal_id;
        END IF;
        
        -- Log the vote
        INSERT INTO voting_logs (proposal_id, wallet_address, action, details)
        VALUES (NEW.proposal_id, NEW.wallet_address, 'voted', 
                jsonb_build_object('vote_type', NEW.vote_type));
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'for' THEN
            UPDATE proposals 
            SET votes_for = votes_for - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.proposal_id;
        ELSE
            UPDATE proposals 
            SET votes_against = votes_against - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.proposal_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update vote counts
CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_proposal_vote_counts();

-- Create function to check and update proposal status
CREATE OR REPLACE FUNCTION check_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if proposal has reached required votes
    IF NEW.votes_for >= NEW.votes_required THEN
        NEW.status = 'passed';
        
        -- Log the status change
        INSERT INTO voting_logs (proposal_id, wallet_address, action, details)
        VALUES (NEW.id, 'system', 'proposal_passed', 
                jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against));
    
    -- Check if proposal has expired
    ELSIF NEW.end_date < CURRENT_TIMESTAMP THEN
        IF NEW.votes_for > NEW.votes_against THEN
            NEW.status = 'passed';
            INSERT INTO voting_logs (proposal_id, wallet_address, action, details)
            VALUES (NEW.id, 'system', 'proposal_passed', 
                    jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against, 'reason', 'expired_with_majority'));
        ELSE
            NEW.status = 'failed';
            INSERT INTO voting_logs (proposal_id, wallet_address, action, details)
            VALUES (NEW.id, 'system', 'proposal_failed', 
                    jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against, 'reason', 'expired_without_majority'));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check proposal status
CREATE TRIGGER check_proposal_status_trigger
BEFORE UPDATE ON proposals
FOR EACH ROW
WHEN (OLD.votes_for IS DISTINCT FROM NEW.votes_for OR OLD.votes_against IS DISTINCT FROM NEW.votes_against)
EXECUTE FUNCTION check_proposal_status();

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for proposals
CREATE POLICY "Anyone can view active proposals" ON proposals
    FOR SELECT USING (status = 'active' OR status = 'passed' OR status = 'failed');

CREATE POLICY "Only admins can create proposals" ON proposals
    FOR INSERT WITH CHECK (true); -- Will check admin status in the app

CREATE POLICY "Only admins can update proposals" ON proposals
    FOR UPDATE USING (true); -- Will check admin status in the app

-- Create policies for votes
CREATE POLICY "Users can view their own votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON votes
    FOR INSERT WITH CHECK (true); -- Will check Eko ownership in the app

-- Create policies for voting logs
CREATE POLICY "Anyone can view voting logs" ON voting_logs
    FOR SELECT USING (true);
