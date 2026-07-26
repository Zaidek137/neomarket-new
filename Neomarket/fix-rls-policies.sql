-- Token governance has been retired. This compatibility script now removes
-- legacy browser-write policies instead of restoring them.
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow update access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow delete access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Only admins can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Only admins can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow insert access to votes" ON public.votes;
DROP POLICY IF EXISTS "Allow update access to votes" ON public.votes;
DROP POLICY IF EXISTS "Users can create votes" ON public.votes;
DROP POLICY IF EXISTS "Allow insert access to voting_logs" ON public.voting_logs;

REVOKE INSERT, UPDATE, DELETE ON public.proposals FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.votes FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.voting_logs FROM anon, authenticated;
