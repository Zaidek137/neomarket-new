-- ========================================
-- FIX ID GENERATION FOR BURN_REWARDS TABLE (V2)
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

-- 4. Test insertion with a VALID Ethereum address format (42 characters, starts with 0x)
INSERT INTO burn_rewards (collection_address, usdt_amount, type) 
VALUES ('0x1234567890123456789012345678901234567890', 1.00, 'usdt')
RETURNING id, collection_address, usdt_amount, created_at;

-- 5. Clean up test data
DELETE FROM burn_rewards WHERE collection_address = '0x1234567890123456789012345678901234567890';

-- 6. Check what constraints exist on the table (to understand the validation)
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class t ON t.oid = c.conrelid
WHERE n.nspname = 'public' 
    AND t.relname = 'burn_rewards'
    AND c.contype = 'c'; -- Check constraints

-- Success message
SELECT '✅ ID generation fixed! You can now add rewards through the admin panel.' as status;
