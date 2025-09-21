-- ========================================
-- COMPLETE SERVERLESS NFT EXCHANGE SCHEMA
-- ========================================
-- Run this entire script in your Supabase SQL Editor

-- First, drop existing tables if they exist (optional - only if you want to start fresh)
-- DROP TABLE IF EXISTS exchange_logs CASCADE;
-- DROP TABLE IF EXISTS burn_rewards CASCADE;

-- ========================================
-- 1. BURN REWARDS TABLE
-- ========================================
-- This table stores the reward configurations for NFT collections

CREATE TABLE IF NOT EXISTS burn_rewards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    collection_address TEXT NOT NULL,
    token_id TEXT NULL, -- NULL means reward applies to all tokens in collection
    usdt_amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL DEFAULT 'usdt' CHECK (type IN ('usdt', 'custom')),
    custom_reward JSONB NULL, -- For custom rewards like physical items
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL,
    
    -- Ensure no duplicate rewards for same collection/token combination
    UNIQUE(collection_address, token_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_burn_rewards_collection_address ON burn_rewards(collection_address);
CREATE INDEX IF NOT EXISTS idx_burn_rewards_token_id ON burn_rewards(token_id);
CREATE INDEX IF NOT EXISTS idx_burn_rewards_type ON burn_rewards(type);
CREATE INDEX IF NOT EXISTS idx_burn_rewards_created_at ON burn_rewards(created_at DESC);

-- ========================================
-- 2. EXCHANGE LOGS TABLE
-- ========================================
-- This table records all successful NFT exchanges for manual USDT processing

CREATE TABLE IF NOT EXISTS exchange_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_wallet_address TEXT NOT NULL,
    collection_address TEXT NOT NULL,
    token_id TEXT NOT NULL,
    reward_id TEXT NOT NULL,
    usdt_amount DECIMAL(10,2) NULL, -- Amount of USDT to be sent (for display/manual processing)
    reward_type TEXT NOT NULL,
    custom_reward_data JSONB NULL,
    user_info JSONB NULL, -- Optional user contact info for custom rewards
    transfer_transaction_hash TEXT NULL, -- Hash of the NFT transfer transaction
    status TEXT NOT NULL DEFAULT 'pending_usdt' CHECK (status IN ('pending_usdt', 'processed', 'cancelled')),
    processed_by_admin_wallet TEXT NULL,
    usdt_transaction_hash TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL,

    -- Foreign key relationship (but don't enforce it strictly in case rewards are deleted)
    CONSTRAINT fk_reward
        FOREIGN KEY (reward_id)
        REFERENCES burn_rewards(id)
        ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_logs_user_wallet_address ON exchange_logs(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_collection_address ON exchange_logs(collection_address);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_status ON exchange_logs(status);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_created_at ON exchange_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_reward_id ON exchange_logs(reward_id);

-- ========================================
-- 3. VIEWS FOR EASIER QUERYING
-- ========================================

-- Create a view for easier querying of pending exchanges with reward details
CREATE OR REPLACE VIEW pending_exchanges_view AS
SELECT
    el.id,
    el.user_wallet_address,
    el.collection_address,
    el.token_id,
    el.usdt_amount,
    el.reward_type,
    el.custom_reward_data,
    el.user_info,
    el.transfer_transaction_hash,
    el.status,
    el.created_at,
    el.updated_at,
    br.usdt_amount as configured_usdt_amount,
    br.type as configured_reward_type,
    br.custom_reward as configured_custom_reward
FROM
    exchange_logs el
LEFT JOIN
    burn_rewards br ON el.reward_id = br.id
WHERE
    el.status = 'pending_usdt'
ORDER BY
    el.created_at ASC;

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS) SETUP
-- ========================================
-- Disable RLS for now to avoid permission issues
-- You can enable and configure RLS later if needed for multi-tenant setup

ALTER TABLE burn_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_logs DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. SAMPLE DATA (OPTIONAL)
-- ========================================
-- Uncomment to add some sample data for testing

/*
-- Sample burn reward for testing
INSERT INTO burn_rewards (collection_address, token_id, usdt_amount, type) 
VALUES ('0x98E52EF271F0ff90F2f76A40Cb6A27dA011d279F', NULL, 10.00, 'usdt')
ON CONFLICT (collection_address, token_id) DO NOTHING;

-- Sample custom reward
INSERT INTO burn_rewards (collection_address, token_id, usdt_amount, type, custom_reward) 
VALUES (
    '0x30ddc08825d820b6933c78a1ad9fb3bdbead6e47', 
    NULL, 
    0.00, 
    'custom',
    '{"title": "Physical Eko Figurine", "description": "Limited edition physical figurine shipped to your address", "requiresInfo": true}'::jsonb
)
ON CONFLICT (collection_address, token_id) DO NOTHING;
*/

-- ========================================
-- 6. VERIFICATION QUERIES
-- ========================================
-- Run these to verify everything was created correctly

-- Check burn_rewards table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'burn_rewards' 
ORDER BY ordinal_position;

-- Check exchange_logs table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'exchange_logs' 
ORDER BY ordinal_position;

-- Check if view was created
SELECT * FROM pending_exchanges_view LIMIT 1;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ NFT Exchange Schema Setup Complete!';
    RAISE NOTICE '📋 Tables created: burn_rewards, exchange_logs';
    RAISE NOTICE '👁️  Views created: pending_exchanges_view';
    RAISE NOTICE '🔧 Indexes and constraints applied';
    RAISE NOTICE '🚀 Ready for serverless NFT exchange operations!';
END $$;
