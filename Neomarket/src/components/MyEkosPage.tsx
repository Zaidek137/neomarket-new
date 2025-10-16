import { useState, useEffect } from 'react';
import { User, Plus, ShoppingCart, Eye, ExternalLink, Wallet, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract, prepareContractCall, toWei } from 'thirdweb';
import { balanceOf, totalSupply, getNFT, ownerOf } from 'thirdweb/extensions/erc721';
import { polygon } from 'thirdweb/chains';
import { useNavigate } from 'react-router-dom';
import { client } from '../client';
import { NFT_COLLECTION_ADDRESS, CONTRACT_ADDRESS, NATIVE_TOKEN_ADDRESS } from '../config/constants';
import { useCryptoPrice } from '../hooks/useCryptoPrice';
import { ipfsToHttp } from '../lib/ipfs';
import RarityCheckerModal from './RarityCheckerModal';

interface OwnedEko {
  tokenId: string;
  name: string;
  image: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function MyEkosPage() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { mutate: sendTransaction } = useSendTransaction();
  const { polPrice } = useCryptoPrice();
  const [ownedEkos, setOwnedEkos] = useState<OwnedEko[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [usingManualScan, setUsingManualScan] = useState(false);
  const [lastFullScan, setLastFullScan] = useState<Date | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedEko, setSelectedEko] = useState<OwnedEko | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [showRarityModal, setShowRarityModal] = useState(false);
  const [raritySelectedEko, setRaritySelectedEko] = useState<OwnedEko | null>(null);
  const [collectionNFTs, setCollectionNFTs] = useState<any[]>([]);

  // Load cached data when wallet connects, auto-scan on first visit
  useEffect(() => {
    if (account?.address) {
      // Try to load from cache first
      const cacheLoaded = loadFromCache(account.address);
      if (!cacheLoaded) {
        // No cache available - this is first visit, auto-scan
        console.log('🚀 First visit detected - auto-scanning for NFTs...');
        setOwnedEkos([]);
        setCacheLoaded(false);
        // Auto-scan on first visit
        fetchOwnedEkos(true);
      }
    } else {
      setOwnedEkos([]);
      setCacheLoaded(false);
    }
  }, [account?.address]);

  // Load collection metadata for rarity calculation
  useEffect(() => {
    const loadCollectionMetadata = async () => {
      try {
        const response = await fetch('/metadata-fixed.json');
        if (response.ok) {
          const nfts = await response.json();
          if (Array.isArray(nfts)) {
            setCollectionNFTs(nfts);
          }
        }
      } catch (error) {
        console.error('Error loading collection metadata:', error);
      }
    };
    loadCollectionMetadata();
  }, []);

  // Cache management functions
  const getCacheKey = (walletAddress: string) => `eko_cache_${walletAddress.toLowerCase()}`;
  
  const loadFromCache = (walletAddress: string) => {
    try {
      const cacheKey = getCacheKey(walletAddress);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp, scanTimestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        
        // Cache persists indefinitely until manual refresh
        console.log(`📦 Loading cached NFT data (${Math.round(cacheAge / 1000 / 60 / 60)}h old)`);
        setOwnedEkos(data);
        setLastRefresh(new Date(timestamp));
        setLastFullScan(scanTimestamp ? new Date(scanTimestamp) : null);
        setCacheLoaded(true);
        setUsingManualScan(true); // Indicate this was from manual scan cache
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Error loading cache:', error);
    }
    return false;
  };
  
