import { supabase, convertToFrontendFormat, convertToDbFormat, BurnRewardRow } from './supabaseClient';
import { BurnReward } from '../components/Exchange/BurnExchangeComponents';

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
  async addBurnReward(reward: Omit<BurnReward, 'id'>): Promise<BurnReward> {
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
      
      const { data, error } = await supabase
        .from('burn_rewards')
        .insert([dbReward])
        .select()
        .single();

      if (error) {
        console.error('Error adding burn reward:', error);
        console.error('Reward data being inserted:', dbReward);
        throw error;
      }

      return convertToFrontendFormat(data);
    } catch (error) {
      console.error('Error in addBurnReward:', error);
      throw error;
    }
  }

  // Delete a burn reward
  async deleteBurnReward(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('burn_rewards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting burn reward:', error);
        throw error;
      }
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
  }): Promise<void> {
    try {
      const logEntry = {
        user_wallet_address: exchangeData.userWalletAddress,
        collection_address: exchangeData.collectionAddress,
        token_id: exchangeData.tokenId,
        reward_id: exchangeData.reward.id!,
        usdt_amount: exchangeData.reward.usdtAmount,
        reward_type: exchangeData.reward.type,
        custom_reward_data: exchangeData.reward.customReward || null,
        user_info: exchangeData.userInfo || null,
        transfer_transaction_hash: exchangeData.transferTransactionHash || null,
        status: 'pending_usdt' as const
      };

      const { error } = await supabase
        .from('exchange_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Error logging exchange:', error);
        throw error;
      }

      console.log('✅ Exchange logged successfully');
    } catch (error) {
      console.error('Error in logExchange:', error);
      throw error;
    }
  }

  // Get pending exchanges for admin view
  async getPendingExchanges() {
    try {
      const { data, error } = await supabase
        .from('pending_exchanges_view')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending exchanges:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingExchanges:', error);
      return [];
    }
  }

  // Mark exchange as processed
  async markExchangeProcessed(exchangeId: string, adminWallet: string, usdtTransactionHash?: string) {
    try {
      const { error } = await supabase
        .from('exchange_logs')
        .update({
          status: 'processed',
          processed_by_admin_wallet: adminWallet,
          usdt_transaction_hash: usdtTransactionHash || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', exchangeId);

      if (error) {
        console.error('Error marking exchange as processed:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markExchangeProcessed:', error);
      throw error;
    }
  }
}

export const rewardsService = new RewardsService();
