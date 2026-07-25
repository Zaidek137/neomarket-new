-- Run this on existing NeoMarket exchange databases to stop direct browser writes.
-- Reward management and exchange processing should go through /api/exchange/rewards,
-- where wallet signatures, admin wallets, and NFT transfer ownership are checked.

ALTER TABLE public.burn_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_logs ALTER COLUMN reward_id DROP NOT NULL;

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.burn_rewards;
DROP POLICY IF EXISTS "Allow read access for users" ON public.burn_rewards;
DROP POLICY IF EXISTS "Allow full access for service role" ON public.burn_rewards;
DROP POLICY IF EXISTS burn_rewards_public_read ON public.burn_rewards;
DROP POLICY IF EXISTS burn_rewards_service_role_all ON public.burn_rewards;
DROP POLICY IF EXISTS exchange_logs_service_role_all ON public.exchange_logs;

CREATE POLICY burn_rewards_public_read
  ON public.burn_rewards
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY burn_rewards_service_role_all
  ON public.burn_rewards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY exchange_logs_service_role_all
  ON public.exchange_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.burn_rewards FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.exchange_logs FROM anon, authenticated;
REVOKE SELECT ON public.pending_exchanges_view FROM anon, authenticated;

GRANT SELECT ON public.burn_rewards TO anon, authenticated;
GRANT ALL ON public.burn_rewards TO service_role;
GRANT ALL ON public.exchange_logs TO service_role;
GRANT SELECT ON public.pending_exchanges_view TO service_role;
