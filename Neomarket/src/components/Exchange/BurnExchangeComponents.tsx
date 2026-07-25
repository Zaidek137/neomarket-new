import React, { useState, useEffect } from 'react';
import { Flame, X, DollarSign, User, Mail, Phone, MapPin, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MediaRenderer } from 'thirdweb/react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS, SERVER_WALLET_ADDRESS } from '../../config/constants';
import { rewardsService } from '../../services/rewardsService';
import { AdminExchangeLogsModal } from './AdminExchangeLogsModal';

export interface BurnReward {
  id?: string; // ID from database
  collectionAddress: string;
  tokenId?: string; // Optional for specific token requirements
  usdtAmount: number;
  type: 'usdt' | 'custom';
  customReward?: {
    title: string;
    description: string;
    image: string;
    requiresInfo: boolean;
  };
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Burn and Exchange Modal Component
export function BurnExchangeModal({ 
  isOpen, 
  onClose, 
  burnRewards, 
  onRewardSelect, 
  account, 
  client, 
  sendTransaction, 
  isPending 
}: {
  isOpen: boolean;
  onClose: () => void;
  burnRewards: BurnReward[];
  onRewardSelect: (reward: BurnReward, nft?: any) => void;
  account: any;
  client: any;
  sendTransaction: any;
  isPending: boolean;
}) {
  const [ownedNfts, setOwnedNfts] = useState<any[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [refreshingNfts, setRefreshingNfts] = useState(false);
  const [lastNftRefresh, setLastNftRefresh] = useState<Date | null>(null);
  const [selectedNft, setSelectedNft] = useState<any | null>(null);
  const [eligibleNfts, setEligibleNfts] = useState<Array<{nft: any, reward: BurnReward}>>([]);

  useEffect(() => {
    if (isOpen && account) {
      fetchOwnedNFTs();
    }
  }, [isOpen, account, burnRewards]); // Re-fetch when rewards change

  // Helper function to fetch NFT metadata
  const fetchNFTMetadata = async (contract: any, tokenId: bigint) => {
    console.log(`🖼️ Fetching metadata for token ${tokenId.toString()}...`);
    try {
      const tokenURI = await readContract({
        contract,
        method: "function tokenURI(uint256 tokenId) view returns (string)",
        params: [tokenId]
      });
      console.log(`📄 Token URI for ${tokenId.toString()}:`, tokenURI);
      
      // Default metadata
      let metadata = {
        name: `NFT #${tokenId.toString()}`,
        image: null,
        description: null,
        attributes: []
      };
      
      if (tokenURI) {
        try {
          // Handle IPFS URIs
          let fetchUrl = tokenURI;
          if (tokenURI.startsWith('ipfs://')) {
            fetchUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
          
          console.log(`🌐 Fetching metadata from: ${fetchUrl}`);
          const metadataResponse = await fetch(fetchUrl);
          if (metadataResponse.ok) {
            const metadataJson = await metadataResponse.json();
            console.log(`✅ Metadata fetched for token ${tokenId.toString()}:`, metadataJson);
            
            metadata = {
              name: metadataJson.name || `NFT #${tokenId.toString()}`,
              image: metadataJson.image || null,
              description: metadataJson.description || null,
              attributes: metadataJson.attributes || []
            };
            
            // Handle IPFS image URLs
            if (metadata.image && metadata.image.startsWith('ipfs://')) {
              metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
          } else {
            console.log(`⚠️ Failed to fetch metadata from ${fetchUrl}: ${metadataResponse.status}`);
          }
        } catch (fetchError) {
          console.log(`⚠️ Error fetching metadata from URI:`, fetchError);
        }
      }
      
      return metadata;
    } catch (metadataError) {
      console.log(`⚠️ Could not get tokenURI for token ${tokenId.toString()}:`, metadataError);
      return {
        name: `NFT #${tokenId.toString()}`,
        image: null,
        description: null,
        attributes: []
      };
    }
  };

  const fetchOwnedNFTs = async (forceRefresh = false) => {
    if (!account) return;
    
    const isManualRefresh = forceRefresh;
    if (isManualRefresh) {
      setRefreshingNfts(true);
    } else {
      setLoadingNfts(true);
    }

    try {
      console.log('🔍 === NFT VERIFICATION DEBUG START ===');
      console.log('👤 User wallet address:', account.address);
      
      // Fetch burn rewards directly from Supabase
      console.log('📋 Fetching rewards from Supabase...');
      const serverRewards = await rewardsService.getBurnRewards();
      console.log('📋 Server rewards found:', serverRewards);
      console.log('📋 Number of rewards:', serverRewards.length);
      
      // Get unique collection addresses from rewards
      const collectionAddresses = [...new Set(serverRewards.map((reward: BurnReward) => reward.collectionAddress))];
      console.log('🏪 Collection addresses to check:', collectionAddresses);
      
      let allNfts: any[] = [];
      
      // Fetch NFTs from each collection and verify current ownership
      for (const collectionAddress of collectionAddresses) {
        console.log(`\n🔍 Checking collection: ${collectionAddress}`);
        try {
          const contract = getContract({
            client,
            chain: polygon,
            address: collectionAddress,
          });
          console.log('📄 Contract created successfully');

          console.log(`👤 Fetching NFTs owned by ${account.address} from ${collectionAddress}...`);
          
          // Try Thirdweb's getOwnedNFTs first
          let nfts = await getOwnedNFTs({
            contract,
            owner: account.address,
          });
          console.log(`📊 Thirdweb getOwnedNFTs returned ${nfts.length} NFTs:`, nfts.map(n => ({ id: n.id?.toString(), name: n.metadata?.name })));
          
          // If Thirdweb returns 0 NFTs, try a manual approach
          if (nfts.length === 0) {
            console.log(`🔄 Thirdweb returned 0 NFTs, trying manual balance check...`);
            try {
              // Check if user has any balance in this collection
              const balance = await readContract({
                contract,
                method: "function balanceOf(address owner) view returns (uint256)",
                params: [account.address]
              });
              console.log(`📊 Manual balance check: ${balance.toString()} NFTs`);
              
              if (balance > 0) {
                console.log(`🔍 User has ${balance.toString()} NFTs but Thirdweb didn't find them. This is a Thirdweb indexing issue.`);
                console.log(`💡 Trying to get token by index...`);
                
                // Try multiple approaches to find the tokens
                const manualNfts = [];
                const balanceNum = Number(balance);
                
                // Method 1: Try tokenOfOwnerByIndex (ERC721Enumerable)
                console.log(`🔍 Method 1: Trying tokenOfOwnerByIndex...`);
                let foundWithIndex = false;
                for (let i = 0; i < Math.min(balanceNum, 10); i++) {
                  try {
                    const tokenId = await readContract({
                      contract,
                      method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                      params: [account.address, BigInt(i)]
                    });
                    console.log(`📍 Found token at index ${i}: ${tokenId.toString()}`);
                    foundWithIndex = true;
                    
                    const metadata = await fetchNFTMetadata(contract, tokenId);
                    const manualNft = {
                      id: tokenId,
                      metadata: metadata
                    };
                    manualNfts.push(manualNft);
                  } catch (indexError) {
                    console.log(`❌ tokenOfOwnerByIndex failed at index ${i}:`, indexError.message);
                    break;
                  }
                }
                
                // Method 2: If enumerable failed, try scanning recent token IDs
                if (!foundWithIndex && manualNfts.length === 0) {
                  console.log(`🔍 Method 2: Contract doesn't support enumerable, trying token ID scan...`);
                  
                  // Get total supply to know the range
                  try {
                    const totalSupply = await readContract({
                      contract,
                      method: "function totalSupply() view returns (uint256)",
                      params: []
                    });
                    console.log(`📊 Total supply: ${totalSupply.toString()}`);
                    
                    // Scan backwards from total supply (most recent tokens)
                    const maxScan = Math.min(Number(totalSupply), 100); // Don't scan more than 100
                    let found = 0;
                    
                    for (let tokenId = Number(totalSupply) - 1; tokenId >= 0 && found < balanceNum; tokenId--) {
                      try {
                        const owner = await readContract({
                          contract,
                          method: "function ownerOf(uint256 tokenId) view returns (address)",
                          params: [BigInt(tokenId)]
                        });
                        
                        if (owner.toLowerCase() === account.address.toLowerCase()) {
                          console.log(`📍 Found owned token: ${tokenId}`);
                          const metadata = await fetchNFTMetadata(contract, BigInt(tokenId));
                          const manualNft = {
                            id: BigInt(tokenId),
                            metadata: metadata
                          };
                          manualNfts.push(manualNft);
                          found++;
                        }
                      } catch (ownerError) {
                        // Token might not exist, continue scanning
                        continue;
                      }
                      
                      // Stop if we've scanned too many
                      if (Number(totalSupply) - tokenId > maxScan) {
                        console.log(`⚠️ Stopped scanning after ${maxScan} tokens to avoid timeout`);
                        break;
                      }
                    }
                  } catch (supplyError) {
                    console.log(`❌ Could not get totalSupply:`, supplyError.message);
                    
                    // Method 3: Last resort - try common token ID ranges
                    console.log(`🔍 Method 3: Trying common token ID ranges...`);
                    const commonRanges = [
                      [1, 50],     // 1-50
                      [0, 50],     // 0-50  
                      [1000, 1100], // 1000-1100
                      [10000, 10100] // 10000-10100
                    ];
                    
                    for (const [start, end] of commonRanges) {
                      if (manualNfts.length >= balanceNum) break;
                      
                      console.log(`🔍 Scanning range ${start}-${end}...`);
                      for (let tokenId = start; tokenId <= end && manualNfts.length < balanceNum; tokenId++) {
                        try {
                          const owner = await readContract({
                            contract,
                            method: "function ownerOf(uint256 tokenId) view returns (address)",
                            params: [BigInt(tokenId)]
                          });
                          
                          if (owner.toLowerCase() === account.address.toLowerCase()) {
                            console.log(`📍 Found owned token in range: ${tokenId}`);
                            const metadata = await fetchNFTMetadata(contract, BigInt(tokenId));
                            const manualNft = {
                              id: BigInt(tokenId),
                              metadata: metadata
                            };
                            manualNfts.push(manualNft);
                          }
                        } catch (ownerError) {
                          // Token doesn't exist, continue
                          continue;
                        }
                      }
                    }
                  }
                }
                
                if (manualNfts.length > 0) {
                  console.log(`🎉 Manually found ${manualNfts.length} NFTs:`, manualNfts);
                  nfts = manualNfts;
                }
              } else {
                console.log(`✅ Manual balance check confirms 0 NFTs - user doesn't own any in this collection`);
              }
            } catch (balanceError) {
              console.log(`❌ Manual balance check failed:`, balanceError);
              console.log(`💡 This might be a non-standard NFT contract or network issue`);
            }
          }
          
          console.log(`✅ Final NFT count: ${nfts.length} NFTs in collection ${collectionAddress}:`, nfts.map(n => ({ id: n.id?.toString(), name: n.metadata?.name })));

          // Verify each NFT is still owned by the user (not cached data)
          const verifiedNfts = [];
          for (const nft of nfts) {
            console.log(`🔍 Verifying ownership of NFT ${nft.id}...`);
            try {
              const currentOwner = await readContract({
                contract,
                method: "function ownerOf(uint256 tokenId) view returns (address)",
                params: [BigInt(nft.id)]
              });
              console.log(`👤 NFT ${nft.id} current owner: ${currentOwner}`);
              console.log(`👤 User address: ${account.address}`);
              console.log(`✅ Ownership match: ${currentOwner.toLowerCase() === account.address.toLowerCase()}`);

              // Only include NFTs that are actually still owned by the user
              if (currentOwner.toLowerCase() === account.address.toLowerCase()) {
                verifiedNfts.push({
                  ...nft,
                  collectionAddress
                });
                console.log(`✅ NFT ${nft.id} verified and added to list`);
              } else {
                console.log(`🔄 NFT ${nft.id} no longer owned by user (current owner: ${currentOwner})`);
              }
            } catch (ownerError) {
              console.error(`❌ Error verifying ownership of NFT ${nft.id}:`, ownerError);
              // Skip this NFT if we can't verify ownership
            }
          }

          console.log(`✅ Verified ${verifiedNfts.length} NFTs from collection ${collectionAddress}`);
          allNfts = [...allNfts, ...verifiedNfts];
        } catch (error) {
          console.error(`❌ Error fetching NFTs from collection ${collectionAddress}:`, error);
        }
      }

      console.log(`\n📊 TOTAL VERIFIED NFTs: ${allNfts.length}`);
      console.log('📊 All verified NFTs:', allNfts.map(n => ({ 
        id: n.id?.toString(), 
        collection: n.collectionAddress,
        name: n.metadata?.name 
      })));
      setOwnedNfts(allNfts);

      // Check eligibility for each NFT directly with Supabase
      console.log('\n🎯 Checking eligibility for each NFT...');
      const eligibleNftsPromises = allNfts.map(async (nft) => {
        console.log(`🔍 Checking eligibility for NFT ${nft.id} from collection ${nft.collectionAddress}...`);
        try {
          const reward = await rewardsService.findRewardByCollection(
            nft.collectionAddress,
            nft.id?.toString()
          );
          console.log(`🎯 Reward found for NFT ${nft.id}:`, reward ? 'YES' : 'NO');
          if (reward) {
            console.log(`🎯 Reward details:`, reward);
          }
          
          if (reward) {
            return { nft, reward };
          }
          return null;
        } catch (error) {
          console.error(`❌ Error checking eligibility for NFT ${nft.id}:`, error);
          return null;
        }
      });

      const eligibleResults = await Promise.all(eligibleNftsPromises);
      const eligible = eligibleResults.filter(Boolean) as Array<{nft: any, reward: BurnReward}>;
      
      console.log(`\n🎉 FINAL RESULTS:`);
      console.log(`🎉 Total eligible NFTs: ${eligible.length}`);
      console.log('🎉 Eligible NFTs:', eligible.map(e => ({ 
        nftId: e.nft.id?.toString(), 
        collection: e.nft.collectionAddress,
        rewardAmount: e.reward.usdtAmount,
        rewardType: e.reward.type
      })));
      
      setEligibleNfts(eligible);
      setLastNftRefresh(new Date());
      console.log('🔍 === NFT VERIFICATION DEBUG END ===\n');
    } catch (error) {
      console.error('❌ Error fetching owned NFTs:', error);
    } finally {
      setLoadingNfts(false);
      setRefreshingNfts(false);
    }
  };

  const handleBurnNft = async (nft: any, reward: BurnReward) => {
    if (!nft || !account) return;

    try {
      // For custom rewards that require user info, trigger the user info modal
      if (reward.type === 'custom' && reward.customReward?.requiresInfo) {
        setSelectedNft(nft);
        onRewardSelect(reward, nft);
        return;
      }

      // Use hardcoded server wallet address (serverless approach)
      const serverWalletAddress = SERVER_WALLET_ADDRESS;
      console.log('📡 Using server wallet address:', serverWalletAddress);

      // Step 1: Verify NFT ownership before transfer
      const nftContract = getContract({
        client,
        chain: polygon,
        address: nft.collectionAddress,
      });

      // Check current owner of the NFT
      console.log('🔍 Verifying NFT ownership...');
      try {
        const currentOwner = await readContract({
          contract: nftContract,
          method: "function ownerOf(uint256 tokenId) view returns (address)",
          params: [BigInt(nft.id)]
        });
        
        console.log('📋 NFT Ownership check:', {
          tokenId: nft.id.toString(),
          currentOwner: currentOwner,
          yourWallet: account.address,
          isOwner: currentOwner.toLowerCase() === account.address.toLowerCase()
        });

        if (currentOwner.toLowerCase() !== account.address.toLowerCase()) {
          throw new Error(`You don't own this NFT. Current owner: ${currentOwner}, Your wallet: ${account.address}`);
        }
      } catch (ownerError) {
        console.error('❌ Error checking NFT ownership:', ownerError);
        throw new Error(`Failed to verify NFT ownership: ${ownerError.message}`);
      }

      const transferTx = prepareContractCall({
        contract: nftContract,
        method: "function transferFrom(address from, address to, uint256 tokenId)",
        params: [account.address, serverWalletAddress, BigInt(nft.id)]
      });

      console.log('📋 Transaction details:', {
        from: account.address,
        to: serverWalletAddress,
        tokenId: nft.id.toString(),
        collectionAddress: nft.collectionAddress,
        method: "transferFrom"
      });

      console.log('🔄 Sending transfer transaction...');
      
      // Use sendTransaction as a Promise-based function in Thirdweb v5
      const transferResult = await new Promise((resolve, reject) => {
        sendTransaction(transferTx, {
          onSuccess: (result: any) => {
            console.log('✅ Transaction successful:', result);
            resolve(result);
          },
          onError: (error: any) => {
            console.error('❌ Transaction failed:', error);
            console.error('❌ Error details:', {
              message: error?.message,
              code: error?.code,
              reason: error?.reason,
              data: error?.data,
              stack: error?.stack
            });
            reject(error);
          }
        });
      });
      
      console.log('✅ Transfer transaction result:', transferResult);
      console.log('🔍 Transfer result type:', typeof transferResult);
      console.log('🔍 Transfer result keys:', transferResult ? Object.keys(transferResult) : 'null/undefined');

      // Wait a bit for transaction to be confirmed on the blockchain
      console.log('⏳ Waiting for transaction confirmation...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      // Verify the NFT was actually transferred
      console.log('🔍 Verifying NFT transfer to server wallet...');
      try {
        const currentOwner = await readContract({
          contract: nftContract,
          method: "function ownerOf(uint256 tokenId) view returns (address)",
          params: [BigInt(nft.id)]
        });
        
        console.log('📋 Post-transfer ownership check:', {
          tokenId: nft.id.toString(),
          currentOwner: currentOwner,
          serverWallet: serverWalletAddress,
          transferredSuccessfully: currentOwner.toLowerCase() === serverWalletAddress.toLowerCase()
        });

        if (currentOwner.toLowerCase() !== serverWalletAddress.toLowerCase()) {
          throw new Error(`NFT transfer failed. Current owner: ${currentOwner}, Expected: ${serverWalletAddress}`);
        }
      } catch (verifyError) {
        console.error('❌ Error verifying transfer:', verifyError);
        throw new Error(`Failed to verify NFT transfer: ${verifyError.message}`);
      }

      // Step 2: Log the exchange event directly to Supabase
      console.log('📤 Logging exchange event to database...');
      
      await rewardsService.logExchange({
        userWalletAddress: account.address,
        collectionAddress: nft.collectionAddress,
        tokenId: nft.id.toString(),
        reward: reward,
        userInfo: null, // Will be set by UserInfoModal if needed
        transferTransactionHash: transferResult?.transactionHash
      }, account);

      console.log('✅ Exchange logged successfully');

      // Success message
      if (reward.type === 'usdt') {
        alert(`Exchange successful! Your request for ${reward.usdtAmount} USDT has been logged. You will receive your USDT reward shortly.`);
      } else {
        alert(`Exchange successful! Your ${reward.customReward?.title} reward request has been logged and will be processed.`);
      }

      // Refresh the NFT list to remove the transferred NFT from the display
      console.log('🔄 Refreshing NFT list after successful transfer...');
      await fetchOwnedNFTs();
      
      onClose();
    } catch (error) {
      console.error('Error processing exchange:', error);
      alert(`Failed to process exchange: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="text-orange-500" size={24} />
              Exchange Your Eko
            </h2>
            {lastNftRefresh && (
              <div className="text-xs text-slate-400">
                Updated: {lastNftRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOwnedNFTs(true)}
              disabled={refreshingNfts || loadingNfts}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded transition-all duration-200 disabled:opacity-50"
              title="Refresh: Use if you recently bought/minted Ekos or expect more to appear"
            >
              <span className={`w-3 h-3 ${refreshingNfts ? 'animate-spin' : ''}`}>🔄</span>
              {refreshingNfts ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {!account ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Please connect your wallet to exchange your Ekos</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 mb-4">Here are your Ekos that are eligible for rewards:</p>
            
            {/* RPC Usage Notice */}
            {!loadingNfts && !refreshingNfts && (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-sm">⚡</span>
                  <div className="text-xs">
                    <p className="text-blue-200 font-medium">Eko Detection Notice</p>
                    <div className="text-blue-300/80 mt-1 space-y-1">
                      <p>• Scans first 100-500 token IDs to optimize RPC usage</p>
                      <p>• If your Ekos don't appear, use the "Refresh" button</p>
                      <p>• Recently bought/minted Ekos may need manual refresh</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {loadingNfts ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-slate-400">Loading your eligible Ekos...</p>
              </div>
            ) : eligibleNfts.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 mb-4">
                  <p className="text-slate-400 mb-2">No eligible Ekos found in your wallet</p>
                  <p className="text-slate-500 text-sm">
                    {ownedNfts.length > 0 
                      ? `You own ${ownedNfts.length} Eko${ownedNfts.length === 1 ? '' : 's'}, but none are currently eligible for rewards.`
                      : "You don't own any Ekos yet."
                    }
                  </p>
                </div>
                {burnRewards.length === 0 && (
                  <p className="text-slate-500 text-xs">No rewards have been configured by admins yet.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eligibleNfts.map((item, index) => (
                  <div
                    key={`${item.nft.id}-${index}`}
                    className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    {/* NFT Display */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <MediaRenderer
                          client={client}
                          src={item.nft.metadata?.image}
                          alt={item.nft.metadata?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {item.nft.metadata?.name || `Eko #${item.nft.id}`}
                        </h3>
                        <p className="text-slate-400 text-sm">Token ID: {item.nft.id}</p>
                      </div>
                    </div>

                    {/* Reward Display */}
                    <div className="border-t border-slate-600/30 pt-4">
                      {item.reward.type === 'usdt' ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <DollarSign size={20} className="text-green-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">USDT Reward</p>
                              <p className="text-green-400 font-bold text-lg">${item.reward.usdtAmount} USDT</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBurnNft(item.nft, item.reward)}
                            disabled={isPending}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                          >
                            {isPending ? 'Burning...' : 'Burn & Claim'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            {item.reward.customReward?.image && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.reward.customReward.image}
                                  alt={item.reward.customReward.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{item.reward.customReward?.title}</h4>
                              <p className="text-slate-400 text-sm">{item.reward.customReward?.description}</p>
                              {item.reward.customReward?.requiresInfo && (
                                <p className="text-orange-400 text-xs mt-1">Requires contact information</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleBurnNft(item.nft, item.reward)}
                            disabled={isPending}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                          >
                            {isPending ? 'Processing...' : 'Exchange for Reward'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// User Info Modal Component
export function UserInfoModal({ 
  isOpen, 
  onClose, 
  userInfo, 
  onUserInfoChange, 
  reward, 
  selectedNft, 
  onSubmit,
  account,
  client,
  sendTransaction,
  isPending = false
}: {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  onUserInfoChange: (info: UserInfo) => void;
  reward: BurnReward;
  selectedNft: any;
  onSubmit: () => void;
  account?: any;
  client?: any;
  sendTransaction?: any;
  isPending?: boolean;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle serverless exchange with user info
    if (client && sendTransaction && selectedNft && account?.address) {
      try {
        // Use hardcoded server wallet address (serverless approach)
        const serverWalletAddress = SERVER_WALLET_ADDRESS;

        // Step 1: Transfer NFT to server wallet
        const nftContract = getContract({
          client,
          chain: polygon,
          address: selectedNft.collectionAddress,
        });

        const transferTx = prepareContractCall({
          contract: nftContract,
          method: "function transferFrom(address from, address to, uint256 tokenId)",
          params: [account.address, serverWalletAddress, BigInt(selectedNft.id)]
        });

        const transferResult = await new Promise((resolve, reject) => {
          sendTransaction(transferTx, {
            onSuccess: (result: any) => {
              console.log('✅ User info transaction successful:', result);
              resolve(result);
            },
            onError: (error: any) => {
              console.error('❌ User info transaction failed:', error);
              reject(error);
            }
          });
        });
        
        console.log('Transfer transaction sent:', transferResult);

        // Step 2: Log exchange event directly to Supabase with user info
        await rewardsService.logExchange({
          userWalletAddress: account.address,
          collectionAddress: selectedNft.collectionAddress,
          tokenId: selectedNft.id.toString(),
          reward: reward,
          userInfo: userInfo,
          transferTransactionHash: transferResult?.transactionHash
        }, account);
        
        alert(`Exchange successful! Your ${reward.customReward?.title} reward will be processed and sent to the provided contact information.`);
      } catch (error) {
        console.error('Error processing exchange:', error);
        alert(`Failed to process exchange: ${error.message}`);
        return;
      }
    }

    onSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-2">Selected Reward:</h3>
          <p className="text-orange-400">{reward.customReward?.title}</p>
          <p className="text-slate-400 text-sm">{reward.customReward?.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => onUserInfoChange({ ...userInfo, name: e.target.value })}
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => onUserInfoChange({ ...userInfo, email: e.target.value })}
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => onUserInfoChange({ ...userInfo, phone: e.target.value })}
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                value={userInfo.address}
                onChange={(e) => onUserInfoChange({ ...userInfo, address: e.target.value })}
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 resize-none"
                placeholder="Enter your address"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isPending ? 'Burning NFT...' : 'Submit & Burn NFT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Admin Panel Modal Component
export function AdminPanelModal({ 
  isOpen, 
  onClose, 
  burnRewards, 
  onRewardsUpdate,
  account
}: {
  isOpen: boolean;
  onClose: () => void;
  burnRewards: BurnReward[];
  onRewardsUpdate: (rewards: BurnReward[]) => void;
  account?: any;
}) {
  const [newReward, setNewReward] = useState<Partial<BurnReward>>({
    collectionAddress: '',
    tokenId: '',
    usdtAmount: 0,
    type: 'usdt'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExchangeLogs, setShowExchangeLogs] = useState(false);

  const handleAddReward = async () => {
    if (!newReward.collectionAddress || !newReward.usdtAmount) {
      alert('Please fill in Collection Address and USDT Amount');
      return;
    }

    try {
      const reward: BurnReward = {
        collectionAddress: newReward.collectionAddress!,
        tokenId: newReward.tokenId || undefined, // Optional specific token ID
        usdtAmount: newReward.usdtAmount!,
        type: newReward.type!,
        customReward: newReward.type === 'custom' ? newReward.customReward : undefined
      };

      if (!account?.address) {
        throw new Error('Connect an admin wallet to manage rewards.');
      }

      const savedReward = await rewardsService.addBurnReward(reward, account);

      // Update local state with the reward returned from Supabase (includes ID)
      onRewardsUpdate([...burnRewards, savedReward]);
      setNewReward({ collectionAddress: '', tokenId: '', usdtAmount: 0, type: 'usdt' });
      setShowAddForm(false);
      
      alert('Reward added successfully!');
    } catch (error) {
      console.error('Error adding reward:', error);
      alert(`Failed to add reward: ${error.message}`);
    }
  };

  const handleRemoveReward = async (index: number) => {
    const rewardToDelete = burnRewards[index];
    
    // For rewards that don't have an ID (old local rewards), just remove from local state
    if (!rewardToDelete.id) {
      const updatedRewards = burnRewards.filter((_, i) => i !== index);
      onRewardsUpdate(updatedRewards);
      return;
    }

    try {
      if (!account?.address) {
        throw new Error('Connect an admin wallet to manage rewards.');
      }

      await rewardsService.deleteBurnReward(rewardToDelete.id, account);

      // Update local state only after successful deletion
      const updatedRewards = burnRewards.filter((_, i) => i !== index);
      onRewardsUpdate(updatedRewards);
      
      alert('Reward deleted successfully!');
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert(`Failed to delete reward: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin Panel - Burn Rewards</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add New Reward
          </button>
          <button
            onClick={() => setShowExchangeLogs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Flame size={16} />
            View Exchange Logs
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Reward</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Collection Address *</label>
                    <input
                      type="text"
                      value={newReward.collectionAddress}
                      onChange={(e) => setNewReward({ ...newReward, collectionAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                      placeholder="0x1234567890123456789012345678901234567890"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Token ID (optional)</label>
                      <input
                        type="text"
                        value={newReward.tokenId}
                        onChange={(e) => setNewReward({ ...newReward, tokenId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                        placeholder="123 (leave empty for all tokens)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">USDT Amount *</label>
                      <input
                        type="number"
                        value={newReward.usdtAmount}
                        onChange={(e) => setNewReward({ ...newReward, usdtAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                        placeholder="10.00"
                      />
                    </div>
                  </div>
                </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReward}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Add Reward
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Current Rewards</h3>
          {burnRewards.length === 0 ? (
            <p className="text-slate-400">No rewards configured</p>
          ) : (
                    burnRewards.map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">
                            ${reward.usdtAmount} USDT
                            {reward.tokenId && ` | Token ID: ${reward.tokenId}`}
                          </p>
                          <p className="text-slate-400 text-sm truncate">
                            Collection: {reward.collectionAddress}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Type: {reward.type} | Scope: {reward.tokenId ? 'Specific Token' : 'All Tokens'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveReward(index)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex-shrink-0 ml-3"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
          )}
        </div>
      </div>

      {/* Exchange Logs Modal */}
      {showExchangeLogs && (
        <AdminExchangeLogsModal
          isOpen={showExchangeLogs}
          onClose={() => setShowExchangeLogs(false)}
          account={account}
        />
      )}
    </div>
  );
}

export type { BurnReward, UserInfo };
