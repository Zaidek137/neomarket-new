import { supabase, convertToFrontendFormat, convertToDbFormat, BurnRewardRow } from './supabaseClient';
import { BurnReward } from '../components/Exchange/BurnExchangeComponents';
import { API_BASE_URL } from '../config/constants';

interface SigningAccount {
  address?: string;
  signMessage?: (args: { message: string } | string) => Promise<string>;
}

type ExchangeAction =
  | 'addBurnReward'
  | 'deleteBurnReward'
  | 'logExchange'
  | 'getPendingExchanges'
  | 'markExchangeProcessed';

interface SignedApiResponse<T> {
  data?: T;
  error?: string;
}

const EXCHANGE_MESSAGE_SCOPE = 'NeoMarket Exchange API';

async function requestSignedExchangeAction<T>(
  action: ExchangeAction,
  payload: Record<string, unknown>,
  account: SigningAccount
): Promise<T> {
  if (!account?.address || !account.signMessage) {
    throw new Error('Please connect a wallet that supports message signing.');
  }

  const timestamp = String(Date.now());
  const nonce = crypto.randomUUID();
  const walletAddress = account.address.toLowerCase();
  const payloadHash = await hashPayload(payload);
  const message = [
    EXCHANGE_MESSAGE_SCOPE,
    `Action: ${action}`,
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
    `Payload Hash: ${payloadHash}`
  ].join('\n');

  let signature: string;
  try {
    signature = await account.signMessage({ message });
  } catch {
    signature = await account.signMessage(message);
  }

  const response = await fetch(`${API_BASE_URL}/exchange/rewards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      walletAddress,
      payload,
      nonce,
      timestamp,
      signature
    })
  });

  const result = await response.json() as SignedApiResponse<T>;

  if (!response.ok || result.error || !result.data) {
    throw new Error(result.error || 'Exchange request failed.');
  }

  return result.data;
}

async function hashPayload(payload: Record<string, unknown>) {
  const data = new TextEncoder().encode(stableStringify(payload));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

export class RewardsService {
  // Get all burn rewards
  async getBurnRewards(): Promise<BurnReward[]> {
    try {
      const { data, error } = await supabase
        .from('burn_rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching burn rewards:', error);
        throw error;
      }

      return (data || []).map(convertToFrontendFormat);
    } catch (error) {
      console.error('Error in getBurnRewards:', error);
      return [];
    }
  }

  // Add a new burn reward
  async addBurnReward(reward: Omit<BurnReward, 'id'>, account: SigningAccount): Promise<BurnReward> {
    try {
      // Check for existing reward
      const existingReward = await this.findRewardByCollection(
        reward.collectionAddress,
        reward.tokenId
      );

      if (existingReward) {
        throw new Error('A reward already exists for this collection and token ID combination');
      }

      // Prepare the data for insertion - explicitly exclude id to let database generate it
      const dbReward = {
        collection_address: reward.collectionAddress,
        token_id: reward.tokenId || null,
        usdt_amount: reward.usdtAmount,
        type: reward.type,
        custom_reward: reward.customReward || null
        // Note: We explicitly don't include 'id' - let Supabase generate it
      };
      
      return await requestSignedExchangeAction<BurnReward>('addBurnReward', dbReward, account);
    } catch (error) {
      console.error('Error in addBurnReward:', error);
      throw error;
    }
  }

  // Delete a burn reward
  async deleteBurnReward(id: string, account: SigningAccount): Promise<void> {
    try {
      await requestSignedExchangeAction<{ id: string }>('deleteBurnReward', { id }, account);
    } catch (error) {
      console.error('Error in deleteBurnReward:', error);
      throw error;
    }
  }

  // Find reward by collection and token ID
  async findRewardByCollection(collectionAddress: string, tokenId?: string): Promise<BurnReward | null> {
    try {
      console.log(`🔍 [DB] Finding reward for collection: ${collectionAddress}, tokenId: ${tokenId}`);
      console.log(`🔍 [DB] Collection address (lowercase): ${collectionAddress.toLowerCase()}`);

      // First try to find a specific token reward
      if (tokenId) {
        console.log(`🔍 [DB] Searching for specific token reward...`);
        console.log(`🔍 [DB] Query parameters: collection_address=${collectionAddress.toLowerCase()}, token_id=${tokenId}`);
        
        const { data: specificData, error: specificError } = await supabase
          .from('burn_rewards')
          .select('*')
          .ilike('collection_address', collectionAddress.toLowerCase())
          .eq('token_id', tokenId)
          .single();

        console.log(`🔍 [DB] Specific token query result:`, { data: specificData, error: specificError });
        
        if (specificError) {
          console.log(`❌ [DB] Specific token query error details:`, {
            code: specificError.code,
            message: specificError.message,
            details: specificError.details,
            hint: specificError.hint
          });
        }

        if (!specificError && specificData) {
          console.log(`✅ [DB] Found specific token reward:`, specificData);
          return convertToFrontendFormat(specificData);
        }
        
        // If specific token query failed with 406, it might be a data type issue
        if (specificError && specificError.code === 'PGRST116') {
          console.log(`⚠️ [DB] 406 error - likely data type mismatch, skipping specific token query`);
        }
      }

      // Then try to find a collection-wide reward (token_id is null)
      console.log(`🔍 [DB] Searching for collection-wide reward...`);
      console.log(`🔍 [DB] Collection query parameters: collection_address=${collectionAddress.toLowerCase()}, token_id=null`);
      
      const { data: generalData, error: generalError } = await supabase
        .from('burn_rewards')
        .select('*')
        .ilike('collection_address', collectionAddress.toLowerCase())
        .is('token_id', null)
        .single();

      console.log(`🔍 [DB] Collection-wide query result:`, { data: generalData, error: generalError });
      
      if (generalError) {
        console.log(`❌ [DB] Collection-wide query error details:`, {
          code: generalError.code,
          message: generalError.message,
          details: generalError.details,
          hint: generalError.hint
        });
      }

      if (!generalError && generalData) {
        console.log(`✅ [DB] Found collection-wide reward:`, generalData);
        return convertToFrontendFormat(generalData);
      }

      console.log(`❌ [DB] No reward found for collection ${collectionAddress}`);
      
      // Let's also check what rewards actually exist in the database
      console.log(`🔍 [DB] Checking all rewards in database for debugging...`);
      const { data: allRewards, error: allError } = await supabase
        .from('burn_rewards')
        .select('*');
      
      console.log(`🔍 [DB] All rewards in database:`, allRewards);
      if (allRewards) {
        console.log(`🔍 [DB] Collection addresses in DB:`, allRewards.map(r => r.collection_address));
        console.log(`🔍 [DB] Token IDs in DB:`, allRewards.map(r => ({ collection: r.collection_address, token_id: r.token_id, type: typeof r.token_id })));
        console.log(`🔍 [DB] Looking for match with: ${collectionAddress.toLowerCase()}`);
        const matches = allRewards.filter(r => r.collection_address.toLowerCase() === collectionAddress.toLowerCase());
        console.log(`🔍 [DB] Matching rewards:`, matches);
        
        if (matches.length > 0) {
          console.log(`✅ [DB] Found ${matches.length} matching rewards for this collection!`);
          matches.forEach((match, index) => {
            console.log(`✅ [DB] Match ${index + 1}:`, {
              id: match.id,
              token_id: match.token_id,
              usdt_amount: match.usdt_amount,
              type: match.type
            });
          });
          
          // If we found matches but the queries above failed, try to return the first collection-wide match
          const collectionWideMatch = matches.find(m => m.token_id === null);
          if (collectionWideMatch) {
            console.log(`🔧 [DB] Using fallback match:`, collectionWideMatch);
            return convertToFrontendFormat(collectionWideMatch);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ [DB] Error in findRewardByCollection:', error);
      return null;
    }
  }

  // Log an exchange event
  async logExchange(exchangeData: {
    userWalletAddress: string;
    collectionAddress: string;
    tokenId: string;
    reward: BurnReward;
    userInfo?: any;
    transferTransactionHash?: string;
  }, account: SigningAccount): Promise<void> {
    try {
      await requestSignedExchangeAction('logExchange', {
        userWalletAddress: exchangeData.userWalletAddress,
        collectionAddress: exchangeData.collectionAddress,
        tokenId: exchangeData.tokenId,
        rewardId: exchangeData.reward.id,
        userInfo: exchangeData.userInfo || null,
        transferTransactionHash: exchangeData.transferTransactionHash || null
      }, account);

      console.log('✅ Exchange logged successfully');
    } catch (error) {
      console.error('Error in logExchange:', error);
      throw error;
    }
  }

  // Get pending exchanges for admin view
  async getPendingExchanges(account: SigningAccount) {
    try {
      return await requestSignedExchangeAction<any[]>('getPendingExchanges', {}, account);
    } catch (error) {
      console.error('Error in getPendingExchanges:', error);
      return [];
    }
  }

  // Mark exchange as processed
  async markExchangeProcessed(exchangeId: string, adminWallet: string, usdtTransactionHash: string | undefined, account: SigningAccount) {
    try {
      await requestSignedExchangeAction('markExchangeProcessed', {
        exchangeId,
        adminWallet,
        usdtTransactionHash: usdtTransactionHash || null
      }, account);
    } catch (error) {
      console.error('Error in markExchangeProcessed:', error);
      throw error;
    }
  }
}

export const rewardsService = new RewardsService();
