import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExchangePage from '../Exchange/ExchangePage';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronDown, 
  X, 
  Check, 
  Badge,
  Heart,
  ShoppingCart,
  Eye,
  Loader2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Image cache for better performance
const imageCache = new Map<string, string>();

// IPFS helper function with caching
function ipfsToHttp(url: string, gateway: 'ipfs.io' | 'cloudflare' = 'ipfs.io') {
  if (!url) return '';
  
  const cacheKey = `${url}-${gateway}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  let result = url;
  if (url.startsWith('ipfs://')) {
    const base = gateway === 'ipfs.io' ? 'https://ipfs.io/ipfs/' : 'https://cloudflare-ipfs.com/ipfs/';
    result = url.replace('ipfs://', base);
  }
  
  imageCache.set(cacheKey, result);
  return result;
}

interface NFTTrait {
  trait_type: string;
  value: string;
}

interface NFT {
  id: string;
  name: string;
  image: string;
  attributes: NFTTrait[];
  description?: string;
}

interface CollectionInfo {
  name: string;
  description: string;
  image: string;
  bannerImage?: string;
  totalSupply: number;
  floorPrice: number;
  totalVolume: number;
  owners: number;
  verified: boolean;
  creator: string;
}

const collectionInfo: CollectionInfo = {
  name: 'The Scavenjers',
  description: 'A collection of unique digital collectibles exploring the post-apocalyptic world of Eko.',
  image: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png',
  bannerImage: 'https://ik.imagekit.io/q9x52ygvo/banner-scavenjers.png',
  totalSupply: 9,
  floorPrice: 0.15,
  totalVolume: 2847,
  owners: 3,
  verified: true,
  creator: 'NeoMarket'
};

function TraitsFilter({ 
  collectionTraits, 
  selectedTraits, 
  onTraitsChange 
}: {
  collectionTraits: { [trait: string]: { [value: string]: number } };
  selectedTraits: { [trait: string]: Set<string> };
  onTraitsChange: (traits: { [trait: string]: Set<string> }) => void;
}) {
  const [openCategories, setOpenCategories] = useState<{ [trait: string]: boolean }>({});

  // Initialize all categories as open by default
  useEffect(() => {
    const initialState: { [trait: string]: boolean } = {};
    Object.keys(collectionTraits).forEach(trait => {
      initialState[trait] = false; // Start collapsed for better UX
    });
    setOpenCategories(initialState);
  }, [collectionTraits]);

  const toggleCategory = (trait: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [trait]: !prev[trait]
    }));
  };

  const toggleTrait = (trait: string, value: string) => {
    const newSelectedTraits = { ...selectedTraits };
    if (!newSelectedTraits[trait]) {
      newSelectedTraits[trait] = new Set();
    }
    
    if (newSelectedTraits[trait].has(value)) {
      newSelectedTraits[trait].delete(value);
      if (newSelectedTraits[trait].size === 0) {
        delete newSelectedTraits[trait];
      }
    } else {
      newSelectedTraits[trait].add(value);
    }
    
    onTraitsChange(newSelectedTraits);
  };

  const clearAllTraits = () => {
    onTraitsChange({});
  };

  const activeTraitCount = Object.values(selectedTraits).reduce((acc, set) => acc + set.size, 0);

  return (
    <div className="bg-slate-800/20 rounded-xl h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h3 className="text-white font-medium">Traits</h3>
        {activeTraitCount > 0 && (
          <button
            onClick={clearAllTraits}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X size={12} />
            Clear ({activeTraitCount})
          </button>
        )}
      </div>

      {/* Trait Categories - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
        {Object.entries(collectionTraits).map(([trait, values]) => (
          <div key={trait} className="pb-2">
            <button
              onClick={() => toggleCategory(trait)}
              className="flex items-center justify-between w-full text-left mb-2 hover:text-cyan-300 transition-colors"
            >
              <span className="text-sm font-medium text-white">{trait}</span>
              <ChevronDown 
                size={14} 
                className={cn(
                  "text-slate-400 transition-transform duration-200",
                  openCategories[trait] && "rotate-180"
                )} 
              />
            </button>
            
            <AnimatePresence>
              {openCategories[trait] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                    {Object.entries(values)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([value, count]) => (
                        <label key={value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedTraits[trait]?.has(value) || false}
                            onChange={() => toggleTrait(trait, value)}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                            selectedTraits[trait]?.has(value)
                              ? "border-cyan-500 bg-cyan-500"
                              : "border-slate-500 group-hover:border-slate-400"
                          )}>
                            {selectedTraits[trait]?.has(value) && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">
                            {value}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-700/50 rounded-full px-2 py-0.5">
                            {count}
                          </span>
                        </label>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced loading animation
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin`} />
        <div className="text-xs text-slate-400">Loading Eko...</div>
      </div>
    </div>
  );
};