  const saveToCache = (walletAddress: string, data: OwnedEko[], scanTime: Date) => {
    try {
      const cacheKey = getCacheKey(walletAddress);
      const cacheData = {
        data,
        timestamp: scanTime.getTime(),
        scanTimestamp: scanTime.getTime()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('💾 Saved NFT data to cache');
    } catch (error) {
      console.warn('⚠️ Error saving cache:', error);
    }
  };

  // Manual NFT scanning fallback using totalSupply + ownerOf
  const manualNFTScan = async (nftContract: any, walletAddress: string, isForceRefresh = false) => {
    console.log('🔧 Starting manual NFT scan (range scanning method)...');
    console.log('⚡ RPC Usage Mode:', isForceRefresh ? 'FULL SCAN (Force Refresh)' : 'LIMITED SCAN (Auto)');
    
    try {
      // Method 1: Check balance first
      console.log('📊 Checking NFT balance...');
      const balance = await balanceOf({
        contract: nftContract,
        owner: walletAddress,
      });
      
      const balanceNum = Number(balance);
      console.log(`📊 Manual balance check: ${balanceNum} NFTs`);
      
      if (balanceNum === 0) {
        console.log('❌ Manual scan: No NFTs found via balance check');
        return [];
      }
      
      // Method 2: Get total supply to know the range of token IDs
      console.log('📊 Getting total supply for range scanning...');
      const totalSupplyResult = await totalSupply({
        contract: nftContract,
      });
      
      const totalSupplyNum = Number(totalSupplyResult);
      console.log(`📊 Total supply: ${totalSupplyNum} NFTs`);
      
      if (totalSupplyNum === 0) {
        console.log('❌ Total supply is 0, no NFTs exist');
        return [];
      }
      
      // Method 3: Range scan through token IDs to find owned ones (starting from 0)
      // Manual scan only: up to 200 tokens
      const maxScanRange = Math.min(totalSupplyNum, 200); // Manual refresh: scan up to 200 tokens
      
      console.log(`🔍 Range scanning token IDs 0-${maxScanRange - 1} (MANUAL scan)...`);
      const ownedNFTs = [];
      let foundCount = 0;
      
      // Scan in batches to avoid overwhelming RPC
      const batchSize = 40; // Optimized batch size for 200 token limit
      for (let start = 0; start < maxScanRange && foundCount < balanceNum; start += batchSize) {
        const end = Math.min(start + batchSize - 1, maxScanRange - 1);
        console.log(`🔍 Scanning batch: tokens ${start}-${end}`);
        
        const batchPromises = [];
        for (let tokenId = start; tokenId <= end && foundCount < balanceNum; tokenId++) {
          batchPromises.push(
            ownerOf({
              contract: nftContract,
              tokenId: BigInt(tokenId),
            }).then(owner => ({ tokenId, owner }))
            .catch(error => {
              // Token might not exist or other error
              console.warn(`⚠️ Token ${tokenId} check failed:`, error.message);
              return null;
            })
          );
        }
        
        try {
          const batchResults = await Promise.all(batchPromises);
          
          for (const result of batchResults) {
            if (result && result.owner.toLowerCase() === walletAddress.toLowerCase()) {
              console.log(`✅ Found owned token: ${result.tokenId}${result.tokenId === 0 ? ' (Token ID 0!)' : ''}`);
              foundCount++;
              
              // Get NFT metadata
              try {
                const nft = await getNFT({
                  contract: nftContract,
                  tokenId: BigInt(result.tokenId),
                });
                
                ownedNFTs.push({
                  id: BigInt(result.tokenId),
                  tokenAddress: NFT_COLLECTION_ADDRESS,
                  owner: walletAddress,
                  metadata: nft.metadata,
                });
                
                console.log(`✅ Retrieved metadata for token ${result.tokenId}`);
              } catch (metadataError) {
                console.warn(`⚠️ Could not get metadata for token ${result.tokenId}:`, metadataError);
                // Add without metadata
                ownedNFTs.push({
                  id: BigInt(result.tokenId),
                  tokenAddress: NFT_COLLECTION_ADDRESS,
                  owner: walletAddress,
                  metadata: {
                    name: `Eko #${result.tokenId}`,
                    description: '',
                    image: '',
                  },
                });
              }
              
              // Stop if we found all expected NFTs
              if (foundCount >= balanceNum) {
                console.log(`🎉 Found all ${balanceNum} expected NFTs, stopping scan`);
                break;
              }
            }
          }
        } catch (batchError) {
          console.warn(`⚠️ Batch ${start}-${end} failed:`, batchError);
        }
        
        // Small delay between batches to avoid rate limiting
        if (start + batchSize <= maxScanRange) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`🎉 Manual range scan found ${ownedNFTs.length}/${balanceNum} NFTs`);
      
      // Warn if we didn't find all expected NFTs
      if (ownedNFTs.length < balanceNum) {
        console.warn(`⚠️ MANUAL SCAN: Found ${ownedNFTs.length}/${balanceNum} NFTs. Some NFTs may have token IDs > 199.`);
        console.warn(`💡 TIP: If expecting more NFTs, they may have higher token IDs beyond our scan range.`);
      }
      
      return ownedNFTs;
      
    } catch (error) {
      console.error('❌ Manual NFT scan failed:', error);
      return [];
    }
  };

  const fetchOwnedEkos = async (forceRefresh = false) => {
    if (!account?.address) return;

    const isManualRefresh = forceRefresh;
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('🔄 Fetching owned NFTs for:', account.address, forceRefresh ? '(FORCE REFRESH)' : '');
      console.log('📍 Using collection address:', NFT_COLLECTION_ADDRESS);
      
      // Get the NFT contract
      const nftContract = getContract({
        client,
        chain: polygon,
        address: NFT_COLLECTION_ADDRESS
      });

      console.log('🔄 Cache busting:', forceRefresh ? 'YES' : 'NO');

      // Manual scan only - no automatic scanning to save RPC
      let ownedNFTs: any[] = [];
      let usingManualScan = false;
      
      if (forceRefresh) {
        console.log('🔄 Manual refresh requested, performing manual scan...');
        try {
          ownedNFTs = await manualNFTScan(nftContract, account.address, forceRefresh);
          usingManualScan = true;
          setLastFullScan(new Date());
          console.log(`🎉 Manual scan found ${ownedNFTs.length} NFTs`);
        } catch (manualError) {
          console.error('❌ Manual scan failed:', manualError);
          ownedNFTs = [];
        }
      } else {
        console.log('💡 No automatic scanning - Click "Refresh" to scan for your NFTs');
        ownedNFTs = [];
      }

      console.log('📊 Final NFT count:', ownedNFTs.length);
      console.log('📊 Using manual scan:', usingManualScan);
      console.log('📊 Raw NFT data:', ownedNFTs.map(nft => ({ 
        id: nft.id?.toString(), 
        tokenAddress: nft.tokenAddress,
        owner: nft.owner 
      })));

      // Transform NFT data to our format
      const formattedEkos = ownedNFTs.map((nft) => {
        const imageUrl = nft.metadata?.image || '';
        console.log('🖼️ NFT Image URL:', imageUrl, '-> Converted:', ipfsToHttp(imageUrl));
        
        return {
          tokenId: nft.id.toString(),
          name: nft.metadata?.name || `Eko #${nft.id}`,
          image: imageUrl,
          description: nft.metadata?.description || '',
          attributes: (nft.metadata?.attributes as any[]) || []
        };
      });

      const scanTime = new Date();
      setOwnedEkos(formattedEkos);
      setLastRefresh(scanTime);
      setUsingManualScan(usingManualScan);
      setCacheLoaded(false); // This is fresh data, not cache
      
      // Save to cache if we got data
      if (formattedEkos.length > 0 && account?.address) {
        saveToCache(account.address, formattedEkos, scanTime);
      }
      
      console.log(`✅ Successfully loaded ${formattedEkos.length} Ekos ${usingManualScan ? '(via manual scan)' : '(via Thirdweb indexer)'}`);
      
    } catch (error) {
      console.error('❌ Error fetching owned Ekos:', error);
      setOwnedEkos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleListEko = (eko: OwnedEko) => {
    setSelectedEko(eko);
    setShowListModal(true);
  };

  const handleCheckRarity = (eko: OwnedEko) => {
    setRaritySelectedEko(eko);
    setShowRarityModal(true);
  };

  const handleSubmitListing = async () => {
    if (!selectedEko || !listingPrice || !account) return;

    setIsListing(true);
    try {
      const marketplaceContract = getContract({
        client,
        chain: polygon,
        address: CONTRACT_ADDRESS
      });

      // Prepare the listing transaction
      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: "function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) _params)",
        params: [{
          assetContract: NFT_COLLECTION_ADDRESS,
          tokenId: BigInt(selectedEko.tokenId),
          quantity: 1n,
          currency: NATIVE_TOKEN_ADDRESS,
          pricePerToken: toWei(listingPrice),
          startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
          endTimestamp: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 year
          reserved: false
        }]
      });

      // Send the transaction
      sendTransaction(transaction, {
        onSuccess: () => {
          console.log('Listing created successfully!');
          setShowListModal(false);
          setListingPrice('');
          setSelectedEko(null);
          // Optionally refresh the owned NFTs
          fetchOwnedEkos();
          // Navigate to exchange
          navigate('/exchange');
        },
        onError: (error) => {
          console.error('Error creating listing:', error);
          alert('Failed to create listing. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error preparing listing:', error);
      alert('Failed to prepare listing. Please try again.');
    } finally {
      setIsListing(false);
    }
  };

  const ListEkoModal = () => {
    if (!selectedEko) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">List Eko for Sale</h3>
            <button
              onClick={() => setShowListModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Eko Preview */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                  {selectedEko.image ? (
                    <img 
                      src={ipfsToHttp(selectedEko.image)} 
                      alt={selectedEko.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white">{selectedEko.name}</h4>
                  <p className="text-sm text-slate-400">Token ID: {selectedEko.tokenId}</p>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Listing Price (MATIC)
              </label>
              <input
                type="number"
                step="0.001"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                placeholder="0.1"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-400">
                Set your desired price in MATIC tokens
              </p>
            </div>

            {/* Price Display in USD */}
            {listingPrice && parseFloat(listingPrice) > 0 && polPrice && (
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Estimated USD Value</span>
                  <span className="font-medium text-white">
                    ${(parseFloat(listingPrice) * polPrice).toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowListModal(false);
                  setListingPrice('');
                }}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitListing}
                disabled={!listingPrice || parseFloat(listingPrice) <= 0 || isListing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isListing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Listing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    List for Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EkoCard = ({ eko }: { eko: OwnedEko }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800/70 transition-colors">
        {/* Image */}
        <div className="aspect-square bg-slate-700 relative">
          {eko.image && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              )}
              <img 
                src={ipfsToHttp(eko.image)} 
                alt={eko.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <User size={48} />
            </div>
          )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => handleListEko(eko)}
            className="p-2 bg-cyan-500/80 backdrop-blur-sm rounded-lg hover:bg-cyan-600/80 transition-colors"
            title="List for Sale"
          >
            <ShoppingCart size={16} className="text-white" />
          </button>
          <button
            onClick={() => handleCheckRarity(eko)}
            className="p-2 bg-purple-500/80 backdrop-blur-sm rounded-lg hover:bg-purple-600/80 transition-colors"
            title="Check Rarity"
          >
            <Sparkles size={16} className="text-white" />
          </button>
          <button
            className="p-2 bg-slate-600/80 backdrop-blur-sm rounded-lg hover:bg-slate-700/80 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-medium text-white text-sm truncate">{eko.name}</h3>
          <p className="text-xs text-slate-400">Token ID: {eko.tokenId}</p>
        </div>

        {/* Traits Preview */}
        {eko.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {eko.attributes.slice(0, 2).map((attr, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600/50 truncate"
              >
                {attr.value}
              </span>
            ))}
            {eko.attributes.length > 2 && (
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded border border-slate-600/50">
                +{eko.attributes.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <User className="text-cyan-400" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">My Ekos</h1>
              <p className="text-slate-400">Manage your Eko collection</p>
              {lastRefresh && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Clock size={12} />
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  {cacheLoaded && (
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">
                      Cached
                    </span>
                  )}
                  {usingManualScan && !cacheLoaded && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs">
                      Fresh Scan
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {account && (
            <button
              onClick={() => fetchOwnedEkos(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              title="Refresh: Use if you recently bought/minted Ekos or expect more to appear"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          
          {account && ownedEkos.length > 0 && (
            <button
              onClick={() => navigate('/exchange')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg ml-4"
            >
              <ExternalLink size={16} />
              View Exchange
            </button>
          )}
        </div>
      </div>

      {/* Wallet Connection Check */}
      {!account ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <div className="space-y-4">
            <Wallet className="text-slate-400 mx-auto" size={64} />
            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Connect your wallet to view and manage your Eko collection. You'll be able to see all your owned Ekos and list them for sale.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Smart Caching Notice */}
          {!loading && !refreshing && (
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="text-green-400 mt-0.5" size={16} />
                <div className="text-sm">
                  <p className="text-green-200 font-medium">NOTICE:</p>
                  <div className="text-green-300/80 mt-1 space-y-1">
                    <p>• <strong>Use "Refresh"</strong> only if you recently bought/minted Ekos or expect more to appear.</p>
                    {lastFullScan && (
                      <p className="text-green-400 text-xs mt-2">
                        Last fresh scan: {lastFullScan.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <User className="text-cyan-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{ownedEkos.length}</div>
                  <div className="text-sm text-slate-400">Owned Ekos</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ShoppingCart className="text-purple-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-sm text-slate-400">Listed for Sale</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Plus className="text-green-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-sm text-slate-400">Total Sales</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading your Ekos...</p>
            </div>
          )}

          {/* Ekos Grid */}
          {!loading && ownedEkos.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Collection</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {ownedEkos.map((eko) => (
                  <EkoCard key={eko.tokenId} eko={eko} />
                ))}
              </div>
            </div>
          )}

          {/* No Ekos State */}
          {!loading && ownedEkos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-bold text-white mb-2">No Ekos Found</h3>
              <p className="text-slate-400 mb-6">
                You don't own any Ekos yet. Purchase one from our collection to get started!
              </p>
              <button
                onClick={() => navigate('/collection/scavenjers')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <ShoppingCart size={16} />
                Browse Collection
              </button>
            </div>
          )}
        </>
      )}

      {/* List Eko Modal */}
      {showListModal && <ListEkoModal />}

      {/* Rarity Checker Modal */}
      {showRarityModal && raritySelectedEko && (
        <RarityCheckerModal
          isOpen={showRarityModal}
          onClose={() => {
            setShowRarityModal(false);
            setRaritySelectedEko(null);
          }}
          nft={raritySelectedEko}
          collectionNFTs={collectionNFTs}
        />
      )}
    </div>
  );
}
