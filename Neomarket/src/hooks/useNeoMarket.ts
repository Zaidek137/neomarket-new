import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient, getContract, readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { CONTRACT_ADDRESS } from '../config/constants';
import { EnrichedListing, EnrichedAuction } from '../types/marketplace';

const THIRDWEB_CLIENT_ID = "dc56b7276133338ec60eebc93d1c38b1";
const POLYGON_CHAIN = defineChain(137);

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

export function useNeoMarket() {
  const account = useActiveAccount();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [auctions, setAuctions] = useState<EnrichedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const marketplaceContract = getContract({
    client,
    chain: POLYGON_CHAIN,
    address: CONTRACT_ADDRESS
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically fetch from your existing marketplace contract
      // For now, we'll return mock data that matches your existing structure
      const mockListings: EnrichedListing[] = Array.from({ length: 20 }, (_, i) => ({
        id: (i + 1).toString(),
        tokenId: (1000 + i).toString(),
        price: (Math.random() * 2 + 0.1).toFixed(3),
        currency: 'MATIC',
        seller: account?.address || '0x...',
        metadata: {
          name: `Eko #${1000 + i}`,
          description: 'A unique digital collectible from The Scavenjers collection',
          image: `https://picsum.photos/400/400?random=${i}`,
          attributes: [
            { trait_type: 'Background', value: 'Cyber' },
            { trait_type: 'Eyes', value: 'Neon' },
            { trait_type: 'Rarity', value: 'Common' }
          ]
        },
        listingType: 'direct',
        status: 'active',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setListings(mockListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    try {
      // Mock auction data
      const mockAuctions: EnrichedAuction[] = Array.from({ length: 5 }, (_, i) => ({
        id: (i + 1).toString(),
        tokenId: (2000 + i).toString(),
        startingPrice: (Math.random() * 1 + 0.5).toFixed(3),
        currentBid: (Math.random() * 2 + 1).toFixed(3),
        currency: 'MATIC',
        seller: account?.address || '0x...',
        highestBidder: '0x...',
        metadata: {
          name: `Rare Eko #${2000 + i}`,
          description: 'A rare digital collectible up for auction',
          image: `https://picsum.photos/400/400?random=${i + 100}`,
          attributes: [
            { trait_type: 'Background', value: 'Legendary' },
            { trait_type: 'Eyes', value: 'Diamond' },
            { trait_type: 'Rarity', value: 'Rare' }
          ]
        },
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        bidCount: Math.floor(Math.random() * 20) + 1
      }));

      setAuctions(mockAuctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchAuctions();
  }, [account?.address]);

  return {
    listings,
    auctions,
    loading,
    error,
    refetch: () => {
      fetchListings();
      fetchAuctions();
    },
    contract: marketplaceContract
  };
}
