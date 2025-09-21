import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { getOwnedNFTs, balanceOf } from 'thirdweb/extensions/erc721';
import { createThirdwebClient } from 'thirdweb';
import { polygon } from 'thirdweb/chains';

const THIRDWEB_CLIENT_ID = "dc56b7276133338ec60eebc93d1c38b1";
const NFT_COLLECTION_ADDRESS = "0x98E52EF271F0ff90F2f76A40Cb6A27dA011d279F"; // Correct NFT collection address

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

export function useEkoOwnership() {
  const account = useActiveAccount();
  const [ownsEko, setOwnsEko] = useState(false);
  const [loading, setLoading] = useState(false); // Changed to false - no auto loading
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [needsManualCheck, setNeedsManualCheck] = useState(true);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);

  // Manual check function
  const checkOwnership = async () => {
    if (!account?.address) {
      setOwnsEko(false);
      setLoading(false);
      setError(null);
      setNeedsManualCheck(true);
      return;
    }

      console.log('🔍 [useEkoOwnership] Starting Eko verification for wallet:', account.address);
      console.log('📄 [useEkoOwnership] Using NFT Collection Address:', NFT_COLLECTION_ADDRESS);
      console.log('🌐 [useEkoOwnership] Using Polygon network');

      try {
        setLoading(true);
        setError(null);

        const collectionContract = getContract({
          client,
          chain: polygon,
          address: NFT_COLLECTION_ADDRESS,
        });

        console.log('📝 Contract instance created successfully');

        // Try Thirdweb indexer first
        let ownedNFTs;
        let usingManualScan = false;
        
        try {
          console.log('🔄 [useEkoOwnership] Trying Thirdweb indexer...');
          ownedNFTs = await getOwnedNFTs({
            contract: collectionContract,
            owner: account.address,
          });
          
          console.log('✅ [useEkoOwnership] Thirdweb indexer returned:', ownedNFTs.length, 'NFTs');
          
          // If Thirdweb returns 0, try manual balance check
          if (ownedNFTs.length === 0) {
            console.log('🔄 [useEkoOwnership] Trying manual balance check...');
            
            const balance = await balanceOf({
              contract: collectionContract,
              owner: account.address,
            });
            
            const balanceNum = Number(balance);
            console.log(`📊 [useEkoOwnership] Manual balance check: ${balanceNum} NFTs`);
            
            if (balanceNum > 0) {
              console.log(`🎉 [useEkoOwnership] Manual balance found ${balanceNum} NFTs! Thirdweb indexer is behind.`);
              usingManualScan = true;
              
              // Create dummy NFT objects for count purposes
              ownedNFTs = Array.from({ length: balanceNum }, (_, i) => ({
                id: BigInt(i),
                tokenAddress: NFT_COLLECTION_ADDRESS,
                owner: account.address,
                metadata: { name: `Eko #${i}` }
              }));
            }
          }
        } catch (indexError) {
          console.warn('⚠️ [useEkoOwnership] Thirdweb indexer failed:', indexError);
          console.log('🔄 [useEkoOwnership] Falling back to manual balance check...');
          
          try {
            const balance = await balanceOf({
              contract: collectionContract,
              owner: account.address,
            });
            
            const balanceNum = Number(balance);
            console.log(`📊 [useEkoOwnership] Manual fallback balance: ${balanceNum} NFTs`);
            
            if (balanceNum > 0) {
              usingManualScan = true;
              ownedNFTs = Array.from({ length: balanceNum }, (_, i) => ({
                id: BigInt(i),
                tokenAddress: NFT_COLLECTION_ADDRESS,
                owner: account.address,
                metadata: { name: `Eko #${i}` }
              }));
            } else {
              ownedNFTs = [];
            }
          } catch (balanceError) {
            console.error('❌ [useEkoOwnership] Manual balance check also failed:', balanceError);
            ownedNFTs = [];
          }
        }

        console.log('📊 [useEkoOwnership] Final NFT Details:', ownedNFTs.map(nft => ({ 
          id: nft.id?.toString(), 
          tokenAddress: nft.tokenAddress,
          owner: nft.owner,
          tokenId: nft.metadata?.id || 'unknown',
          usingManualScan
        })));

        const count = ownedNFTs.length;
        setTokenCount(count);
        setOwnsEko(count > 0);
        
        // Cache the ownership result
        if (account?.address) {
          const ownershipCacheKey = `eko_ownership_result_${account.address.toLowerCase()}`;
          const cacheData = {
            ownsEko: count > 0,
            tokenCount: count,
            timestamp: Date.now()
          };
          localStorage.setItem(ownershipCacheKey, JSON.stringify(cacheData));
          console.log(`💾 [useEkoOwnership] Cached ownership result: ${count > 0 ? 'OWNS' : 'DOES NOT OWN'} Eko`);
        }
        
        if (count === 0) {
          setError('No Eko NFTs found in your wallet. Make sure you own at least one Eko from the official collection.');
        } else {
          setNeedsManualCheck(false);
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
    };

  // Auto-check on first visit, reset when wallet changes
  useEffect(() => {
    if (account?.address) {
      setNeedsManualCheck(true);
      setOwnsEko(false);
      setError(null);
      
      // Auto-check on first visit for this wallet
      const cacheKey = `eko_ownership_${account.address.toLowerCase()}`;
      const hasChecked = localStorage.getItem(cacheKey);
      
      if (!hasChecked && !hasAutoChecked) {
        console.log('🚀 [useEkoOwnership] First visit detected - auto-checking ownership...');
        setHasAutoChecked(true);
        localStorage.setItem(cacheKey, 'checked');
        // Use setTimeout to ensure state is properly set
        setTimeout(() => {
          checkOwnership();
        }, 100);
      } else if (hasChecked) {
        // If we've checked before, try to load cached ownership status
        const ownershipCacheKey = `eko_ownership_result_${account.address.toLowerCase()}`;
        const cachedResult = localStorage.getItem(ownershipCacheKey);
        if (cachedResult) {
          try {
            const { ownsEko: cachedOwnsEko, tokenCount: cachedTokenCount } = JSON.parse(cachedResult);
            setOwnsEko(cachedOwnsEko);
            setTokenCount(cachedTokenCount);
            setNeedsManualCheck(false);
            console.log(`📦 [useEkoOwnership] Loaded cached ownership: ${cachedOwnsEko ? 'OWNS' : 'DOES NOT OWN'} Eko`);
          } catch (error) {
            console.warn('⚠️ [useEkoOwnership] Error loading cached ownership:', error);
          }
        }
      }
    } else {
      setHasAutoChecked(false);
    }
  }, [account?.address]);

  return {
    ownsEko,
    loading,
    error,
    tokenCount,
    needsManualCheck,
    checkOwnership,
    walletAddress: account?.address
  };
}
