-- Run this on existing NeoMarket voting databases to stop direct browser writes.
-- Proposal and vote writes should go through /api/voting/*, where wallet signatures,
-- admin wallets, and Eko ownership are checked server-side.

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS image_url TEXT;

DROP POLICY IF EXISTS "Only admins can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Only admins can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow insert access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow update access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow delete access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Service role can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Service role can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Service role can delete proposals" ON public.proposals;

DROP POLICY IF EXISTS "Users can create votes" ON public.votes;
DROP POLICY IF EXISTS "Allow insert access to votes" ON public.votes;
DROP POLICY IF EXISTS "Allow update access to votes" ON public.votes;
DROP POLICY IF EXISTS "Service role can create votes" ON public.votes;
DROP POLICY IF EXISTS "Service role can delete votes" ON public.votes;

DROP POLICY IF EXISTS "Service role can create voting logs" ON public.voting_logs;
DROP POLICY IF EXISTS "Allow insert access to voting_logs" ON public.voting_logs;

CREATE POLICY "Service role can create proposals" ON public.proposals
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update proposals" ON public.proposals
    FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete proposals" ON public.proposals
    FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role can create votes" ON public.votes
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can delete votes" ON public.votes
    FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role can create voting logs" ON public.voting_logs
    FOR INSERT TO service_role WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'for' THEN
            UPDATE public.proposals
            SET votes_for = votes_for + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.proposal_id;
        ELSE
            UPDATE public.proposals
            SET votes_against = votes_against + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.proposal_id;
        END IF;

        INSERT INTO public.voting_logs (proposal_id, wallet_address, action, details)
        VALUES (NEW.proposal_id, NEW.wallet_address, 'voted',
                jsonb_build_object('vote_type', NEW.vote_type));
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'for' THEN
            UPDATE public.proposals
            SET votes_for = votes_for - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.proposal_id;
        ELSE
            UPDATE public.proposals
            SET votes_against = votes_against - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.proposal_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.votes_for >= NEW.votes_required THEN
        NEW.status = 'passed';

        INSERT INTO public.voting_logs (proposal_id, wallet_address, action, details)
        VALUES (NEW.id, 'system', 'proposal_passed',
                jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against));

    ELSIF NEW.end_date < CURRENT_TIMESTAMP THEN
        IF NEW.votes_for > NEW.votes_against THEN
            NEW.status = 'passed';
            INSERT INTO public.voting_logs (proposal_id, wallet_address, action, details)
            VALUES (NEW.id, 'system', 'proposal_passed',
                    jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against, 'reason', 'expired_with_majority'));
        ELSE
            NEW.status = 'failed';
            INSERT INTO public.voting_logs (proposal_id, wallet_address, action, details)
            VALUES (NEW.id, 'system', 'proposal_failed',
                    jsonb_build_object('votes_for', NEW.votes_for, 'votes_against', NEW.votes_against, 'reason', 'expired_without_majority'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
