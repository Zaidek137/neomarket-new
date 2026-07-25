import { createClient } from '@supabase/supabase-js';

/**
 * Supabase-based reward storage service
 * Provides persistent storage for burn rewards using Supabase database
 */
class SupabaseRewardStorage {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('✅ Supabase storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Get all burn rewards
   */
  async getBurnRewards() {
    try {
      const { data, error } = await this.supabase
        .from('burn_rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching burn rewards:', error);
        throw error;
      }

      return (data || []).map(item => this.convertToFrontendFormat(item));
    } catch (error) {
      console.error('Error in getBurnRewards:', error);
      return [];
    }
  }

  /**
   * Add a new burn reward
   */
  async addBurnReward(reward) {
    try {
      const { data, error } = await this.supabase
        .from('burn_rewards')
        .insert([{
          id: reward.id,
          collection_address: reward.collectionAddress,
          token_id: reward.tokenId || null,
          usdt_amount: reward.usdtAmount,
          type: reward.type,
          custom_reward: reward.customReward || null,
          created_at: reward.createdAt
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding burn reward:', error);
        throw error;
      }

      // Convert back to frontend format
      return this.convertToFrontendFormat(data);
    } catch (error) {
      console.error('Error in addBurnReward:', error);
      throw error;
    }
  }

  /**
   * Find reward by ID
   */
  async findRewardById(id) {
    try {
      const { data, error } = await this.supabase
        .from('burn_rewards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error finding reward by ID:', error);
        throw error;
      }

      return this.convertToFrontendFormat(data);
    } catch (error) {
      console.error('Error in findRewardById:', error);
      return null;
    }
  }

  /**
   * Update reward by ID
   */
  async updateReward(id, updates) {
    try {
      const updateData = {};
      
      if (updates.collectionAddress) updateData.collection_address = updates.collectionAddress;
      if (updates.tokenId !== undefined) updateData.token_id = updates.tokenId;
      if (updates.usdtAmount) updateData.usdt_amount = updates.usdtAmount;
      if (updates.type) updateData.type = updates.type;
      if (updates.customReward !== undefined) updateData.custom_reward = updates.customReward;
      if (updates.updatedAt) updateData.updated_at = updates.updatedAt;

      const { data, error } = await this.supabase
        .from('burn_rewards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward:', error);
        throw error;
      }

      return this.convertToFrontendFormat(data);
    } catch (error) {
      console.error('Error in updateReward:', error);
      return null;
    }
  }

  /**
   * Remove reward by ID
   */
  async removeReward(id) {
    try {
      const { error } = await this.supabase
        .from('burn_rewards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing reward:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeReward:', error);
      return false;
    }
  }

  /**
   * Find reward by collection and token
   */
  async findRewardByCollection(collectionAddress, tokenId = null) {
    try {

      // First try to find specific token reward
      if (tokenId) {
        const { data: specificData, error: specificError } = await this.supabase
          .from('burn_rewards')
          .select('*')
          .eq('collection_address', collectionAddress.toLowerCase())
          .eq('token_id', tokenId)
          .single();

        if (!specificError && specificData) {
          return this.convertToFrontendFormat(specificData);
        }
      }

      // Fall back to collection-wide reward (where token_id is null)
      const { data: generalData, error: generalError } = await this.supabase
        .from('burn_rewards')
        .select('*')
        .eq('collection_address', collectionAddress.toLowerCase())
        .is('token_id', null)
        .single();

      if (generalError) {
        if (generalError.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error finding reward by collection:', generalError);
        return null;
      }

      return this.convertToFrontendFormat(generalData);
    } catch (error) {
      console.error('Error in findRewardByCollection:', error);
      return null;
    }
  }

  /**
   * Check for duplicate rewards
   */
  async findDuplicate(collectionAddress, tokenId) {
    try {
      let query = this.supabase
        .from('burn_rewards')
        .select('*')
        .eq('collection_address', collectionAddress.toLowerCase());

      if (tokenId) {
        query = query.eq('token_id', tokenId);
      } else {
        query = query.is('token_id', null);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - no duplicate
          return null;
        }
        console.error('Error checking for duplicate:', error);
        return null;
      }

      return this.convertToFrontendFormat(data);
    } catch (error) {
      console.error('Error in findDuplicate:', error);
      return null;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const { data, error } = await this.supabase
        .from('burn_rewards')
        .select('type, usdt_amount, collection_address');

      if (error) {
        console.error('Error getting stats:', error);
        throw error;
      }

      const stats = {
        totalRewards: data.length,
        usdtRewards: data.filter(r => r.type === 'usdt').length,
        customRewards: data.filter(r => r.type === 'custom').length,
        collections: [...new Set(data.map(r => r.collection_address))].length,
        totalUsdtValue: data
          .filter(r => r.type === 'usdt')
          .reduce((sum, r) => sum + parseFloat(r.usdt_amount), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalRewards: 0,
        usdtRewards: 0,
        customRewards: 0,
        collections: 0,
        totalUsdtValue: 0
      };
    }
  }

  /**
   * Convert database format to frontend format
   */
  convertToFrontendFormat(data) {
    if (!data) return null;

    return {
      id: data.id,
      collectionAddress: data.collection_address,
      tokenId: data.token_id,
      usdtAmount: parseFloat(data.usdt_amount),
      type: data.type,
      customReward: data.custom_reward,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('burn_rewards')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new SupabaseRewardStorage();
