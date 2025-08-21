import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { createThirdwebClient } from 'thirdweb';
import { polygon } from 'thirdweb/chains';

const THIRDWEB_CLIENT_ID = "dc56b7276133338ec60eebc93d1c38b1";
const NFT_COLLECTION_ADDRESS = "0x45a5A7F0c407F8178B138C74906bed90414fC923"; // Correct NFT collection address

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

export function useEkoOwnership() {
  const account = useActiveAccount();
  const [ownsEko, setOwnsEko] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    async function checkOwnership() {
      if (!account?.address) {
        setOwnsEko(false);
        setLoading(false);
        setError(null);
        return;
      }

      console.log('🔍 Starting Eko verification for wallet:', account.address);
      console.log('📄 Using NFT Collection Address:', NFT_COLLECTION_ADDRESS);
      console.log('🌐 Using Polygon network');

      try {
        setLoading(true);
        setError(null);

        const collectionContract = getContract({
          client,
          chain: polygon,
          address: NFT_COLLECTION_ADDRESS,
        });

        console.log('📝 Contract instance created successfully');

        const ownedNFTs = await getOwnedNFTs({
          contract: collectionContract,
          owner: account.address,
        });

        console.log('✅ getOwnedNFTs call successful, found:', ownedNFTs.length, 'NFTs');
        console.log('📊 NFT Details:', ownedNFTs.map(nft => ({ 
          id: nft.id, 
          tokenId: nft.metadata?.id || 'unknown'
        })));

        const count = ownedNFTs.length;
        setTokenCount(count);
        setOwnsEko(count > 0);
        
        if (count === 0) {
          setError('No Eko NFTs found in your wallet. Make sure you own at least one Eko from the official collection.');
        }
      } catch (err) {
        console.error('❌ Error verifying NFT ownership:', err);
        console.error('🔗 Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          wallet: account.address,
          contract: NFT_COLLECTION_ADDRESS,
          chain: 'polygon'
        });
        
        setError(`Failed to verify Eko ownership: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setOwnsEko(false);
      } finally {
        setLoading(false);
      }
    }

    checkOwnership();
  }, [account?.address]);

  return {
    ownsEko,
    loading,
    error,
    tokenCount,
    walletAddress: account?.address
  };
}
