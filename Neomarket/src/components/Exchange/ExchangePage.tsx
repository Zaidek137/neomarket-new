import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, ChevronDown, ShoppingCart, Eye, Heart, DollarSign, Plus, Tag, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useActiveAccount, useSendTransaction, MediaRenderer } from 'thirdweb/react';
import { getContract, readContract, prepareContractCall, toWei } from 'thirdweb';
import { getOwnedNFTs, getNFT } from 'thirdweb/extensions/erc721';
import { polygon } from 'thirdweb/chains';
import { client } from '../../client';
import { CONTRACT_ADDRESS, NFT_COLLECTION_ADDRESS, WMATIC_ADDRESS } from '../../config/constants';
import BuyModal from '../BuyModal';
import { useCryptoPrice } from '../../hooks/useCryptoPrice';

interface ListedEko {
  listingId: bigint;
  tokenId: bigint;
  name: string;
  image: string;
  price: bigint;
  priceInPol: number;
  priceInUsd: number;
  currency: string;
  seller: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  listedAt: string;
  collection: string;
  nft?: any;
  listing?: any;
}



export default function ExchangePage() {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const { price: polPrice } = useCryptoPrice('matic-network');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [listings, setListings] = useState<ListedEko[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    currency: 'all',
    listingType: 'all',
    collection: 'all',
    traits: {} as { [trait: string]: string[] }
  });

  // Fetch marketplace listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const marketplaceContract = getContract({ 
          client, 
          chain: polygon, 
          address: CONTRACT_ADDRESS 
        });

        // Get total listings
        const totalListings = await readContract({
          contract: marketplaceContract,
          method: "function totalListings() view returns (uint256)",
          params: []
        });

        if (totalListings === 0n) {
          setListings([]);
          setLoading(false);
          return;
        }

        // Get all valid listings
        const endId = totalListings > 50n ? 49n : totalListings - 1n;
        const allListings = await readContract({
          contract: marketplaceContract,
          method: "function getAllValidListings(uint256 _startId, uint256 _endId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved)[] _validListings)",
          params: [0n, endId]
        });

        // Process listings in batches for better performance
        const batchSize = 5;
        const enrichedListings: ListedEko[] = [];
        let isFirstBatch = true;

        // Create contract instances map to reuse
        const contractCache = new Map();
        
        for (let i = 0; i < allListings.length; i += batchSize) {
          const batch = allListings.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (listing: any) => {
            try {
              // Reuse contract instance if already created
              let nftContract = contractCache.get(listing.assetContract);
              if (!nftContract) {
                nftContract = getContract({ 
                  client, 
                  chain: polygon, 
                  address: listing.assetContract 
                });
                contractCache.set(listing.assetContract, nftContract);
              }
              
              const nft = await getNFT({ 
                contract: nftContract, 
                tokenId: listing.tokenId 
              });

              const priceInPol = Number(listing.pricePerToken) / 1e18;
              const maticPrice = polPrice || 0.85;
              const priceInUsd = priceInPol * maticPrice;

              return {
                listingId: listing.listingId,
                tokenId: listing.tokenId,
                name: nft.metadata?.name || `Eko #${listing.tokenId}`,
                image: nft.metadata?.image || '',
                price: listing.pricePerToken,
                priceInPol,
                priceInUsd,
                currency: listing.currency,
                seller: listing.listingCreator,
                attributes: nft.metadata?.attributes || [],
                listedAt: new Date(Number(listing.startTimestamp) * 1000).toISOString(),
                collection: 'The Scavenjers',
                nft,
                listing
              };
            } catch (error) {
              console.error('Error enriching listing:', error);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(Boolean) as ListedEko[];
          enrichedListings.push(...validResults);

          // Show first batch immediately for better perceived performance
          if (isFirstBatch && validResults.length > 0) {
            setListings(validResults);
            setLoading(false);
            isFirstBatch = false;
          }
        }

        setListings(enrichedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [polPrice]); // Re-fetch when polPrice is available to ensure accurate USD prices

  // Update USD prices when polPrice changes
  useEffect(() => {
    console.log('Exchange Price Update Effect:', { polPrice, listingsCount: listings.length });
    if (polPrice && listings.length > 0) {
      console.log('Updating USD prices with polPrice:', polPrice);
      setListings(prevListings => 
        prevListings.map(listing => {
          const newPriceInUsd = listing.priceInPol * polPrice;
          console.log(`Listing ${listing.tokenId}: ${listing.priceInPol} POL * ${polPrice} = $${newPriceInUsd}`);
          return {
            ...listing,
            priceInUsd: newPriceInUsd
          };
        })
      );
    }
  }, [polPrice]);

  // Cancel listing function
  const cancelListing = async (listing: ListedEko) => {
    if (!account || !listing.listingId) return;
    
    try {
      const marketplaceContract = getContract({
        client,
        chain: polygon,
        address: CONTRACT_ADDRESS
      });

      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: "function cancelListing(uint256 _listingId)",
        params: [listing.listingId]
      });

      await sendTransaction(transaction);
      
      // Remove from local state
      setListings(prevListings => 
        prevListings.filter(l => l.listingId !== listing.listingId)
      );
      
      // Show success message or notification
      alert('Listing cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling listing:', error);
      alert('Failed to cancel listing. Please try again.');
    }
  };

  // Filter and sort Ekos
  const filteredEkos = useMemo(() => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(eko => 
        eko.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eko.tokenId.toString().includes(searchQuery)
      );
    }

    // Price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter(eko => eko.priceInUsd >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(eko => eko.priceInUsd <= parseFloat(filters.priceRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceInUsd - b.priceInUsd;
        case 'price-high':
          return b.priceInUsd - a.priceInUsd;
        case 'newest':
          return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
        case 'oldest':
          return new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [listings, searchQuery, filters, sortBy]);

  return (
    <div className="px-3 py-4 space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">The Exchange</h1>
          <p className="text-slate-400 text-sm">Buy and sell individual Ekos</p>
        </div>
        <button
          onClick={() => setShowListModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium"
        >
          <Plus size={18} />
          List Eko
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ekos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border backdrop-blur-sm text-sm",
              showFilters 
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                : "bg-slate-800/50 text-slate-400 border-slate-600/50 hover:text-white hover:border-slate-500/50"
            )}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          {/* Results Count */}
          <div className="text-sm text-slate-400">
            <span className="font-medium text-white">{filteredEkos.length}</span> Ekos listed
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 pr-8 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm text-sm"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rarity">Rarity</option>
              <option value="newest">Recently Listed</option>
              <option value="oldest">Oldest Listed</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-600/50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded transition-all duration-300",
                viewMode === 'grid'
                  ? "bg-cyan-500/20 text-cyan-300"
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
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <ExchangeFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Ekos Grid */}
        <div className="flex-1">
          <EkoGrid 
            ekos={filteredEkos} 
            viewMode={viewMode} 
            loading={loading}
            onBuyClick={(listing) => {
              setSelectedListing(listing);
              setShowBuyModal(true);
            }}
            onCancelClick={cancelListing}
            currentUserAddress={account?.address}
          />
        </div>
      </div>

      {/* List Eko Modal */}
      {showListModal && (
        <ListEkoModal 
          isOpen={showListModal}
          onClose={() => setShowListModal(false)}
        />
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedListing && (
        <BuyModal
          listing={selectedListing.listing}
          metadata={selectedListing.nft?.metadata}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
          }}
          client={client}
          polPrice={polPrice || null}
        />
      )}
    </div>
  );
}

