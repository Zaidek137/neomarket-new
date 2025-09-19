import { useState, useEffect } from 'react';
import { contractIntegration } from '../utils/contractIntegration';
import { useWallet } from './useWallet';
import { logger } from '../utils/logger';

export interface NFT {
  id: string;
  name: string;
  image: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export function useNFTCollection() {
  const { address, isConnected } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !isConnected) {
        setNfts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Initialize contract if needed
        const initialized = await contractIntegration.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize contract');
        }

        // Fetch NFTs
        const ownedNFTs = await contractIntegration.getNFTsForAddress(address);
        
        // Transform the data
        const transformedNFTs = ownedNFTs.map(nft => ({
          id: nft.metadata.id,
          name: nft.metadata.name || `NFT #${nft.metadata.id}`,
          image: nft.metadata.image || '',
          description: nft.metadata.description || '',
          attributes: nft.metadata.attributes || []
        }));

        setNfts(transformedNFTs);
        logger.info('contract', 'NFTs fetched successfully', {
          address,
          count: transformedNFTs.length
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs';
        logger.error('contract', 'Error fetching NFTs', err);
        setError(errorMessage);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, isConnected]);

  return { nfts, loading, error };
}