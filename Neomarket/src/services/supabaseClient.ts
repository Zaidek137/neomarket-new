import { createClient } from '@supabase/supabase-js';

// Create Supabase client for frontend operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface BurnRewardRow {
  id: string;
  collection_address: string;
  token_id: string | null;
  usdt_amount: number;
  type: 'usdt' | 'custom';
  custom_reward: any | null;
  created_at: string;
}

export interface ExchangeLogRow {
  id: string;
  user_wallet_address: string;
  collection_address: string;
  token_id: string;
  reward_id: string;
  usdt_amount: number | null;
  reward_type: string;
  custom_reward_data: any | null;
  user_info: any | null;
  transfer_transaction_hash: string | null;
  status: 'pending_usdt' | 'processed' | 'cancelled';
  processed_by_admin_wallet: string | null;
  usdt_transaction_hash: string | null;
  created_at: string;
  updated_at: string | null;
}

// Utility functions for data conversion
export const convertToFrontendFormat = (dbReward: BurnRewardRow) => ({
  id: dbReward.id,
  collectionAddress: dbReward.collection_address,
  tokenId: dbReward.token_id,
  usdtAmount: dbReward.usdt_amount,
  type: dbReward.type,
  customReward: dbReward.custom_reward
});

export const convertToDbFormat = (frontendReward: any) => ({
  collection_address: frontendReward.collectionAddress,
  token_id: frontendReward.tokenId || null,
  usdt_amount: frontendReward.usdtAmount,
  type: frontendReward.type,
  custom_reward: frontendReward.customReward || null
});
