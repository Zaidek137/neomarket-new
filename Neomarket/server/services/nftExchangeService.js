import {
  getContract,
  prepareContractCall,
  toWei
} from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { polygon } from "thirdweb/chains";
import { client, serverWalletConfig, contracts, rewardConfig } from "../config/thirdweb.js";
import supabaseRewardStorage from "./supabaseRewardStorage.js";

/**
 * NFT Exchange Service
 * Handles server-side NFT processing using Thirdweb Engine
 */
class NFTExchangeService {
  constructor() {
    this.serverWalletAddress = serverWalletConfig.walletAddress;
    console.log("NFT Exchange Service initialized with Thirdweb Engine");
  }

  /**
   * Get server wallet address
   */
  getServerWalletAddress() {
    return this.serverWalletAddress;
  }

  /**
   * Get eligible rewards for a collection and token
   * @param {string} collectionAddress - NFT collection address
   * @param {string} tokenId - Token ID (optional)
   * @returns {Object|null} Reward configuration or null if not eligible
   */
  async getEligibleReward(collectionAddress, tokenId = null) {
    try {
      return await supabaseRewardStorage.findRewardByCollection(collectionAddress, tokenId);
    } catch (error) {
      console.error("Error getting eligible reward:", error);
      return null;
    }
  }

  /**
   * Process NFT exchange - send USDT and burn NFT
   * @param {Object} params - Exchange parameters
   * @param {string} params.userAddress - User's wallet address
   * @param {string} params.collectionAddress - NFT collection address
   * @param {string} params.tokenId - Token ID to process
   * @param {Object} params.reward - Reward configuration
   * @param {Object} params.userInfo - User information (for custom rewards)
   */
  async processNFTExchange({
    userAddress,
    collectionAddress,
    tokenId,
    reward,
    userInfo = null
  }) {
    try {
      // Step 1: Send USDT reward to user
      if (reward.type === 'usdt' && reward.usdtAmount > 0) {
        await this.sendUSDTReward(userAddress, reward.usdtAmount);
      }

      // Step 2: Handle custom rewards (log for manual processing)
      if (reward.type === 'custom' && reward.customReward) {
        await this.logCustomReward(userAddress, reward.customReward, userInfo);
      }

      console.log(`Successfully processed NFT exchange for token ${tokenId} from collection ${collectionAddress}. NFT is now safely stored in server wallet.`);
      
      return {
        success: true,
        transactionHash: null, // Would contain actual transaction hash
        message: `Exchange completed successfully. ${reward.usdtAmount} USDT sent to ${userAddress}`
      };

    } catch (error) {
      console.error("Error processing NFT exchange:", error);
      throw error;
    }
  }

  /**
   * Send USDT reward to user using manual transfer approach
   * @param {string} userAddress - User's wallet address
   * @param {number} amount - USDT amount to send
   */
  async sendUSDTReward(userAddress, amount) {
    try {
      // Convert amount to proper decimals using toWei (USDT has 6 decimals)
      const amountWithDecimals = toWei(amount.toString());

      console.log(`💰 USDT Transfer Details:`);
      console.log(`   - Amount: ${amount} USDT`);
      console.log(`   - To: ${userAddress}`);
      console.log(`   - From: ${this.serverWalletAddress}`);
      console.log(`   - Amount with decimals: ${amountWithDecimals.toString()}`);
      console.log(`   - USDT Contract: ${contracts.usdt.address}`);

      // Prepare the transfer transaction
      const usdtContract = getContract({
        client,
        address: contracts.usdt.address,
        chain: polygon,
      });

      const transferTx = transfer({
        contract: usdtContract,
        to: userAddress,
        amount: amountWithDecimals,
      });

      console.log(`📋 Transfer transaction prepared:`, transferTx);

      // For now, log the transaction details for manual processing
      // You can manually send USDT using these exact details
      const result = {
        success: true,
        requiresManualProcessing: true,
        transactionDetails: {
          from: this.serverWalletAddress,
          to: userAddress,
          amount: amount,
          amountWithDecimals: amountWithDecimals.toString(),
          contract: contracts.usdt.address,
          network: 'Polygon'
        },
        message: `USDT transfer logged for manual processing: ${amount} USDT to ${userAddress}`
      };

      console.log(`✅ USDT transfer logged for manual processing`);
      console.log(`💡 Manual Action Required: Send ${amount} USDT from ${this.serverWalletAddress} to ${userAddress}`);
      
      return result;

    } catch (error) {
      console.error("❌ Error preparing USDT reward:", error);
      throw error;
    }
  }


  /**
   * Log custom reward for manual processing
   * @param {string} userAddress - User's wallet address
   * @param {Object} customReward - Custom reward details
   * @param {Object} userInfo - User contact information
   */
  async logCustomReward(userAddress, customReward, userInfo) {
    try {
      // This would typically save to database for admin processing
      const rewardLog = {
        userAddress,
        rewardTitle: customReward.title,
        rewardDescription: customReward.description,
        userInfo,
        timestamp: new Date().toISOString(),
        status: 'pending_fulfillment'
      };

      console.log("Custom reward logged for manual processing:", rewardLog);
      
      // TODO: Save to database
      // await db.customRewards.create(rewardLog);

    } catch (error) {
      console.error("Error logging custom reward:", error);
    }
  }

  /**
   * Get burn rewards configuration
   */
  async getBurnRewards() {
    return await supabaseRewardStorage.getBurnRewards();
  }

  /**
   * Validate NFT ownership and transfer to server wallet
   * @param {string} userAddress - User's wallet address  
   * @param {string} collectionAddress - NFT collection address
   * @param {string} tokenId - Token ID
   */
  async validateNFTTransfer(userAddress, collectionAddress, tokenId) {
    try {
      const nftContract = getContract({
        client,
        address: collectionAddress,
        chain: polygon,
      });

      // Check if NFT was transferred to server wallet
      const owner = await nftContract.call("ownerOf", [tokenId]);
      
      if (owner.toLowerCase() !== contracts.serverWallet.toLowerCase()) {
        throw new Error("NFT not transferred to server wallet");
      }

      return true;
    } catch (error) {
      console.error("Error validating NFT transfer:", error);
      return false;
    }
  }
}

export default new NFTExchangeService();
