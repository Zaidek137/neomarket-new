import React, { useState } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Collection } from './CollectionsPage';
import type { NFTRarity } from '../../types/marketplace';
import RarityFilter from './RarityFilter';

interface FilterSidebarProps {
  filters: {
    verified: string;
    categories: string[];
    priceRange: { min: string; max: string };
    itemRange: { min: string; max: string };
    rarityTiers?: NFTRarity['rarity_tier'][];
  };
  onFiltersChange: (filters: any) => void;
  collections: Collection[];
  tierCounts?: { [tier: string]: number };
}

const categories = [
  'Gaming', 'Art', 'Fantasy', 'Sci-Fi', 'Cyberpunk', 'Retro', 'Adventure', 'Abstract', 'Photography', 'Music'
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700/50 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3 hover:text-cyan-300 transition-colors"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <ChevronDown 
          size={16} 
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      {isOpen && children}
    </div>
  );
}

export default function FilterSidebar({ filters, onFiltersChange, collections, tierCounts }: FilterSidebarProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(cat => cat !== category)
      : [...filters.categories, category];
    updateFilter('categories', newCategories);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      verified: 'all',
      categories: [],
      priceRange: { min: '', max: '' },
      itemRange: { min: '', max: '' },
      rarityTiers: []
    });
  };

  const activeFilterCount = (
    (filters.verified !== 'all' ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
    (filters.itemRange.min || filters.itemRange.max ? 1 : 0) +
    ((filters.rarityTiers && filters.rarityTiers.length > 0) ? 1 : 0)
  );

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Rarity Filter */}
      <RarityFilter
        selectedTiers={filters.rarityTiers || []}
        onTiersChange={(tiers) => updateFilter('rarityTiers', tiers)}
        tierCounts={tierCounts}
      />

      {/* Status */}
      <FilterSection title="Status">
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'verified', label: 'Verified only' },
            { id: 'unverified', label: 'Unverified only' }
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="verified"
                value={option.id}
                checked={filters.verified === option.id}
                onChange={(e) => updateFilter('verified', e.target.value)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                filters.verified === option.id
                  ? "border-cyan-500 bg-cyan-500"
                  : "border-slate-500 group-hover:border-slate-400"
              )}>
                {filters.verified === option.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                filters.categories.includes(category)
                  ? "border-cyan-500 bg-cyan-500"
                  : "border-slate-500 group-hover:border-slate-400"
              )}>
                {filters.categories.includes(category) && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Average price (USD)">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, min: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
            />
          </div>
        </div>
      </FilterSection>

      {/* Item Count Range */}
      <FilterSection title="Item Count">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.itemRange.min}
              onChange={(e) => updateFilter('itemRange', { ...filters.itemRange, min: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.itemRange.max}
              onChange={(e) => updateFilter('itemRange', { ...filters.itemRange, max: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );
}
