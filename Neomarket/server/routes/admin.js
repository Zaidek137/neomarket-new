import express from 'express';
import { timingSafeEqual } from 'crypto';
import supabaseRewardStorage from '../services/supabaseRewardStorage.js';
import exchangeLogStorage from '../services/exchangeLogStorage.js';

const router = express.Router();

function safeCompare(value, expected) {
  const valueBuffer = Buffer.from(String(value));
  const expectedBuffer = Buffer.from(String(expected));

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function requireAdminAuth(req, res, next) {
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (!adminApiKey) {
    return res.status(503).json({
      success: false,
      error: 'Admin API authentication is not configured'
    });
  }

  const authHeader = req.get('authorization') || '';
  const bearerToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  const providedKey = req.get('x-admin-api-key') || bearerToken;

  if (!providedKey || !safeCompare(providedKey, adminApiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  next();
}

router.use(requireAdminAuth);

/**
 * GET /api/admin/rewards
 * Get all configured burn rewards
 */
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await supabaseRewardStorage.getBurnRewards();
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Error fetching admin rewards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/rewards
 * Add a new burn reward configuration
 */
router.post('/rewards', async (req, res) => {
  try {
    const {
      collectionAddress,
      tokenId,
      usdtAmount,
      type,
      customReward
    } = req.body;

    // Validate required fields
    if (!collectionAddress || !usdtAmount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: collectionAddress, usdtAmount, type'
      });
    }

    // Validate collection address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(collectionAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid collection address format'
      });
    }

    // Validate USDT amount
    if (isNaN(usdtAmount) || usdtAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'USDT amount must be a positive number'
      });
    }

    const newReward = {
      id: Date.now().toString(), // Simple ID generation
      collectionAddress: collectionAddress.toLowerCase(),
      tokenId: tokenId || undefined,
      usdtAmount: parseFloat(usdtAmount),
      type,
      customReward,
      createdAt: new Date().toISOString()
    };

    // Check for duplicates
    const duplicate = await supabaseRewardStorage.findDuplicate(newReward.collectionAddress, newReward.tokenId);

    if (duplicate) {
      return res.status(400).json({
        success: false,
        error: 'A reward for this collection and token already exists'
      });
    }

    await supabaseRewardStorage.addBurnReward(newReward);

    console.log('New reward added:', newReward);

    res.json({ success: true, reward: newReward });

  } catch (error) {
    console.error('Error adding reward:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/rewards/:id
 * Remove a burn reward configuration
 */
router.delete('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const removed = await supabaseRewardStorage.removeReward(id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found'
      });
    }

    console.log(`Reward ${id} removed`);

    res.json({ success: true, message: 'Reward removed successfully' });

  } catch (error) {
    console.error('Error removing reward:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/rewards/:id
 * Update a burn reward configuration
 */
router.put('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      collectionAddress,
      tokenId,
      usdtAmount,
      type,
      customReward
    } = req.body;

    const existingReward = await supabaseRewardStorage.findRewardById(id);

    if (!existingReward) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found'
      });
    }

    // Validate fields if provided
    if (collectionAddress && !/^0x[a-fA-F0-9]{40}$/.test(collectionAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid collection address format'
      });
    }

    if (usdtAmount && (isNaN(usdtAmount) || usdtAmount <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'USDT amount must be a positive number'
      });
    }

    // Update the reward
    const updates = {
      ...(collectionAddress && { collectionAddress: collectionAddress.toLowerCase() }),
      ...(tokenId !== undefined && { tokenId }),
      ...(usdtAmount && { usdtAmount: parseFloat(usdtAmount) }),
      ...(type && { type }),
      ...(customReward !== undefined && { customReward }),
      updatedAt: new Date().toISOString()
    };

    const updatedReward = await supabaseRewardStorage.updateReward(id, updates);

    console.log('Reward updated:', updatedReward);

    res.json({ success: true, reward: updatedReward });

  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/stats
 * Get exchange statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await supabaseRewardStorage.getStats();

    res.json({ success: true, stats });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/pending-exchanges
 * Get pending exchanges for manual USDT processing
 */
router.get('/pending-exchanges', async (req, res) => {
  try {
    const pendingExchanges = await exchangeLogStorage.getPendingExchanges();

    res.json({ success: true, exchanges: pendingExchanges });

  } catch (error) {
    console.error('Error fetching pending exchanges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/mark-processed
 * Mark an exchange as processed
 */
router.post('/mark-processed', async (req, res) => {
  try {
    const { exchangeId, adminWallet, usdtTransactionHash } = req.body;

    if (!exchangeId || !adminWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: exchangeId, adminWallet'
      });
    }

    const result = await exchangeLogStorage.markAsProcessed(exchangeId, adminWallet, usdtTransactionHash);

    res.json({ success: true, exchange: result });

  } catch (error) {
    console.error('Error marking exchange as processed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
