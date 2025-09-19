/**
 * Shared reward storage service
 * Provides a centralized way to manage burn rewards
 * TODO: Replace with database storage in production
 */

class RewardStorage {
  constructor() {
    this.burnRewards = [];
  }

  /**
   * Get all burn rewards
   */
  getBurnRewards() {
    return this.burnRewards;
  }

  /**
   * Add a new burn reward
   */
  addBurnReward(reward) {
    this.burnRewards.push(reward);
    return reward;
  }

  /**
   * Find reward by ID
   */
  findRewardById(id) {
    return this.burnRewards.find(reward => reward.id === id);
  }

  /**
   * Update reward by ID
   */
  updateReward(id, updates) {
    const index = this.burnRewards.findIndex(reward => reward.id === id);
    if (index !== -1) {
      this.burnRewards[index] = { ...this.burnRewards[index], ...updates };
      return this.burnRewards[index];
    }
    return null;
  }

  /**
   * Remove reward by ID
   */
  removeReward(id) {
    const initialLength = this.burnRewards.length;
    this.burnRewards = this.burnRewards.filter(reward => reward.id !== id);
    return this.burnRewards.length < initialLength;
  }

  /**
   * Find reward by collection and token
   */
  findRewardByCollection(collectionAddress, tokenId = null) {
    // Find specific token reward first
    const specificReward = this.burnRewards.find(reward => 
      reward.collectionAddress.toLowerCase() === collectionAddress.toLowerCase() && 
      reward.tokenId === tokenId
    );
    
    // Fall back to collection-wide reward (tokenId is null or undefined)
    const generalReward = this.burnRewards.find(reward => 
      reward.collectionAddress.toLowerCase() === collectionAddress.toLowerCase() && 
      (reward.tokenId === null || reward.tokenId === undefined)
    );
    
    return specificReward || generalReward || null;
  }

  /**
   * Check for duplicate rewards
   */
  findDuplicate(collectionAddress, tokenId) {
    return this.burnRewards.find(reward => 
      reward.collectionAddress === collectionAddress &&
      reward.tokenId === tokenId
    );
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalRewards: this.burnRewards.length,
      usdtRewards: this.burnRewards.filter(r => r.type === 'usdt').length,
      customRewards: this.burnRewards.filter(r => r.type === 'custom').length,
      collections: [...new Set(this.burnRewards.map(r => r.collectionAddress))].length,
      totalUsdtValue: this.burnRewards
        .filter(r => r.type === 'usdt')
        .reduce((sum, r) => sum + r.usdtAmount, 0)
    };
  }
}

// Export singleton instance
export default new RewardStorage();
