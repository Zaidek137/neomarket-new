import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, Award, BarChart3, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, RarityCalculator } from '../lib/utils';
import type { NFTRarity, TraitRarity } from '../types/marketplace';
import { rarityService } from '../services/rarityService';

interface RarityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    tokenId: string;
    name: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  collectionNFTs: any[]; // All NFTs in the collection for rarity calculation
}

export default function RarityCheckerModal({ 
  isOpen, 
  onClose, 
  nft, 
  collectionNFTs 
}: RarityCheckerModalProps) {
  const [rarityData, setRarityData] = useState<NFTRarity | null>(null);
  const [loading, setLoading] = useState(false);
  const [collectionStats, setCollectionStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen && nft && collectionNFTs.length > 0) {
      calculateRarity();
    }
  }, [isOpen, nft, collectionNFTs]);

  const calculateRarity = async () => {
    setLoading(true);
    try {
      const collectionId = 'scavenjers'; // You can make this dynamic
      const rarityCollection = await rarityService.getCollectionRarity(collectionId, collectionNFTs);
      const nftRarity = rarityService.getNFTRarity(collectionId, nft.tokenId);
      const stats = rarityService.getCollectionStats(collectionId);
      
      setRarityData(nftRarity);
      setCollectionStats(stats);
    } catch (error) {
      console.error('Error calculating rarity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (percentage: number) => {
    return percentage < 0.01 ? '<0.01%' : `${percentage.toFixed(2)}%`;
  };

  const formatRarityScore = (score: number) => {
    return score.toFixed(2);
  };

  const getPercentileText = (rank: number, totalSupply: number) => {
    const percentile = ((totalSupply - rank + 1) / totalSupply) * 100;
    return `Top ${percentile.toFixed(1)}%`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="text-purple-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Rarity Analysis</h2>
                  <p className="text-sm text-slate-400">{nft.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-slate-400">Calculating rarity...</span>
                </div>
              ) : rarityData ? (
                <div className="space-y-6">
                  {/* NFT Overview */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* NFT Image */}
                    <div className="lg:w-80 flex-shrink-0">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Rarity Stats */}
                    <div className="flex-1 space-y-4">
                      {/* Overall Rarity */}
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                          <Trophy className="text-yellow-400" size={24} />
                          <h3 className="text-lg font-semibold text-white">Overall Rarity</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              #{rarityData.overall_rarity_rank}
                            </div>
                            <div className="text-sm text-slate-400">Rank</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {formatRarityScore(rarityData.overall_rarity_score)}
                            </div>
                            <div className="text-sm text-slate-400">Score</div>
                          </div>
                          <div className="text-center">
                            <div className={cn(
                              "text-2xl font-bold",
                              RarityCalculator.getRarityTierTextColor(rarityData.rarity_tier)
                            )}>
                              {rarityData.rarity_tier}
                            </div>
                            <div className="text-sm text-slate-400">Tier</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {collectionStats && getPercentileText(rarityData.overall_rarity_rank, collectionStats.totalSupply)}
                            </div>
                            <div className="text-sm text-slate-400">Percentile</div>
                          </div>
                        </div>

                        {/* Rarity Tier Badge */}
                        <div className="mt-4 flex justify-center">
                          <div className={cn(
                            "px-4 py-2 rounded-full bg-gradient-to-r text-white font-semibold text-sm",
                            RarityCalculator.getRarityTierColor(rarityData.rarity_tier)
                          )}>
                            {rarityData.rarity_tier} Tier
                          </div>
                        </div>
                      </div>

                      {/* Collection Stats */}
                      {collectionStats && (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                          <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="text-cyan-400" size={24} />
                            <h3 className="text-lg font-semibold text-white">Collection Stats</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">
                                {collectionStats.totalSupply.toLocaleString()}
                              </div>
                              <div className="text-sm text-slate-400">Total Supply</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">
                                {collectionStats.totalTraitTypes}
                              </div>
                              <div className="text-sm text-slate-400">Trait Types</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trait Breakdown */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="text-green-400" size={24} />
                      <h3 className="text-lg font-semibold text-white">Trait Rarity Breakdown</h3>
                    </div>

                    <div className="space-y-4">
                      {rarityData.trait_rarities.map((trait, index) => (
                        <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-300">
                                {trait.trait_type}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {trait.value}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">
                                {formatRarityScore(trait.rarity_score)}
                              </div>
                              <div className="text-xs text-slate-400">Score</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">
                              {trait.count} of {collectionStats?.totalSupply || 'N/A'} have this trait
                            </span>
                            <span className="font-medium text-cyan-300">
                              {formatPercentage(trait.percentage)}
                            </span>
                          </div>
                          
                          {/* Rarity Bar */}
                          <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100 - trait.percentage, 95)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rarity Explanation */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">How Rarity is Calculated</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>
                        • <strong>Trait Rarity Score:</strong> Each trait gets a score based on how rare it is (Total Supply ÷ Trait Count)
                      </p>
                      <p>
                        • <strong>Overall Score:</strong> Sum of all individual trait rarity scores
                      </p>
                      <p>
                        • <strong>Rank:</strong> Position when all NFTs are sorted by rarity score (1 = rarest)
                      </p>
                      <p>
                        • <strong>Tier:</strong> Mythic (Top 1%), Legendary (Top 5%), Epic (Top 15%), Rare (Top 35%), Uncommon (Top 65%), Common (Bottom 35%)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="text-slate-400 mx-auto mb-4" size={48} />
                  <p className="text-slate-400">Unable to calculate rarity data</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
