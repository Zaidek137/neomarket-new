-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these queries one by one to verify your setup

-- 1. Check if burn_rewards table exists and has correct structure
SELECT 
    'burn_rewards table structure:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'burn_rewards' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if exchange_logs table exists and has correct structure  
SELECT 
    'exchange_logs table structure:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'exchange_logs' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Test inserting a sample reward (this will tell us if the ID generation works)
INSERT INTO burn_rewards (collection_address, usdt_amount, type) 
VALUES ('0x1234567890123456789012345678901234567890', 5.00, 'usdt')
RETURNING id, collection_address, usdt_amount, created_at;

-- 4. Check if the insert worked and count total rewards
SELECT 
    'Total rewards in database:' as info,
    COUNT(*) as count,
    'Sample reward details:' as sample_info,
    id,
    collection_address,
    usdt_amount
FROM burn_rewards 
GROUP BY id, collection_address, usdt_amount
ORDER BY created_at DESC 
LIMIT 1;
