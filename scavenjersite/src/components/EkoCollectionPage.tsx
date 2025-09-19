import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Lock, Palette, ArrowLeft, XIcon, ChevronUpIcon, Menu, X } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { client } from '../client';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import { Link } from 'react-router-dom';

const clientApiKey = "ck_production_5pLaG5zFyQ6nW2RuHYgapoJKcG4eV8ac5wHvki3bzyBA4MjBRxFybM2zCcQzyH1LttngQDgdDzTK8d47iwfxYrdSpAEwz9cpnrWuR9FwYxApVg9YMPXgPrTkNv4JWY6BgVtNNRmuM25Rm6R1i4KPL8dkbrv3UGLkpYgx83hp6eLRKw4oSmKfEN7z8tKcbX8k91HKcvpZCBDGcHn7kXpUfDCf";
const COLLECTION_ID = 'bf55192e-339c-40a2-a705-c7456b2f3c71';
const OPENSEA_API_KEY = 'c7d57ccec86d4a9f88660fb727a580ac';

function ipfsToHttp(url: string) {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

export default function EkoCollectionPage() {
  const account = useActiveAccount();
  const address = account?.address;
  const [email, setEmail] = useState("");
  const [allNFTs, setAllNFTs] = useState<any[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<any[]>([]);
  const [collectionTraits, setCollectionTraits] = useState<any>({});
  const [selectedTraitValues, setSelectedTraitValues] = useState<{ [trait: string]: Set<string> }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [openTraitCategories, setOpenTraitCategories] = useState<{ [trait: string]: boolean }>({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [visibleCount, setVisibleCount] = useState(25);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalNFT, setModalNFT] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'collection'>('collection');
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);

  const collections = [
    { id: 'eko', name: 'Intro Collection' },
  ];

  const [selectedCollection, setSelectedCollection] = useState(collections[0]);

  useEffect(() => {
    async function loadMetadata() {
      setLoading(true);
      const data = await import('../../metadata-fixed.json');
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
      setFilteredNFTs(nfts);
      setLoading(false);
    }
    loadMetadata();
  }, []);

  useEffect(() => {
    if (!allNFTs.length) return;
    const traitsMap: { [trait: string]: { [value: string]: number } } = {};
    allNFTs.forEach(nft => {
      (nft.attributes || []).forEach((trait: any) => {
        const type = trait.trait_type;
        const value = trait.value;
        if (!type || value === undefined || value === null) return;
        if (!traitsMap[type]) traitsMap[type] = {};
        traitsMap[type][value] = (traitsMap[type][value] || 0) + 1;
      });
    });
    setCollectionTraits(traitsMap);
    setSelectedTraitValues({});
  }, [allNFTs, selectedCollection]);

  useEffect(() => {
    if (!allNFTs.length) return;
    let nfts = allNFTs;
    if (searchTerm) {
      nfts = nfts.filter(nft =>
        (nft.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    for (const trait in selectedTraitValues) {
      const selected = selectedTraitValues[trait];
      if (selected.size > 0) {
        nfts = nfts.filter(nft => {
          const nftTraitValues = new Set((nft.attributes || []).filter((t: any) => t.trait_type === trait).map((t: any) => t.value));
          return [...selected].some(v => nftTraitValues.has(v));
        });
      }
    }
    setFilteredNFTs(nfts);
    setVisibleCount(25);
    // When filters change, mark all visible images as loading
    const newImageKeys = new Set(nfts.slice(0, 25).map(nft => nft.name || ''));
    setLoadingImages(newImageKeys);
  }, [allNFTs, searchTerm, selectedTraitValues]);

  useEffect(() => {
    const closed: { [trait: string]: boolean } = {};
    Object.keys(collectionTraits).forEach(trait => {
      closed[trait] = false;
    });
    setOpenTraitCategories(closed);
  }, [collectionTraits]);

  const toggleTraitValue = (trait: string, value: string) => {
    setSelectedTraitValues(prev => {
      const set = new Set(prev[trait] || []);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...prev, [trait]: set };
    });
  };

  const toggleTraitCategory = (trait: string) => {
    setOpenTraitCategories(prev => ({ ...prev, [trait]: !prev[trait] }));
  };

  const clearFilters = () => {
    setSelectedTraitValues({});
    setSearchTerm('');
  };

  return (
    <div className="flex h-screen bg-black text-white pt-20">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-[72px] left-0 right-0 bg-[#111111]/95 backdrop-blur-sm z-30 p-4 flex justify-between items-center border-b border-gray-800">
        <Link to="/neomarket" className="flex items-center text-xs text-cyan-300 hover:text-cyan-400 gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Neomarket
        </Link>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Filter Traits</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>
      {/* Back to Neomarket link (Desktop) */}
      <div className="absolute left-0 top-20 z-30 pl-6 pt-2 hidden md:block">
        <Link to="/neomarket" className="flex items-center text-xs text-cyan-300 hover:text-cyan-400 gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Neomarket
        </Link>
      </div>
      {/* Left Sidebar */}
      <div className={`fixed md:relative top-0 left-0 h-full md:h-auto z-40 md:z-20 w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex-col shadow-2xl transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex`}>
        {/* Logo/Title */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg hidden md:block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mt-2">The Scavenjers</h1>
          <p className="text-sm text-gray-400 mt-1">Eko Collection</p>
        </div>
        {/* Trait Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-16 md:mt-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-300">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-xs text-cyan-300 hover:text-cyan-100 transition-colors duration-200 flex items-center gap-1"
            >
              <XIcon className="w-3 h-3" />
              Clear
            </button>
          </div>

          {Object.entries(collectionTraits).map(([trait, values]) => (
            <div key={trait} className="bg-gray-800/50 rounded-lg border border-gray-700/50">
              <button
                className="w-full flex justify-between items-center p-3 text-left"
                onClick={() => toggleTraitCategory(trait)}
              >
                <span className="font-semibold text-gray-200">{trait}</span>
                <ChevronUpIcon
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openTraitCategories[trait] ? 'transform rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openTraitCategories[trait] && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 border-t border-gray-700/50 space-y-2">
                      {Object.entries(values as { [value: string]: number }).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => (
                        <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedTraitValues[trait]?.has(value) || false}
                            onChange={() => toggleTraitValue(trait, value)}
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200 flex-1">{value}</span>
                          <span className="text-xs text-gray-500 bg-gray-700/50 rounded-full px-2 py-0.5">{count}</span>
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
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden mt-16 md:mt-0">
        {/* Top Header */}
        <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 px-4 md:px-6 py-2 md:py-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <div
                className="flex items-center gap-2 text-lg md:text-xl font-semibold capitalize bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50"
              >
                {selectedCollection.name}
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Ekos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1 md:py-2 text-sm md:text-base bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              />
              {/* Crossmint Pay Button */}
              <div className="ml-2 md:ml-4 flex flex-col items-start gap-1">
                {!address && (
                  <div className="text-xs text-pink-400 bg-pink-900/20 border border-pink-500/20 rounded px-2 py-1 mb-1 shadow-sm animate-fade-in">
                    Please connect your wallet to use Crossmint checkout.
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-200 bg-cyan-900/10 px-3 py-2 rounded-lg shadow-sm text-sm">
                    Buy an Eko now (Randomized)
                  </span>
                  <CrossmintProvider apiKey={clientApiKey}>
                    <CrossmintHostedCheckout
                                        lineItems={{
                    collectionLocator: `crossmint:${COLLECTION_ID}`,
                    callData: {
                      totalPrice: "111",
                      quantity: 1,
                    },
                  }}
                      payment={{ crypto: { enabled: true }, fiat: { enabled: true } }}
                      className="crossmint-btn"
                      recipient={address ? { walletAddress: address } : undefined}
                    />
                  </CrossmintProvider>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Area: Tab content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6">
          {/* Only collection tab remains */}
          <div className="relative">
            {filteredNFTs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
                {filteredNFTs.slice(0, visibleCount).map((nft, index) => {
                  const imageKey = nft.name || '';
                  const isLoading = loadingImages.has(imageKey);
                  let thumb = nft.image;
                  if (nft.image && nft.image.endsWith('.png')) {
                    thumb = nft.image.replace('.png', '.webp');
                  }
                  return (
                    <motion.div
                      key={nft.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-400 transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 w-full mx-auto"
                      onClick={() => setModalNFT(nft)}
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden shadow-inner w-full">
                        <AnimatePresence>
                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"
                            >
                              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <img
                          src={ipfsToHttp(thumb)}
                          alt={nft.name}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => {
                            setLoadingImages(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(imageKey);
                              return newSet;
                            });
                          }}
                          onError={e => {
                            setLoadingImages(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(imageKey);
                              return newSet;
                            });
                            if (thumb !== nft.image) (e.target as HTMLImageElement).src = ipfsToHttp(nft.image);
                          }}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <h3 className="text-sm md:text-base font-bold text-white truncate">{nft.name}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12">No NFTs found for the selected filters.</div>
            )}
            {visibleCount < filteredNFTs.length && (
              <div className="flex justify-center mt-8">
                <button
                  className="bg-gradient-to-r from-cyan-500 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-pink-700 transition-colors"
                  onClick={() => setVisibleCount(v => v + 25)}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
        {/* NFT Modal - glassmorphism, gradient border */}
        {modalNFT && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-800 px-8 mt-16 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 hover:scrollbar-thumb-gray-600"
            >
              <div className="p-8 flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-6">
                  <h2 className="text-2xl font-bold text-white">Eko Details</h2>
                  <button
                    onClick={() => setModalNFT(null)}
                    className="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
                <div className="aspect-square w-full bg-gray-800 flex items-center justify-center overflow-hidden mb-6 rounded-xl shadow-inner">
                  <img
                    src={ipfsToHttp(modalNFT.image)}
                    alt={modalNFT.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{modalNFT.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(modalNFT.attributes || []).map((attr: any, i: number) => (
                    <span key={attr.trait_type + attr.value + '-' + i} className="text-xs px-2 py-1 rounded bg-cyan-900/20 text-cyan-400 font-mono">
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                </div>
                {/* Add more details as needed */}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 
