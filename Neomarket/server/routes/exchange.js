import express from 'express';
import nftExchangeService from '../services/nftExchangeService.js';

const router = express.Router();

/**
 * GET /api/exchange/rewards
 * Get available burn rewards configuration
 */
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await nftExchangeService.getBurnRewards();
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/exchange/check-eligibility
 * Check if an NFT is eligible for rewards
 */
router.post('/check-eligibility', async (req, res) => {
  try {
    const { collectionAddress, tokenId } = req.body;

    if (!collectionAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Collection address is required' 
      });
    }

    const reward = await nftExchangeService.getEligibleReward(collectionAddress, tokenId);
    
    res.json({
      success: true,
      eligible: !!reward,
      reward: reward || null
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/exchange/initiate
 * Initiate NFT exchange process
 * User must transfer NFT to server wallet first
 */
router.post('/initiate', async (req, res) => {
  try {
    const {
      userAddress,
      collectionAddress,
      tokenId,
      userInfo = null
    } = req.body;

    // Validate required fields
    if (!userAddress || !collectionAddress || !tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress, collectionAddress, tokenId'
      });
    }

    // Check if NFT is eligible for rewards
    const reward = await nftExchangeService.getEligibleReward(collectionAddress, tokenId);
    if (!reward) {
      return res.status(400).json({
        success: false,
        error: 'NFT not eligible for rewards'
      });
    }

    // Validate NFT has been transferred to server wallet
    const isTransferred = await nftExchangeService.validateNFTTransfer(
      userAddress, 
      collectionAddress, 
      tokenId
    );

    if (!isTransferred) {
      return res.status(400).json({
        success: false,
        error: 'NFT must be transferred to server wallet first',
        serverWalletAddress: process.env.SERVER_WALLET_ADDRESS
      });
    }

    // Process the exchange
    const result = await nftExchangeService.processNFTExchange({
      userAddress,
      collectionAddress,
      tokenId,
      reward,
      userInfo
    });

    res.json(result);

  } catch (error) {
    console.error('Error initiating exchange:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/exchange/webhook
 * Thirdweb Insight webhook endpoint for automatic NFT transfer detection
 * Called automatically when NFT Transfer events occur
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook received:', req.body);

    const { 
      eventName,
      contractAddress, 
      tokenId, 
      from, 
      to,
      transactionHash,
      blockNumber,
      logIndex
    } = req.body;

    // Verify this is a Transfer event to our server wallet
    if (eventName !== 'Transfer' || to?.toLowerCase() !== process.env.SERVER_WALLET_ADDRESS?.toLowerCase()) {
      console.log(`📋 Event ignored: ${eventName} to ${to} (expected Transfer to ${process.env.SERVER_WALLET_ADDRESS})`);
      return res.json({ success: true, message: 'Event ignored - not a transfer to server wallet' });
    }

    console.log(`🎯 NFT Transfer detected: Token ${tokenId} from ${from} to server wallet`);
    console.log(`📋 Transaction: ${transactionHash} (Block: ${blockNumber})`);

    // Check if this NFT is eligible for rewards
    const reward = await nftExchangeService.getEligibleReward(contractAddress, tokenId);
    
    if (!reward) {
      console.log(`❌ Token ${tokenId} from collection ${contractAddress} is not eligible for rewards`);
      return res.json({ success: true, message: 'NFT not eligible for rewards' });
    }

    console.log(`✅ Reward found for token ${tokenId}:`, {
      type: reward.type,
      usdtAmount: reward.usdtAmount,
      customReward: reward.customReward?.title
    });

    // Auto-process the reward
    try {
      const exchangeResult = await nftExchangeService.processNFTExchange({
        userAddress: from,
        collectionAddress: contractAddress,
        tokenId,
        reward,
        userInfo: null // Webhook doesn't have user info
      });

      console.log(`🎉 Successfully processed webhook exchange for token ${tokenId}`);
      console.log(`💰 Result:`, exchangeResult.message);

      res.json({ 
        success: true, 
        processed: true,
        reward: reward.type === 'usdt' ? `${reward.usdtAmount} USDT` : reward.customReward?.title,
        transactionHash: exchangeResult.transactionHash
      });

    } catch (processError) {
      console.error(`❌ Error processing exchange for token ${tokenId}:`, processError);
      res.status(500).json({ 
        success: false, 
        error: `Failed to process reward: ${processError.message}` 
      });
    }

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/exchange/server-wallet
 * Get server wallet address for frontend
 */
router.get('/server-wallet', (req, res) => {
  res.json({
    success: true,
    serverWalletAddress: process.env.SERVER_WALLET_ADDRESS
  });
});

export default router;
