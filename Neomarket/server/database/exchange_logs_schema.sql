-- Exchange Logs Table
-- This table logs all NFT exchange events for manual USDT processing

-- Create the exchange_logs table
CREATE TABLE IF NOT EXISTS exchange_logs (
    -- Primary identifier
    id TEXT PRIMARY KEY,
    
    -- User information
    user_wallet_address TEXT NOT NULL,
    
    -- NFT information
    collection_address TEXT NOT NULL,
    token_id TEXT NOT NULL,
    
    -- Reward information
    reward_id TEXT NOT NULL, -- References burn_rewards.id
    usdt_amount DECIMAL(10,2) NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('usdt', 'custom')),
    
    -- Transaction information
    transfer_transaction_hash TEXT NULL, -- Hash of NFT transfer to server wallet
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    processed_at TIMESTAMPTZ NULL,
    processed_by TEXT NULL, -- Admin wallet who processed it
    usdt_transaction_hash TEXT NULL, -- Hash of USDT transfer to user
    
    -- Additional data
    custom_reward_data JSONB NULL, -- For custom rewards
    user_info JSONB NULL, -- User contact info if provided
    notes TEXT NULL, -- Admin notes
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL,
    
    -- Constraints
    CONSTRAINT valid_user_address CHECK (user_wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
    CONSTRAINT valid_collection_address CHECK (collection_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_logs_user_wallet ON exchange_logs(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_status ON exchange_logs(status);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_created_at ON exchange_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_collection ON exchange_logs(collection_address);
CREATE INDEX IF NOT EXISTS idx_exchange_logs_reward_id ON exchange_logs(reward_id);

-- Add comments for documentation
COMMENT ON TABLE exchange_logs IS 'Log of all NFT exchange events for manual USDT processing';
COMMENT ON COLUMN exchange_logs.id IS 'Unique identifier for the exchange event';
COMMENT ON COLUMN exchange_logs.user_wallet_address IS 'Wallet address of the user who exchanged the NFT';
COMMENT ON COLUMN exchange_logs.collection_address IS 'NFT collection address';
COMMENT ON COLUMN exchange_logs.token_id IS 'Specific token ID that was exchanged';
COMMENT ON COLUMN exchange_logs.reward_id IS 'ID of the reward configuration used';
COMMENT ON COLUMN exchange_logs.status IS 'Processing status: pending, processed, or failed';
COMMENT ON COLUMN exchange_logs.usdt_transaction_hash IS 'Transaction hash of USDT payment to user';

-- Temporarily disable Row Level Security for easier admin access
ALTER TABLE exchange_logs DISABLE ROW LEVEL SECURITY;

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW pending_exchanges AS
SELECT 
    id,
    user_wallet_address,
    collection_address,
    token_id,
    usdt_amount,
    reward_type,
    status,
    created_at,
    transfer_transaction_hash,
    -- Format for easy viewing
    CONCAT(usdt_amount, ' USDT') as reward_display,
    CASE 
        WHEN status = 'pending' THEN '⏳ Pending'
        WHEN status = 'processed' THEN '✅ Processed'
        WHEN status = 'failed' THEN '❌ Failed'
    END as status_display,
    -- Time since exchange
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM exchange_logs
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON exchange_logs TO authenticated, anon, service_role;
GRANT SELECT ON pending_exchanges TO authenticated, anon, service_role;
