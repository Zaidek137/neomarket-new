import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Eye,
  Filter
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

// IPFS helper function
function ipfsToHttp(url: string) {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
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
  image: 'https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675',
  bannerImage: 'https://ik.imagekit.io/q9x52ygvo/banner-scavenjers.png',
  totalSupply: 9,
  floorPrice: 0.15,
  totalVolume: 2847,
  owners: 3,
  verified: true,
  creator: 'NeoMarket'
};

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

function NFTCard({ nft, viewMode, onClick }: { nft: NFT; viewMode: 'grid' | 'list'; onClick: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* NFT Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {!imageLoaded && !imageError && (
              <div className="w-full h-full bg-slate-700/50 animate-pulse" />
            )}
            {!imageError && (
              <img
                src={ipfsToHttp(nft.image)}
                alt={nft.name}
                className={cn(
                  "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-700/30 hover:border-slate-600/50 hover:scale-105 transition-all duration-300"
    >
      {/* NFT Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-slate-700/50 animate-pulse" />
        )}
        {!imageError && (
          <img
            src={ipfsToHttp(nft.image)}
            alt={nft.name}
            className={cn(
              "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
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
}

export default function ScavenjersCollectionPage() {
  const { id } = useParams();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTraits, setSelectedTraits] = useState<{ [trait: string]: Set<string> }>({});
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [activeTab, setActiveTab] = useState<'explore' | 'exchange' | 'holders' | 'about'>('explore');

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

  // Filter NFTs based on search and traits
  const filteredNFTs = useMemo(() => {
    let filtered = allNFTs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Traits filter
    for (const trait in selectedTraits) {
      const selectedValues = selectedTraits[trait];
      if (selectedValues.size > 0) {
        filtered = filtered.filter(nft => {
          const nftTraitValues = new Set(
            (nft.attributes || [])
              .filter(t => t.trait_type === trait)
              .map(t => t.value)
          );
          return [...selectedValues].some(v => nftTraitValues.has(v));
        });
      }
    }

    return filtered;
  }, [allNFTs, searchQuery, selectedTraits]);

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
              <span className="text-sm text-slate-500">
                {filteredNFTs.length} items
              </span>
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
                <div>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                      {filteredNFTs.slice(0, visibleCount).map((nft) => (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          viewMode={viewMode}
                          onClick={() => setSelectedNFT(nft)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNFTs.slice(0, visibleCount).map((nft) => (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          viewMode={viewMode}
                          onClick={() => setSelectedNFT(nft)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {visibleCount < filteredNFTs.length && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="px-6 py-2 bg-slate-700/50 text-white rounded-lg font-medium hover:bg-slate-600/50 transition-all duration-300 text-sm"
                      >
                        Load More ({filteredNFTs.length - visibleCount})
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
