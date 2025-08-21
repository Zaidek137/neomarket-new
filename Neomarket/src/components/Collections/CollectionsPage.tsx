import { useState, useMemo } from 'react';
import { Search, Grid3X3, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import FilterSidebar from './FilterSidebar';
import CollectionGrid from './CollectionGrid';
import CollectionHeader from './CollectionHeader';

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage?: string;
  floorPrice: number;
  items: number;
  owners: number;
  listed: number;
  verified: boolean;
  creator: string;
  chain: 'ethereum' | 'polygon' | 'solana';
  category: string[];
  createdAt: string;
}

const mainCollection: Collection = {
  id: 'scavenjers',
  name: 'The Scavenjers',
  description: 'An intro collection of unique digital avatars for the Scavenjer ecosystem.',
  image: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png',
  bannerImage: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/zaidek._An_anime-style_illustration_of_a_young_male_character_9b6aef66-a91e-4249-b125-692f0859d6ea_2.png',
  floorPrice: 29.99,
  items: 9000,
  owners: 10,
  listed: 0,
  verified: true,
  creator: 'NeoMarket',
  chain: 'polygon',
  category: ['Gaming', 'Adventure'],
  createdAt: '2023-06-15'
};

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('floor');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    verified: 'all', // 'all', 'verified', 'unverified'
    categories: [] as string[],
    priceRange: { min: '', max: '' },
    itemRange: { min: '', max: '' }
  });

  const filteredCollections = useMemo(() => {
    const collections = [mainCollection];
    let filtered = collections.filter(collection => {
      // Search filter
      if (searchQuery && !collection.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !collection.creator.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Verified filter
      if (filters.verified === 'verified' && !collection.verified) {
        return false;
      }
      if (filters.verified === 'unverified' && collection.verified) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && 
          !collection.category.some(cat => filters.categories.includes(cat))) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min && collection.floorPrice < parseFloat(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && collection.floorPrice > parseFloat(filters.priceRange.max)) {
        return false;
      }

      // Item range filter
      if (filters.itemRange.min && collection.items < parseFloat(filters.itemRange.min)) {
        return false;
      }
      if (filters.itemRange.max && collection.items > parseFloat(filters.itemRange.max)) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'floor':
          return b.floorPrice - a.floorPrice;
        case 'items':
          return b.items - a.items;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <CollectionHeader />
      
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Left Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 w-full bg-slate-800/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 border backdrop-blur-sm text-sm sm:text-base",
                  showFilters 
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-slate-800/50 text-slate-400 border-slate-600/50 hover:text-white hover:border-slate-500/50"
                )}
              >
                <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Filters</span>
              </button>

              {/* Results Count */}
              <div className="text-xs sm:text-sm text-slate-400">
                <span className="font-medium text-white">{filteredCollections.length}</span> collections
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-800/50 border border-slate-600/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
              >
                <option value="floor">Price</option>
                <option value="items">Items</option>
                <option value="created">Recent</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown size={14} className="sm:w-4 sm:h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-600/50 p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Grid3X3 size={14} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <List size={14} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Filter Sidebar - Full width on mobile, sidebar on desktop */}
          {showFilters && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <FilterSidebar 
                filters={filters} 
                onFiltersChange={setFilters}
                collections={[mainCollection]}
              />
            </div>
          )}

          {/* Collections Grid */}
          <div className="flex-1">
            <CollectionGrid 
              collections={filteredCollections}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
