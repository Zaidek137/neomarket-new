import { createClient } from '@supabase/supabase-js';

class ExchangeLogStorage {
  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for exchange logs. Please check VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY environment variables.');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('✅ Exchange log storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client for exchange logs:', error);
      throw error;
    }
  }

  /**
   * Log a new exchange event
   */
  async logExchange({
    userWalletAddress,
    collectionAddress,
    tokenId,
    rewardId,
    usdtAmount,
    rewardType,
    transferTransactionHash = null,
    customRewardData = null,
    userInfo = null
  }) {
    try {
      const exchangeLog = {
        id: Date.now().toString(),
        user_wallet_address: userWalletAddress.toLowerCase(),
        collection_address: collectionAddress.toLowerCase(),
        token_id: tokenId.toString(),
        reward_id: rewardId,
        usdt_amount: parseFloat(usdtAmount),
        reward_type: rewardType,
        transfer_transaction_hash: transferTransactionHash,
        status: 'pending',
        custom_reward_data: customRewardData,
        user_info: userInfo,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('exchange_logs')
        .insert([exchangeLog])
        .select()
        .single();

      if (error) {
        console.error('Error logging exchange:', error);
        throw error;
      }

      console.log('✅ Exchange logged successfully:', {
        id: data.id,
        user: userWalletAddress,
        amount: usdtAmount,
        status: 'pending'
      });

      return data;
    } catch (error) {
      console.error('Error in logExchange:', error);
      throw error;
    }
  }

  /**
   * Get all pending exchanges for admin review
   */
  async getPendingExchanges() {
    try {
      const { data, error } = await this.supabase
        .from('pending_exchanges')
        .select('*')
        .order('created_at', { ascending: false });

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

  /**
   * Mark exchange as processed
   */
  async markAsProcessed(exchangeId, adminWallet, usdtTransactionHash) {
    try {
      const { data, error } = await this.supabase
        .from('exchange_logs')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          processed_by: adminWallet,
          usdt_transaction_hash: usdtTransactionHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', exchangeId)
        .select()
        .single();

      if (error) {
        console.error('Error marking exchange as processed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in markAsProcessed:', error);
      throw error;
    }
  }

  /**
   * Get exchange statistics
   */
  async getExchangeStats() {
    try {
      const { data, error } = await this.supabase
        .from('exchange_logs')
        .select('status, usdt_amount, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        pending: data.filter(log => log.status === 'pending').length,
        processed: data.filter(log => log.status === 'processed').length,
        totalUsdtPending: data
          .filter(log => log.status === 'pending')
          .reduce((sum, log) => sum + parseFloat(log.usdt_amount), 0),
        totalUsdtProcessed: data
          .filter(log => log.status === 'processed')
          .reduce((sum, log) => sum + parseFloat(log.usdt_amount), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting exchange stats:', error);
      throw error;
    }
  }
}

export default new ExchangeLogStorage();
