import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NFTRarity, CollectionRarityData, TraitRarity } from '../types/marketplace';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Rarity calculation utilities
export class RarityCalculator {
  /**
   * Calculate rarity scores for an entire collection
   */
  static calculateCollectionRarity(nfts: any[]): CollectionRarityData {
    const totalSupply = nfts.length;
    const traitCounts: { [trait_type: string]: { [value: string]: number } } = {};
    
    // First pass: count all trait occurrences
    nfts.forEach(nft => {
      if (nft.attributes && Array.isArray(nft.attributes)) {
        nft.attributes.forEach((trait: any) => {
          const traitType = trait.trait_type?.trim();
          const value = trait.value?.toString().trim();
          
          if (!traitType || value === undefined || value === null) return;
          
          if (!traitCounts[traitType]) {
            traitCounts[traitType] = {};
          }
          
          const displayValue = value === '' || value.toLowerCase() === 'blank' ? 'None' : value;
          traitCounts[traitType][displayValue] = (traitCounts[traitType][displayValue] || 0) + 1;
        });
      }
    });

    // Second pass: calculate individual NFT rarity scores
    const nftRarities: { [tokenId: string]: NFTRarity } = {};
    
    nfts.forEach(nft => {
      const tokenId = nft.id || nft.tokenId || nft.name;
      const traitRarities: TraitRarity[] = [];
      let overallScore = 0;
      
      if (nft.attributes && Array.isArray(nft.attributes)) {
        nft.attributes.forEach((trait: any) => {
          const traitType = trait.trait_type?.trim();
          const value = trait.value?.toString().trim();
          
          if (!traitType || value === undefined || value === null) return;
          
          const displayValue = value === '' || value.toLowerCase() === 'blank' ? 'None' : value;
          const count = traitCounts[traitType][displayValue] || 0;
          const percentage = (count / totalSupply) * 100;
          
          // Rarity score calculation: 1 / (trait_count / total_supply)
          // More rare traits get higher scores
          const rarityScore = totalSupply / count;
          
          traitRarities.push({
            trait_type: traitType,
            value: displayValue,
            count,
            percentage,
            rarity_score: rarityScore
          });
          
          overallScore += rarityScore;
        });
      }
      
      nftRarities[tokenId] = {
        tokenId,
        name: nft.name || `#${tokenId}`,
        overall_rarity_score: overallScore,
        overall_rarity_rank: 0, // Will be calculated after sorting
        rarity_tier: 'Common', // Will be calculated after ranking
        trait_rarities: traitRarities,
        total_traits: traitRarities.length
      };
    });

    // Third pass: calculate ranks and tiers
    const sortedNFTs = Object.values(nftRarities).sort((a, b) => b.overall_rarity_score - a.overall_rarity_score);
    
    sortedNFTs.forEach((nft, index) => {
      nft.overall_rarity_rank = index + 1;
      nft.rarity_tier = this.calculateRarityTier(index + 1, totalSupply);
    });

    // Calculate tier distribution
    const rarityTiers = this.calculateTierDistribution(totalSupply);

    return {
      total_supply: totalSupply,
      trait_counts: traitCounts,
      nft_rarities: nftRarities,
      rarity_tiers: rarityTiers
    };
  }

  /**
   * Calculate rarity tier based on rank percentile
   */
  private static calculateRarityTier(rank: number, totalSupply: number): NFTRarity['rarity_tier'] {
    const percentile = (rank / totalSupply) * 100;
    
    if (percentile <= 1) return 'Mythic';      // Top 1%
    if (percentile <= 5) return 'Legendary';   // Top 5%
    if (percentile <= 15) return 'Epic';       // Top 15%
    if (percentile <= 35) return 'Rare';       // Top 35%
    if (percentile <= 65) return 'Uncommon';   // Top 65%
    return 'Common';                           // Bottom 35%
  }

  /**
   * Calculate tier distribution for the collection
   */
  private static calculateTierDistribution(totalSupply: number) {
    return {
      'Mythic': {
        min_percentile: 0,
        max_percentile: 1,
        count: Math.ceil(totalSupply * 0.01)
      },
      'Legendary': {
        min_percentile: 1,
        max_percentile: 5,
        count: Math.ceil(totalSupply * 0.04)
      },
      'Epic': {
        min_percentile: 5,
        max_percentile: 15,
        count: Math.ceil(totalSupply * 0.10)
      },
      'Rare': {
        min_percentile: 15,
        max_percentile: 35,
        count: Math.ceil(totalSupply * 0.20)
      },
      'Uncommon': {
        min_percentile: 35,
        max_percentile: 65,
        count: Math.ceil(totalSupply * 0.30)
      },
      'Common': {
        min_percentile: 65,
        max_percentile: 100,
        count: Math.ceil(totalSupply * 0.35)
      }
    };
  }

  /**
   * Get rarity tier color for UI display
   */
  static getRarityTierColor(tier: NFTRarity['rarity_tier']): string {
    const colors = {
      'Mythic': 'from-purple-500 to-pink-500',
      'Legendary': 'from-yellow-400 to-orange-500',
      'Epic': 'from-purple-400 to-blue-500',
      'Rare': 'from-blue-400 to-cyan-500',
      'Uncommon': 'from-green-400 to-emerald-500',
      'Common': 'from-gray-400 to-slate-500'
    };
    return colors[tier] || colors['Common'];
  }

  /**
   * Get rarity tier text color for UI display
   */
  static getRarityTierTextColor(tier: NFTRarity['rarity_tier']): string {
    const colors = {
      'Mythic': 'text-purple-300',
      'Legendary': 'text-yellow-300',
      'Epic': 'text-purple-300',
      'Rare': 'text-blue-300',
      'Uncommon': 'text-green-300',
      'Common': 'text-gray-300'
    };
    return colors[tier] || colors['Common'];
  }
}