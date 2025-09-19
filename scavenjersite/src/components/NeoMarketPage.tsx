window.console && window.console.log('[Marketplace] Test log: file loaded');

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, User, List, Activity, Gavel, Menu, X } from 'lucide-react';
import { createThirdwebClient, getContract, readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getNFT } from 'thirdweb/extensions/erc721';
import { MediaRenderer, useContractEvents } from 'thirdweb/react';
import { CONTRACT_ADDRESS } from '../config/constants';
import TraitModal from './TraitModal';
import BuyModal from './BuyModal';
import { useCryptoPrice } from '../hooks/useCryptoPrice';
import ListEko from './ListEko';
import MyEkos from './MyEkos';
import ActivityPage from './ActivityPage';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DarkCircuitAuction from './DarkCircuitAuction';
import TheDarkCircuitPage from './TheDarkCircuitPage';
import { prepareEvent } from "thirdweb";
import { fetchABI } from '../services/optimizedApi';
import { EnrichedListing, EnrichedAuction, MarketplaceAuction, NFTMetadata } from '../types/marketplace';

const THIRDWEB_CLIENT_ID = "dc56b7276133338ec60eebc93d1c38b1";
const MARKETPLACE_CONTRACT = CONTRACT_ADDRESS;
const POLYGON_CHAIN = defineChain(137);
const PAGE_SIZE = 50;

console.debug('[Marketplace] NeoMarketPage component mounted');

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

const newAuctionEvent = prepareEvent({
  signature: "event NewAuction(address indexed auctionCreator, uint256 indexed auctionId, address indexed assetContract, (uint256 auctionId, uint256 tokenId, uint256 quantity, uint256 minimumBidAmount, uint256 buyoutBidAmount, uint64 timeBufferInSeconds, uint64 bidBufferBps, uint64 startTimestamp, uint64 endTimestamp, address auctionCreator, address assetContract, address currency, uint8 tokenType, uint8 status) auction)",
});

const cancelledAuctionEvent = prepareEvent({
  signature: "event CancelledAuction(address indexed auctionCreator, uint256 indexed auctionId)",
});

const auctionClosedEvent = prepareEvent({
    signature: "event AuctionClosed(uint256 indexed auctionId, address indexed assetContract, address indexed closer, uint256 tokenId, address auctionCreator, address winningBidder)",
});

