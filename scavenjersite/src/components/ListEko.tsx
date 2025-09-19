import React, { useState, useEffect } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { getContract, prepareContractCall, toWei } from 'thirdweb';
import { NFT_COLLECTION_ADDRESS, CONTRACT_ADDRESS, WMATIC_ADDRESS, USDC_ADDRESS } from '../config/constants';
import { client } from '../client';
import { MediaRenderer } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';

const ADMIN_WALLET = '0xf8Ca9dA64Bb500C4C4395f7Bb987De3e77883130';

const ListEko = ({ activeTab }: { activeTab: string }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [ownedNfts, setOwnedNfts] = useState<any[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<any | null>(null);
  const [price, setPrice] = useState('');
  const [maticPrice, setMaticPrice] = useState<number | null>(null);
  const [usdPrice, setUsdPrice] = useState<string>('');
  const [listingType, setListingType] = useState<'direct' | 'auction'>('direct');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [listingSuccess, setListingSuccess] = useState(false);

  const [createAuctionParams, setCreateAuctionParams] = useState({
    assetContract: '',
    tokenId: '',
    quantity: '1',
    currency: USDC_ADDRESS,
    minimumBidAmount: '',
    buyoutBidAmount: '',
    timeBufferInSeconds: '900', // 15 minutes
    bidBufferBps: '500', // 5%
    startTimestamp: Math.floor(Date.now() / 1000).toString(),
    endTimestamp: (Math.floor(Date.now() / 1000) + 86400).toString(), // 24 hours from now
  });

  const handleCreateAuctionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateAuctionParams(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchMaticPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
        const data = await response.json();
        setMaticPrice(data['matic-network'].usd);
      } catch (error) {
        console.error("Failed to fetch MATIC price:", error);
      }
    };
    fetchMaticPrice();
  }, []);

  useEffect(() => {
    if (price && maticPrice) {
      const numericPrice = parseFloat(price);
      if (!isNaN(numericPrice)) {
        setUsdPrice((numericPrice * maticPrice).toFixed(2));
      } else {
        setUsdPrice('');
      }
    } else {
      setUsdPrice('');
    }
  }, [price, maticPrice]);

  useEffect(() => {
    if (selectedNft) {
      setCreateAuctionParams(prev => ({
        ...prev,
        assetContract: NFT_COLLECTION_ADDRESS,
        tokenId: selectedNft.id.toString(),
      }));
    }
  }, [selectedNft]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loadingNfts) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [loadingNfts]);

  useEffect(() => {
    const fetchOwnedNfts = async () => {
      if (!account?.address || activeTab !== 'ListEko') {
        setOwnedNfts([]);
        return;
      }
      setLoadingNfts(true);
      setFetchError(null);
      try {
        const collectionContract = getContract({
          client,
          chain: polygon,
          address: NFT_COLLECTION_ADDRESS,
        });
        const nfts = await getOwnedNFTs({
          contract: collectionContract,
          owner: account.address,
        });
        setOwnedNfts(nfts);
      } catch (error: any) {
        setFetchError(`Could not load your Ekos. ${error.message || 'An unknown error occurred.'}`);
      } finally {
        setLoadingNfts(false);
      }
    };
    if (account?.address && activeTab === 'ListEko') {
      fetchOwnedNfts();
    }
  }, [account?.address, activeTab]);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nftId = e.target.value;
    if (nftId) {
      const nft = ownedNfts.find(n => n.id.toString() === nftId);
      setSelectedNft(nft || null);
    } else {
      setSelectedNft(null);
    }
  };

  const handleList = () => {
    if (!selectedNft || !price) return;

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
    
    const marketplaceContract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS });
    const transaction = prepareContractCall({
      contract: marketplaceContract,
      method: "function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) _params) returns (uint256 listingId)",
      params: [params],
    });
    
    sendTransaction(transaction, {
      onSuccess: () => {
        setListingSuccess(true);
        setPrice('');
        setSelectedNft(null);
        // Hide success message after 5 seconds
        setTimeout(() => setListingSuccess(false), 5000);
      },
      onError: (error) => {
        console.error("Failed to create listing:", error);
      }
    });
  };

  const handleCreateAuction = async () => {
    if (!account) return;
    const marketplaceContract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS });
    const _params = {
      assetContract: createAuctionParams.assetContract,
      tokenId: BigInt(createAuctionParams.tokenId),
      quantity: BigInt(createAuctionParams.quantity),
      currency: createAuctionParams.currency,
      minimumBidAmount: BigInt(toWei(createAuctionParams.minimumBidAmount)),
      buyoutBidAmount: BigInt(toWei(createAuctionParams.buyoutBidAmount)),
      timeBufferInSeconds: BigInt(createAuctionParams.timeBufferInSeconds),
      bidBufferBps: BigInt(createAuctionParams.bidBufferBps),
      startTimestamp: BigInt(createAuctionParams.startTimestamp),
      endTimestamp: BigInt(createAuctionParams.endTimestamp),
    };
    const transaction = await prepareContractCall({
      contract: marketplaceContract,
      method: "function createAuction((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 minimumBidAmount, uint256 buyoutBidAmount, uint64 timeBufferInSeconds, uint64 bidBufferBps, uint64 startTimestamp, uint64 endTimestamp) _params) returns (uint256 auctionId)",
      params: [_params],
    });
    sendTransaction(transaction);
  };

  if (!account) {
    return <div className="text-center text-gray-400 py-8">Please connect your wallet to list an Eko.</div>;
  }

  const showAdminFeatures = account?.address === ADMIN_WALLET;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">List your Eko</h2>
      {showAdminFeatures && (
        <div className="mb-4">
          <label className="mr-4"><input type="radio" value="direct" checked={listingType === 'direct'} onChange={() => setListingType('direct')} className="mr-2"/>Direct Listing</label>
          <label><input type="radio" value="auction" checked={listingType === 'auction'} onChange={() => setListingType('auction')} className="mr-2"/>Auction</label>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">1. Select an Eko from your collection</h3>
        {loadingNfts ? (
          <div>
            <p>Loading your NFTs... this may take several minutes.</p>
            <p className="text-sm text-gray-400 mt-1">Elapsed time: {elapsedTime} seconds</p>
          </div>
        ) : fetchError ? (
          <p className="text-red-400">{fetchError}</p>
        ) : ownedNfts.length === 0 ? (
          <p>You don't own any Ekos to list.</p>
        ) : (
          <div>
            <div className="mb-4">
              <label htmlFor="nft-select" className="block text-sm font-medium text-gray-300 mb-1">
                Or select from dropdown:
              </label>
              <select 
                id="nft-select"
                value={selectedNft ? selectedNft.id.toString() : ""}
                onChange={handleDropdownChange}
                className="w-full max-w-md px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">-- Select an Eko --</option>
                {ownedNfts.map(nft => (
                  <option key={nft.id.toString()} value={nft.id.toString()}>
                    {nft.metadata.name} (ID: {nft.id.toString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ownedNfts.map(nft => (
                <div key={nft.id.toString()} className={`p-2 rounded-lg cursor-pointer border-2 ${selectedNft?.id === nft.id ? 'border-cyan-500' : 'border-transparent'}`} onClick={() => setSelectedNft(nft)}>
                  <MediaRenderer client={client} src={nft.metadata.image} className="w-full h-auto rounded-md aspect-square" />
                  <p className="text-center mt-2 text-sm truncate">{nft.metadata.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedNft && listingType === 'direct' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">2. Set your Price in POL (MATIC)</h3>
          <div className="max-w-xs">
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 10" className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
            {usdPrice && <p className="text-sm text-gray-400 mt-1">~ ${usdPrice} USD</p>}
          </div>
          <div className="mt-8">
            <button onClick={handleList} disabled={isPending || !price} className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold shadow-md hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? 'Listing...' : 'Create Listing'}
            </button>
          </div>
        </div>
      )}
      {selectedNft && showAdminFeatures && listingType === 'auction' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">2. Set Auction Parameters (in MATIC)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="minimumBidAmount" placeholder="Minimum Bid (e.g., 5)" value={createAuctionParams.minimumBidAmount} onChange={handleCreateAuctionChange} className="input-class" />
            <input type="text" name="buyoutBidAmount" placeholder="Buyout Bid (e.g., 20)" value={createAuctionParams.buyoutBidAmount} onChange={handleCreateAuctionChange} className="input-class" />
          </div>
          <div className="mt-8">
            <button onClick={handleCreateAuction} disabled={isPending || !createAuctionParams.minimumBidAmount || !createAuctionParams.buyoutBidAmount} className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold shadow-md hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? 'Creating Auction...' : 'Create Auction'}
            </button>
          </div>
        </div>
      )}
      {listingSuccess && (
        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <div className="text-green-400 font-semibold text-lg">✅ Success!</div>
          <div className="text-green-300 mt-1">Your Eko has been successfully listed on the marketplace!</div>
        </div>
      )}
    </div>
  );
};

export default ListEko; 