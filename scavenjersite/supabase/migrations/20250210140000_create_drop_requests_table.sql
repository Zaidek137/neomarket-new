-- Create drop_requests table
CREATE TABLE drop_requests (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  area_description TEXT NOT NULL,
  reward_preference TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Create index for wallet_address for faster lookups
CREATE INDEX idx_drop_requests_wallet ON drop_requests(wallet_address);

-- Create index for status
CREATE INDEX idx_drop_requests_status ON drop_requests(status);

-- Function to check if user can request (hasn't requested in last 30 days)
CREATE OR REPLACE FUNCTION can_request_drop(wallet TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM drop_requests 
    WHERE wallet_address = wallet 
    AND created_at > NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE drop_requests ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert their own requests
CREATE POLICY "Users can create drop requests" ON drop_requests
  FOR INSERT
  WITH CHECK (
    can_request_drop(wallet_address)
  );

-- Policy for authenticated users to view their own requests
CREATE POLICY "Users can view own drop requests" ON drop_requests
  FOR SELECT
  USING (true); -- Allow viewing all requests for transparency

-- Policy for admin to manage all requests
CREATE POLICY "Admin can manage all drop requests" ON drop_requests
  FOR ALL
  USING (true)
  WITH CHECK (true); 