-- Token-governed proposal deletion is retired with the rest of the governance
-- feature. Keep this former helper safe if an operator runs it again.
DROP POLICY IF EXISTS "Allow delete access to proposals" ON public.proposals;
REVOKE DELETE ON public.proposals FROM anon, authenticated;