export default function NeoMarketPage() {
  const [activeTab, setActiveTab] = useState('Marketplace');
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFTMetadata | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [listingToBuy, setListingToBuy] = useState<EnrichedListing | null>(null);
  const { price: polPrice, loading: priceLoading } = useCryptoPrice('matic-network');
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState<EnrichedAuction[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [auctionsError, setAuctionsError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const marketplaceContract = getContract({ 
      client, 
      chain: POLYGON_CHAIN, 
      address: MARKETPLACE_CONTRACT 
  });

  const fetchLiveAuctions = async () => {
    // No need to setLoading(true) here to avoid UI flickering on refetch
    setAuctionsError(null);
    try {
      const totalAuctions = await readContract({
        contract: marketplaceContract,
        method: "function totalAuctions() view returns (uint256)",
        params: [],
      });

      if (BigInt(totalAuctions) === 0n) {
        setAuctions([]);
        setAuctionsLoading(false);
        return;
      }

      const allAuctions = await readContract({
        contract: marketplaceContract,
        method: "function getAllAuctions(uint256 _startId, uint256 _endId) view returns ((uint256 auctionId, address auctionCreator, address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 minimumBidAmount, uint256 buyoutBidAmount, uint64 timeBufferInSeconds, uint64 bidBufferBps, uint64 startTimestamp, uint64 endTimestamp, uint8 status)[] allAuctions)",
        params: [0n, BigInt(totalAuctions) - 1n],
      });

      const enrichedAuctions = await Promise.all(
        allAuctions.map(async (auction: MarketplaceAuction) => {
          try {
            const assetContract = getContract({ client, chain: POLYGON_CHAIN, address: auction.assetContract });
            const nft = await getNFT({ contract: assetContract, tokenId: auction.tokenId });
            return { auction, metadata: nft.metadata };
          } catch (e) {
            console.error(`Failed to fetch metadata for token ${auction.tokenId}:`, e);
            return { auction, metadata: null };
          }
        })
      );
      setAuctions(enrichedAuctions);
    } catch (e) {
      console.error("Failed to fetch auctions:", e);
      setAuctionsError(`Could not load auctions. ${e instanceof Error ? e.message : 'Please try again.'}`);
    } finally {
      setAuctionsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  // Event listeners for real-time updates
  const { data: newAuctionEvents } = useContractEvents({ contract: marketplaceContract, events: [newAuctionEvent] });
  const { data: cancelledAuctionEvents } = useContractEvents({ contract: marketplaceContract, events: [cancelledAuctionEvent] });
  const { data: closedAuctionEvents } = useContractEvents({ contract: marketplaceContract, events: [auctionClosedEvent] });

  useEffect(() => {
    fetchLiveAuctions();
  }, [newAuctionEvents, cancelledAuctionEvents, closedAuctionEvents]);

  const isAuctionLive = auctions.some(a => a.auction.status === 1);

  const handleOpenBuyModal = (listing: EnrichedListing) => {
    setListingToBuy(listing);
    setBuyModalOpen(true);
  };
  
  const handleCloseBuyModal = () => {
    setListingToBuy(null);
    setBuyModalOpen(false);
  };

  useEffect(() => {
    if (activeTab !== 'Marketplace') {
      setListings([]);
      return;
    }

    async function fetchListings() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch the ABI from the public directory (with caching)
        const marketplaceAbi = await fetchABI('MarketplaceV3.json');

        // 2. Get contract instance
        const contract = getContract({
          client,
          chain: POLYGON_CHAIN,
          address: MARKETPLACE_CONTRACT,
          abi: marketplaceAbi,
        });

        // 3. Get total listings to create a valid range
        const totalListings = await readContract({
          contract,
          method: "function totalListings() view returns (uint256)",
          params: [],
        });

        const total = BigInt(totalListings);
        if (total === 0n) {
          setListings([]);
          setLoading(false);
          return;
        }
        
        const startId = BigInt(0);
        const endId = total < BigInt(PAGE_SIZE) ? total - 1n : BigInt(PAGE_SIZE - 1);

        // 4. Read from contract imperatively with the valid range
        const data = await readContract({
          contract,
          method: "function getAllValidListings(uint256 _startId, uint256 _endId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved)[] _validListings)",
          params: [startId, endId],
        });

        if (data && Array.isArray(data) && data.length > 0) {
          // 5. Fetch metadata for each listing
          const enrichedListings = await Promise.all(
            data.map(async (listing) => {
              try {
                const assetContract = getContract({
                  client,
                  chain: POLYGON_CHAIN,
                  address: listing.assetContract,
                });
                const nft = await getNFT({
                  contract: assetContract,
                  tokenId: listing.tokenId,
                });
                return { listing, metadata: nft.metadata };
              } catch (e) {
                console.error(`Failed to fetch metadata for token ${listing.tokenId}:`, e);
                return { listing, metadata: null }; // Handle cases where metadata fetch fails
              }
            })
          );
          setListings(enrichedListings);
        } else {
          setListings([]);
        }
      } catch (e) {
        console.error("Failed to fetch listings:", e);
        setError("Could not load marketplace listings.");
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [activeTab]);

  const filteredListings = listings.filter(({ metadata }) =>
    metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: 'EkoCollection', label: 'Eko Collection', icon: <Home size={18} />, path: '/collection' },
    { key: 'Marketplace', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
    { key: 'MyEkos', label: 'My Ekos', icon: <User size={18} /> },
    { key: 'ListEko', label: 'List an Eko', icon: <List size={18} /> },
    { key: 'Activity', label: 'Activity', icon: <Activity size={18} /> },
    { key: 'Auctions', label: 'Auctions', icon: <Gavel size={18} /> },
    { key: 'TheDarkCircuit', label: 'The Dark Circuit', icon: <Gavel size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-black text-white pt-20">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-[72px] left-0 right-0 bg-[#111111]/95 backdrop-blur-sm z-30 p-4 flex justify-between items-center border-b border-gray-800">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">NeoMarket</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full md:h-auto z-40 md:z-20 w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex-col shadow-2xl transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex`}>
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg hidden md:block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">NeoMarket</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2 mt-16 md:mt-0">
          {tabs.map(tab => {
            const className = `w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === tab.key ? 'bg-gradient-to-r from-cyan-500 to-pink-600 text-white shadow-lg shadow-cyan-500/25' : 'hover:bg-gray-800/60 text-gray-300'}`;

            if (tab.path) {
              return (
                <Link key={tab.key} to={tab.path} className={className}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={tab.key}
                className={className}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Live Auction Indicator */}
        <div className="p-4 mt-auto">
            <div className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer
                ${isAuctionLive 
                  ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 hover:shadow-lg hover:border-green-400/50' 
                  : 'bg-gray-800/60 border border-transparent'}
            `}>
                <Gavel className={`w-6 h-6 transition-colors ${isAuctionLive ? 'text-green-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                    <h4 className={`font-bold transition-colors ${isAuctionLive ? 'text-white' : 'text-gray-400'}`}>
                      {isAuctionLive ? 'Live Auction' : 'Auction Offline'}
                    </h4>
                    <p className={`text-xs transition-colors ${isAuctionLive ? 'text-green-300/80' : 'text-gray-500'}`}>
                      {isAuctionLive ? 'An Eko is being auctioned!' : 'No auctions are live.'}
                    </p>
                </div>
                <div className={`
                  w-3 h-3 rounded-full transition-all duration-500
                  ${isAuctionLive ? 'bg-green-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}
                `}></div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col mt-16 md:mt-0">
        <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 px-6 py-4 shadow-lg flex items-center gap-8">
            <div className="relative flex items-center gap-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              />
            </div>

            <div className="hidden md:flex items-center justify-center">
                <div className="w-full max-w-lg overflow-hidden">
                    <motion.div
                        className="text-center text-base font-semibold text-cyan-400 whitespace-nowrap"
                        initial={{ x: "100%" }}
                        animate={{ x: "-150%" }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "linear"
                        }}
                    >
                        Marketplace is currently only for viewing, purchases will not work. Stay up-to-date on Discord!
                    </motion.div>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
            <div style={{ display: activeTab === 'Marketplace' ? 'block' : 'none' }}>
                {loading ? (
                  <div className="text-cyan-200 text-lg text-center py-12">Loading listings...</div>
                ) : error ? (
                  <div className="text-red-400 text-lg text-center py-12">{error}</div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-gray-400 text-lg text-center py-12">No listings found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredListings.map(({ listing, metadata }, idx) => (
                      <motion.div
                        key={listing.listingId?.toString() || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-400 transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 w-full max-w-xs mx-auto"
                        onClick={() => setSelectedNft(metadata)}
                      >
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden shadow-inner w-full">
                          {metadata ? (
                              <MediaRenderer client={client} src={metadata.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500">No Metadata</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white truncate mb-2">{metadata?.name || 'Unnamed NFT'}</h3>
                          <div className="text-sm text-gray-400 truncate mb-2">Token ID: {listing.tokenId.toString()}</div>
                          <div className="text-xs text-gray-500 truncate mb-2">Seller: {listing.listingCreator?.slice(0, 8)}...</div>
                          {priceLoading ? (
                            <div className="h-7 bg-gray-800 rounded-md animate-pulse mt-1"></div>
                          ) : polPrice ? (
                            <div className="text-cyan-300 font-bold text-lg">
                              {(Number(listing.pricePerToken) / 1e18).toFixed(2)} POL
                              <span className="text-gray-400 text-xs ml-2">
                                (${(Number(listing.pricePerToken) / 1e18 * polPrice).toFixed(2)} USD)
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm mt-1">Price unavailable</div>
                          )}
                          <div className="mt-4">
                            <button
                              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBuyModal({ listing, metadata });
                              }}
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
            </div>
          <div style={{ display: activeTab === 'MyEkos' ? 'block' : 'none' }}>
            <MyEkos />
          </div>
          <div style={{ display: activeTab === 'ListEko' ? 'block' : 'none' }}>
            <ListEko activeTab={activeTab} />
          </div>
          <div style={{ display: activeTab === 'Activity' ? 'block' : 'none' }}>
            <ActivityPage />
          </div>
          <div style={{ display: activeTab === 'Auctions' ? 'block' : 'none' }}>
            <DarkCircuitAuction 
              auctions={auctions}
              auctionsLoading={auctionsLoading}
              auctionsError={auctionsError}
            />
          </div>
          <div style={{ display: activeTab === 'TheDarkCircuit' ? 'block' : 'none' }}>
            <TheDarkCircuitPage />
          </div>
        </div>
      </main>
      
      {/* Modal Render */}
      {selectedNft && (
        <TraitModal metadata={selectedNft} onClose={() => setSelectedNft(null)} />
      )}

      {buyModalOpen && listingToBuy && (
        <BuyModal 
          listing={listingToBuy.listing}
          metadata={listingToBuy.metadata}
          onClose={handleCloseBuyModal}
          client={client}
          polPrice={polPrice}
        />
      )}
    </div>
  );
} 