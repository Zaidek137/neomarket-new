import { RarityCalculator } from '../lib/utils';
import type { CollectionRarityData, NFTRarity } from '../types/marketplace';

class RarityService {
  private rarityCache: Map<string, CollectionRarityData> = new Map();
  private isCalculating: Map<string, Promise<CollectionRarityData>> = new Map();

  /**
   * Get or calculate rarity data for a collection
   */
  async getCollectionRarity(collectionId: string, nfts: any[]): Promise<CollectionRarityData> {
    // Check cache first
    if (this.rarityCache.has(collectionId)) {
      return this.rarityCache.get(collectionId)!;
    }

    // Check if already calculating
    if (this.isCalculating.has(collectionId)) {
      return this.isCalculating.get(collectionId)!;
    }

    // Start calculation
    const calculationPromise = this.calculateRarity(collectionId, nfts);
    this.isCalculating.set(collectionId, calculationPromise);

    try {
      const result = await calculationPromise;
      this.rarityCache.set(collectionId, result);
      return result;
    } finally {
      this.isCalculating.delete(collectionId);
    }
  }

  /**
   * Calculate rarity data for a collection
   */
  private async calculateRarity(collectionId: string, nfts: any[]): Promise<CollectionRarityData> {
    return new Promise((resolve) => {
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        const rarityData = RarityCalculator.calculateCollectionRarity(nfts);
        resolve(rarityData);
      }, 0);
    });
  }

  /**
   * Get rarity data for a specific NFT
   */
  getNFTRarity(collectionId: string, tokenId: string): NFTRarity | null {
    const collectionRarity = this.rarityCache.get(collectionId);
    if (!collectionRarity) return null;
    
    return collectionRarity.nft_rarities[tokenId] || null;
  }

  /**
   * Get NFTs sorted by rarity
   */
  getNFTsSortedByRarity(collectionId: string, ascending: boolean = false): NFTRarity[] {
    const collectionRarity = this.rarityCache.get(collectionId);
    if (!collectionRarity) return [];
    
    const nfts = Object.values(collectionRarity.nft_rarities);
    return nfts.sort((a, b) => 
      ascending 
        ? a.overall_rarity_rank - b.overall_rarity_rank
        : b.overall_rarity_rank - a.overall_rarity_rank
    );
  }

  /**
   * Filter NFTs by rarity tier
   */
  filterNFTsByRarity(collectionId: string, tiers: NFTRarity['rarity_tier'][]): NFTRarity[] {
    const collectionRarity = this.rarityCache.get(collectionId);
    if (!collectionRarity) return [];
    
    return Object.values(collectionRarity.nft_rarities)
      .filter(nft => tiers.includes(nft.rarity_tier));
  }

  /**
   * Clear cache for a collection
   */
  clearCache(collectionId?: string) {
    if (collectionId) {
      this.rarityCache.delete(collectionId);
      this.isCalculating.delete(collectionId);
    } else {
      this.rarityCache.clear();
      this.isCalculating.clear();
    }
  }

  /**
   * Get collection statistics
   */
  getCollectionStats(collectionId: string) {
    const collectionRarity = this.rarityCache.get(collectionId);
    if (!collectionRarity) return null;

    const nfts = Object.values(collectionRarity.nft_rarities);
    const avgRarityScore = nfts.reduce((sum, nft) => sum + nft.overall_rarity_score, 0) / nfts.length;
    
    return {
      totalSupply: collectionRarity.total_supply,
      averageRarityScore: avgRarityScore,
      tierDistribution: collectionRarity.rarity_tiers,
      totalTraitTypes: Object.keys(collectionRarity.trait_counts).length
    };
  }

  /**
   * Get tier counts for current collection
   */
  getTierCounts(collectionId: string): { [tier: string]: number } {
    const collectionRarity = this.rarityCache.get(collectionId);
    if (!collectionRarity) return {};

    const tierCounts: { [tier: string]: number } = {};
    Object.values(collectionRarity.nft_rarities).forEach(nft => {
      tierCounts[nft.rarity_tier] = (tierCounts[nft.rarity_tier] || 0) + 1;
    });

    return tierCounts;
  }
}

export const rarityService = new RarityService();