// Filters Component
function ExchangeFilters({ filters, onFiltersChange }: {
  filters: any;
  onFiltersChange: (filters: any) => void;
}) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: { min: '', max: '' },
      currency: 'all',
      listingType: 'all',
      collection: 'all',
      traits: {}
    });
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Price (USDT)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, min: e.target.value })}
              className="px-2 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: e.target.value })}
              className="px-2 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Currency</label>
          <select
            value={filters.currency}
            onChange={(e) => updateFilter('currency', e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
            <option value="MATIC">MATIC</option>
          </select>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Listing Type</label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'fixed', label: 'Fixed Price' },
              { value: 'auction', label: 'Auction' }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value={option.value}
                  checked={filters.listingType === option.value}
                  onChange={(e) => updateFilter('listingType', e.target.value)}
                  className="text-cyan-500"
                />
                <span className="text-sm text-slate-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Eko Grid Component
function EkoGrid({ ekos, viewMode, loading, onBuyClick, onCancelClick, currentUserAddress }: {
  ekos: ListedEko[];
  viewMode: 'grid' | 'list';
  loading: boolean;
  onBuyClick: (listing: ListedEko) => void;
  onCancelClick?: (listing: ListedEko) => void;
  currentUserAddress?: string;
}) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <ShoppingCart size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Loading Ekos...</h3>
        <p className="text-slate-400">Fetching listings from the marketplace</p>
      </div>
    );
  }

  if (ekos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Ekos found</h3>
        <p className="text-slate-400">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {ekos.map((eko) => (
          <EkoListCard 
            key={eko.listingId.toString()} 
            eko={eko} 
            onBuyClick={onBuyClick}
            onCancelClick={onCancelClick}
            currentUserAddress={currentUserAddress}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {ekos.map((eko) => (
        <EkoCard 
          key={eko.listingId.toString()} 
          eko={eko} 
          onBuyClick={onBuyClick}
          onCancelClick={onCancelClick}
          currentUserAddress={currentUserAddress}
        />
      ))}
    </div>
  );
}

// Individual Eko Card
function EkoCard({ eko, onBuyClick, onCancelClick, currentUserAddress }: { 
  eko: ListedEko; 
  onBuyClick: (listing: ListedEko) => void;
  onCancelClick?: (listing: ListedEko) => void;
  currentUserAddress?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwner = currentUserAddress && eko.seller.toLowerCase() === currentUserAddress.toLowerCase();

  return (
    <div
      className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden hover:bg-slate-700/30 hover:border-slate-600/50 hover:scale-105 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <MediaRenderer
          client={client}
          src={eko.image}
          alt={eko.name}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Actions */}
        <div className={cn(
          "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
            <Eye size={16} className="text-white" />
          </button>
          {isOwner ? (
            <button 
              onClick={() => onCancelClick && onCancelClick(eko)}
              className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-600/80 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          ) : (
            <button 
              onClick={() => onBuyClick(eko)}
              className="p-2 bg-cyan-500/80 backdrop-blur-sm rounded-lg hover:bg-cyan-600/80 transition-colors"
            >
              <ShoppingCart size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Favorite */}
        <button className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded hover:bg-black/60 transition-colors">
          <Heart size={12} className="text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-medium text-white text-sm truncate">{eko.name}</h3>
          <p className="text-xs text-slate-400">#{eko.tokenId.toString()}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Price</p>
            {eko.priceInUsd > 0 ? (
              <>
                <p className="font-bold text-white text-lg">${eko.priceInUsd.toFixed(2)} USD</p>
                <p className="text-xs text-slate-500">{eko.priceInPol.toFixed(4)} POL</p>
              </>
            ) : (
              <>
                <p className="font-bold text-white text-lg">{eko.priceInPol.toFixed(4)} POL</p>
                <p className="text-xs text-slate-500">Loading USD price...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// List view card
function EkoListCard({ eko, onBuyClick, onCancelClick, currentUserAddress }: { 
  eko: ListedEko; 
  onBuyClick: (listing: ListedEko) => void;
  onCancelClick?: (listing: ListedEko) => void;
  currentUserAddress?: string;
}) {
  const isOwner = currentUserAddress && eko.seller.toLowerCase() === currentUserAddress.toLowerCase();
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <MediaRenderer
            client={client}
            src={eko.image}
            alt={eko.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{eko.name}</h3>
          <p className="text-sm text-slate-400">#{eko.tokenId.toString()} • {eko.collection}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-sm text-slate-400">Price</p>
            {eko.priceInUsd > 0 ? (
              <>
                <p className="font-bold text-white text-xl">${eko.priceInUsd.toFixed(2)} USD</p>
                <p className="text-sm text-slate-500">{eko.priceInPol.toFixed(4)} POL</p>
              </>
            ) : (
              <>
                <p className="font-bold text-white text-xl">{eko.priceInPol.toFixed(4)} POL</p>
                <p className="text-sm text-slate-500">Loading USD...</p>
              </>
            )}
          </div>
          {isOwner ? (
            <button 
              onClick={() => onCancelClick && onCancelClick(eko)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel Listing
            </button>
          ) : (
            <button 
              onClick={() => onBuyClick(eko)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// List Eko Modal
function ListEkoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const { price: polPrice } = useCryptoPrice('matic-network');
  const [ownedNfts, setOwnedNfts] = useState<any[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [selectedNft, setSelectedNft] = useState<any | null>(null);
  const [price, setPrice] = useState('');

  // Calculate USD equivalent
  const usdPrice = price && polPrice ? (parseFloat(price) * polPrice).toFixed(2) : '0.00';

  useEffect(() => {
    if (isOpen && account) {
      fetchOwnedNFTs();
    }
  }, [isOpen, account]);

  const fetchOwnedNFTs = async () => {
    if (!account) return;
    setLoadingNfts(true);
    try {
      const contract = getContract({
        client,
        chain: polygon,
        address: NFT_COLLECTION_ADDRESS,
      });

      const nfts = await getOwnedNFTs({
        contract,
        owner: account.address,
      });

      setOwnedNfts(nfts);
    } catch (error) {
      console.error('Error fetching owned NFTs:', error);
    } finally {
      setLoadingNfts(false);
    }
  };

  const handleList = async () => {
    if (!selectedNft || !price || !account) return;

    const priceInWei = toWei(price);
    const params = {
      assetContract: NFT_COLLECTION_ADDRESS,
      tokenId: BigInt(selectedNft.id),
      quantity: BigInt(1),
      currency: WMATIC_ADDRESS,
      pricePerToken: priceInWei,
      startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
      endTimestamp: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7), // 1 week
      reserved: false,
    };

    const marketplaceContract = getContract({ 
      client, 
      chain: polygon, 
      address: CONTRACT_ADDRESS 
    });
    
    const transaction = prepareContractCall({
      contract: marketplaceContract,
      method: "function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) _params) returns (uint256 listingId)",
      params: [params],
    });

    sendTransaction(transaction, {
      onSuccess: () => {
        onClose();
        setPrice('');
        setSelectedNft(null);
        // Refresh listings
        window.location.reload();
      },
      onError: (error) => {
        console.error("Failed to create listing:", error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">List Your Eko</h2>
        
        {!account ? (
          <p className="text-slate-400 mb-4">Please connect your wallet to list your Ekos</p>
        ) : (
          <>
            <p className="text-slate-400 mb-4">Select an Eko from your collection to list for sale</p>
            
            {loadingNfts ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-slate-400">Loading your Ekos...</p>
              </div>
            ) : ownedNfts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No Ekos found in your wallet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4 max-h-60 overflow-y-auto">
                  {ownedNfts.map((nft) => (
                    <div
                      key={nft.id}
                      onClick={() => setSelectedNft(nft)}
                      className={cn(
                        "border-2 rounded-lg p-2 cursor-pointer transition-all",
                        selectedNft?.id === nft.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      )}
                    >
                      <MediaRenderer
                        client={client}
                        src={nft.metadata?.image}
                        alt={nft.metadata?.name}
                        className="w-full aspect-square object-cover rounded mb-2"
                      />
                      <p className="text-xs text-white truncate">{nft.metadata?.name || `Eko #${nft.id}`}</p>
                    </div>
                  ))}
                </div>

                {selectedNft && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Price (POL)</label>
                      <input
                        type="number"
                        placeholder="Enter price in POL..."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                      />
                      {price && polPrice && (
                        <p className="mt-2 text-sm text-slate-400">
                          ≈ <span className="text-cyan-400 font-medium">${usdPrice} USD</span>
                          {polPrice && (
                            <span className="text-xs text-slate-500 ml-2">
                              (1 POL = ${polPrice.toFixed(4)})
                            </span>
                          )}
                        </p>
                      )}
                      {!polPrice && (
                        <p className="mt-2 text-xs text-slate-500">Loading price conversion...</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleList}
                disabled={!selectedNft || !price || isPending}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isPending ? 'Listing...' : 'List Eko'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