const NFTCard = React.memo(function NFTCard({ nft, viewMode, onClick, priority = false }: { nft: NFT; viewMode: 'grid' | 'list'; onClick: () => void; priority?: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [gatewayTried, setGatewayTried] = useState<'ipfs.io' | 'cloudflare'>('ipfs.io');
  const [srcUrl, setSrcUrl] = useState<string>(ipfsToHttp(nft.image, 'ipfs.io'));
  const cardRef = useRef<HTMLDivElement>(null);

  // Images load immediately since virtual grid handles visibility
  const isVisible = true;

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        onClick={onClick}
        className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* NFT Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {!imageLoaded && !imageError && isVisible && (
              <LoadingSpinner size="sm" />
            )}
            {!imageLoaded && !imageError && !isVisible && (
              <div className="w-full h-full bg-slate-700/50" />
            )}
            {!imageError && isVisible && (
              <img
                src={srcUrl}
                alt={nft.name}
                className={cn(
                  "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? ('high' as any) : ('auto' as any)}
                width={256}
                height={256}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  if (gatewayTried === 'ipfs.io') {
                    setGatewayTried('cloudflare');
                    setSrcUrl(ipfsToHttp(nft.image, 'cloudflare'));
                  } else {
                    setImageError(true);
                  }
                }}
              />
            )}
            {imageError && (
              <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
                <span className="text-slate-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* NFT Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {nft.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">The Scavenjers</span>
              <Badge size={12} className="text-cyan-400" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Eye size={16} className="text-slate-400 hover:text-white" />
            </button>
            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Heart size={16} className="text-slate-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-700/30 hover:border-slate-600/50 hover:scale-105 transition-all duration-300"
      style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '256px' as any }}
    >
      {/* NFT Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && !imageError && isVisible && (
          <LoadingSpinner />
        )}
        {!imageLoaded && !imageError && !isVisible && (
          <div className="w-full h-full bg-slate-700/50" />
        )}
        {!imageError && isVisible && (
          <img
            src={srcUrl}
            alt={nft.name}
            className={cn(
              "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? ('high' as any) : ('auto' as any)}
            width={512}
            height={512}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (gatewayTried === 'ipfs.io') {
                setGatewayTried('cloudflare');
                setSrcUrl(ipfsToHttp(nft.image, 'cloudflare'));
              } else {
                setImageError(true);
              }
            }}
          />
        )}
        {imageError && (
          <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
            <span className="text-slate-400">No Image</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Eye size={16} className="text-white" />
            </button>
            <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Heart size={16} className="text-white" />
            </button>
            <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
              <ShoppingCart size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* NFT Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors mb-1">
          {nft.name}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">The Scavenjers</span>
            <Badge size={12} className="text-cyan-400" />
          </div>
          <span className="text-slate-500">#{nft.id}</span>
        </div>
      </div>
    </motion.div>
  );
});

export default function ScavenjersCollectionPage() {
  useParams();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTraits, setSelectedTraits] = useState<{ [trait: string]: Set<string> }>({});
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'exchange' | 'holders' | 'about'>('explore');
  const [visibleCount, setVisibleCount] = useState(24); // Start with 24 items
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Performance optimization: Pre-compute trait maps for faster filtering
  const nftTraitMaps = useMemo(() => {
    return allNFTs.map(nft => ({
      nft,
      traitMap: new Map((nft.attributes || []).map(attr => [attr.trait_type, attr.value])),
      searchText: nft.name.toLowerCase()
    }));
  }, [allNFTs]);

  // Load NFT metadata
  useEffect(() => {
    async function loadMetadata() {
      setLoading(true);
      try {
        const data = await import('../../../metadata-fixed.json');
        let nfts: any[] = [];
        if (Array.isArray(data)) {
          nfts = data;
        } else if (data && Array.isArray((data as any).default)) {
          nfts = (data as any).default;
        } else {
          console.error('metadata-fixed.json import did not return an array:', data);
          nfts = [];
        }
        setAllNFTs(nfts);
      } catch (error) {
        console.error('Error loading NFT metadata:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, []);

  // Calculate collection traits
  const collectionTraits = useMemo(() => {
    const traitsMap: { [trait: string]: { [value: string]: number } } = {};
    allNFTs.forEach(nft => {
      (nft.attributes || []).forEach((trait: NFTTrait) => {
        const type = trait.trait_type;
        const value = trait.value;
        if (!type || value === undefined || value === null) return;
        if (!traitsMap[type]) traitsMap[type] = {};
        traitsMap[type][value] = (traitsMap[type][value] || 0) + 1;
      });
    });
    return traitsMap;
  }, [allNFTs]);

  // Debounced filtering for better performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [debouncedSearchQuery, selectedTraits]);

  // Optimized filter function with better performance
  const filteredNFTs = useMemo(() => {
    setFiltering(true);
    
    let filtered = nftTraitMaps;

    // Search filter - use pre-computed lowercase text
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(item => item.searchText.includes(query));
    }

    // Traits filter - use pre-computed trait maps
    for (const [trait, selectedValues] of Object.entries(selectedTraits)) {
      if (selectedValues.size > 0) {
        filtered = filtered.filter(item => {
          const nftValue = item.traitMap.get(trait);
          return nftValue && selectedValues.has(nftValue);
        });
      }
    }

    // Use setTimeout to update filtering state after render
    setTimeout(() => setFiltering(false), 0);
    
    return filtered.map(item => item.nft);
  }, [nftTraitMaps, debouncedSearchQuery, selectedTraits]);

  // Get visible NFTs based on current visible count
  const visibleNFTs = useMemo(() => {
    return filteredNFTs.slice(0, visibleCount);
  }, [filteredNFTs, visibleCount]);

  // Load more function
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    // Simulate brief loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setVisibleCount(prev => Math.min(prev + 24, filteredNFTs.length));
    setLoadingMore(false);
  }, [filteredNFTs.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* Collection Header - Simplified */}
      <div className="flex-shrink-0">
        <div className="px-4 lg:px-6 xl:px-8 py-6">
          {/* Collection Info - Compact */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={collectionInfo.image}
                alt={collectionInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {collectionInfo.name}
                </h1>
                {collectionInfo.verified && (
                  <Badge size={20} className="text-cyan-400" />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {(['explore', 'exchange', 'holders', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 capitalize",
                  activeTab === tab
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                {tab === 'exchange' ? 'The Exchange' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Bar - Simplified */}
      {activeTab === 'explore' && (
        <div className="px-4 lg:px-6 xl:px-8 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-slate-800/30 border-0 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800/50 transition-all duration-300 text-sm"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm",
                  showFilters 
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                <SlidersHorizontal size={16} />
                Traits
              </button>

              {/* Results Count */}
              <div className="flex items-center gap-2">
                {filtering && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                <span className="text-sm text-slate-500">
                  {filtering ? 'Filtering...' : `${filteredNFTs.length} items`}
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded transition-all duration-300",
                    viewMode === 'grid'
                      ? "bg-slate-700/50 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded transition-all duration-300",
                    viewMode === 'list'
                      ? "bg-slate-700/50 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout - Scrollable */}
      <div className="flex-1 flex gap-4 px-4 lg:px-6 xl:px-8 pb-6 overflow-hidden">
        {/* Traits Filter Sidebar - Only show for explore tab */}
        {activeTab === 'explore' && showFilters && (
          <div className="w-80 flex-shrink-0 h-full">
            <TraitsFilter
              collectionTraits={collectionTraits}
              selectedTraits={selectedTraits}
              onTraitsChange={setSelectedTraits}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'exchange' && (
            <ExchangePage />
          )}
          
          {activeTab === 'explore' && (
            <>
              {filteredNFTs.length > 0 ? (
                <div className="relative">
                  {/* Filtering overlay */}
                  {filtering && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                        <p className="text-slate-300">Filtering Ekos...</p>
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                      {visibleNFTs.map((nft, i) => (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          viewMode={viewMode}
                          onClick={() => setSelectedNFT(nft)}
                          priority={i < 12} // First 12 items get priority loading
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleNFTs.map((nft, i) => (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          viewMode={viewMode}
                          onClick={() => setSelectedNFT(nft)}
                          priority={i < 12}
                        />
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {visibleCount < filteredNFTs.length && (
                    <div className="flex justify-center pt-8 pb-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className={cn(
                          "px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2",
                          loadingMore 
                            ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl"
                        )}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading More Ekos...
                          </>
                        ) : (
                          <>
                            Load More ({filteredNFTs.length - visibleCount} remaining)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-slate-500" />
                  </div>
                  <h3 className="text-white mb-1">No items found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'holders' && (
            <div className="text-center py-20">
              <h3 className="text-white mb-2">Holders</h3>
              <p className="text-slate-500 text-sm">Coming soon...</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-3">About The Scavenjers</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    A collection of unique digital collectibles exploring the post-apocalyptic world of Eko. 
                    Each Scavenjer represents a survivor with unique traits and abilities, navigating through 
                    the remnants of civilization.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Total Supply</span>
                    <div className="text-white font-medium">{collectionInfo.totalSupply.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Owners</span>
                    <div className="text-white font-medium">{collectionInfo.owners.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Creator</span>
                    <div className="text-white font-medium">{collectionInfo.creator}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Chain</span>
                    <div className="text-white font-medium">Polygon</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedNFT.name}</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square bg-slate-700/30 rounded-xl overflow-hidden">
                  <img
                    src={ipfsToHttp(selectedNFT.image)}
                    alt={selectedNFT.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Collection</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">The Scavenjers</span>
                      <Badge size={16} className="text-cyan-400" />
                    </div>
                  </div>

                  {/* Traits */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Traits</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(selectedNFT.attributes || []).map((trait, index) => (
                        <div
                          key={`${trait.trait_type}-${trait.value}-${index}`}
                          className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                        >
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            {trait.trait_type}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {trait.value}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {collectionTraits[trait.trait_type]?.[trait.value] || 0} have this trait
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
