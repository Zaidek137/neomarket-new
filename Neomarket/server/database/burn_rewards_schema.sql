-- NFT Burn Rewards Table
-- This table stores the configuration for NFT burn and exchange rewards

-- Create the burn_rewards table
CREATE TABLE IF NOT EXISTS burn_rewards (
    -- Primary identifier
    id TEXT PRIMARY KEY,
    
    -- NFT Collection information
    collection_address TEXT NOT NULL,
    token_id TEXT NULL, -- NULL means reward applies to entire collection
    
    -- Reward information
    usdt_amount DECIMAL(10,2) NOT NULL CHECK (usdt_amount > 0),
    type TEXT NOT NULL CHECK (type IN ('usdt', 'custom')),
    
    -- Custom reward details (JSON format)
    custom_reward JSONB NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL,
    
    -- Constraints
    CONSTRAINT unique_collection_token UNIQUE (collection_address, token_id),
    CONSTRAINT valid_collection_address CHECK (collection_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_burn_rewards_collection_address ON burn_rewards(collection_address);
CREATE INDEX IF NOT EXISTS idx_burn_rewards_type ON burn_rewards(type);
CREATE INDEX IF NOT EXISTS idx_burn_rewards_created_at ON burn_rewards(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE burn_rewards IS 'Configuration table for NFT burn and exchange rewards';
COMMENT ON COLUMN burn_rewards.id IS 'Unique identifier for the reward configuration';
COMMENT ON COLUMN burn_rewards.collection_address IS 'Ethereum address of the NFT collection (lowercase)';
COMMENT ON COLUMN burn_rewards.token_id IS 'Specific token ID, or NULL for collection-wide rewards';
COMMENT ON COLUMN burn_rewards.usdt_amount IS 'Amount of USDT to reward (must be positive)';
COMMENT ON COLUMN burn_rewards.type IS 'Type of reward: usdt or custom';
COMMENT ON COLUMN burn_rewards.custom_reward IS 'JSON object containing custom reward details';

-- Row Level Security (RLS) policies
ALTER TABLE burn_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to the public app
CREATE POLICY "Allow read access for users" ON burn_rewards
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy: Allow full access to service role (for server operations)
CREATE POLICY "Allow full access for service role" ON burn_rewards
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a view for easier querying (optional)
CREATE OR REPLACE VIEW burn_rewards_view AS
SELECT 
    id,
    collection_address,
    token_id,
    usdt_amount,
    type,
    custom_reward,
    created_at,
    updated_at,
    -- Add computed columns
    CASE 
        WHEN token_id IS NULL THEN 'Collection-wide'
        ELSE 'Specific Token'
    END as reward_scope,
    CASE 
        WHEN type = 'usdt' THEN CONCAT(usdt_amount, ' USDT')
        WHEN custom_reward IS NOT NULL THEN (custom_reward->>'title')
        ELSE 'Custom Reward'
    END as reward_display
FROM burn_rewards;

-- Grant permissions on the view
GRANT SELECT ON burn_rewards_view TO authenticated, anon;

-- Optional: Create a function to validate collection addresses
CREATE OR REPLACE FUNCTION validate_collection_address(address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if address is valid Ethereum address format
    RETURN address ~ '^0x[a-fA-F0-9]{40}$';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function to get reward statistics
CREATE OR REPLACE FUNCTION get_burn_rewards_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_rewards', COUNT(*),
        'usdt_rewards', COUNT(*) FILTER (WHERE type = 'usdt'),
        'custom_rewards', COUNT(*) FILTER (WHERE type = 'custom'),
        'total_collections', COUNT(DISTINCT collection_address),
        'total_usdt_value', COALESCE(SUM(usdt_amount) FILTER (WHERE type = 'usdt'), 0)
    ) INTO stats
    FROM burn_rewards;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_burn_rewards_stats() TO authenticated, service_role;
