import React, { useState } from 'react';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import { cn, RarityCalculator } from '../../lib/utils';
import type { NFTRarity } from '../../types/marketplace';

interface RarityFilterProps {
  selectedTiers: NFTRarity['rarity_tier'][];
  onTiersChange: (tiers: NFTRarity['rarity_tier'][]) => void;
  tierCounts?: { [tier: string]: number };
}

const rarityTiers: NFTRarity['rarity_tier'][] = [
  'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'
];

export default function RarityFilter({ selectedTiers, onTiersChange, tierCounts }: RarityFilterProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleTier = (tier: NFTRarity['rarity_tier']) => {
    const newTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter(t => t !== tier)
      : [...selectedTiers, tier];
    onTiersChange(newTiers);
  };

  const selectAllTiers = () => {
    onTiersChange([...rarityTiers]);
  };

  const clearAllTiers = () => {
    onTiersChange([]);
  };

  return (
    <div className="border-b border-slate-700/50 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3 hover:text-cyan-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">Rarity</span>
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      {isOpen && (
        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={selectAllTiers}
              className="text-xs px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors"
            >
              All
            </button>
            <button
              onClick={clearAllTiers}
              className="text-xs px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Rarity Tiers */}
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {rarityTiers.map((tier) => {
              const count = tierCounts?.[tier] || 0;
              const isSelected = selectedTiers.includes(tier);
              
              return (
                <label key={tier} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTier(tier)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                    isSelected
                      ? "border-cyan-500 bg-cyan-500"
                      : "border-slate-500 group-hover:border-slate-400"
                  )}>
                    {isSelected && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-gradient-to-r",
                      RarityCalculator.getRarityTierColor(tier)
                    )}></div>
                    <span className={cn(
                      "text-sm transition-colors flex-1",
                      isSelected ? "text-white font-medium" : "text-slate-300 group-hover:text-white"
                    )}>
                      {tier}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                        {count}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
