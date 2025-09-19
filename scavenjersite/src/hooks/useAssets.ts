import { useState, useEffect } from 'react';
import { getNFTContract } from '../config/thirdweb';

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

export function useAssets() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchUserAssets() {
    setNfts([]);
    try {
      console.log('Initiating asset fetch');
      setIsLoading(true);
      const nftContract = await getNFTContract();
      const ownedNFTs: any[] = await nftContract.erc721.getOwned();
      console.log('Raw NFT response:', ownedNFTs);
      if (!ownedNFTs || ownedNFTs.length === 0) {
        console.log('No NFTs found');
        setNfts([]);
        return;
      }
      setNfts(ownedNFTs);
    } catch (err) {
      setError('Failed to fetch assets');
      console.error('Asset fetch failed:', {
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Only fetch assets on mount or when needed
    console.log('Initiating asset fetch');
    fetchUserAssets();
  }, []);

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchUserAssets,
  };
}