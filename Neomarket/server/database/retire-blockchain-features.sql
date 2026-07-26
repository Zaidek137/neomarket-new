-- NeoMarket no longer operates NFT exchanges or token governance.
-- Run this on existing databases to remove every direct browser capability.

DO $$
DECLARE
  table_name TEXT;
  policy_row RECORD;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'burn_rewards',
    'exchange_logs',
    'proposals',
    'votes',
    'voting_logs'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      FOR policy_row IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = table_name
      LOOP
        EXECUTE format(
          'DROP POLICY IF EXISTS %I ON public.%I',
          policy_row.policyname,
          table_name
        );
      END LOOP;
      EXECUTE format(
        'REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated, service_role',
        table_name
      );
    END IF;
  END LOOP;

  IF to_regclass('public.pending_exchanges_view') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.pending_exchanges_view
      FROM PUBLIC, anon, authenticated, service_role;
  END IF;
END $$;
