-- ========================================
-- FIX ID GENERATION FOR BURN_REWARDS TABLE
-- ========================================
-- Run this in your Supabase SQL Editor to fix the ID generation issue

-- 1. First, let's check the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'burn_rewards' 
    AND table_schema = 'public'
    AND column_name = 'id';

-- 2. Ensure the ID column has the proper default value
ALTER TABLE burn_rewards 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 3. Verify the change was applied
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'burn_rewards' 
    AND table_schema = 'public'
    AND column_name = 'id';

-- 4. Test insertion to make sure it works
INSERT INTO burn_rewards (collection_address, usdt_amount, type) 
VALUES ('0xTEST123456789', 1.00, 'usdt')
RETURNING id, collection_address, usdt_amount, created_at;

-- 5. Clean up test data
DELETE FROM burn_rewards WHERE collection_address = '0xTEST123456789';

-- Success message
SELECT '✅ ID generation fixed! You can now add rewards through the admin panel.' as status;
