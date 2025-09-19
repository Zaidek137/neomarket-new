import React, { useState } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract, prepareContractCall, toWei } from 'thirdweb';
import { CONTRACT_ADDRESS } from '../config/constants';
import { client } from '../client';
import { MediaRenderer } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';

type EnrichedAuction = {
  auction: any;
  metadata: any;
};

interface DarkCircuitAuctionProps {
  auctions: EnrichedAuction[];
  auctionsLoading: boolean;
  auctionsError: string | null;
}

const getAuctionStatusText = (status: number) => {
  switch (status) {
    case 1: return 'Active';
    case 2: return 'Completed';
    case 3: return 'Cancelled';
    default: return 'Unknown';
  }
};

export default function DarkCircuitAuction({ auctions, auctionsLoading, auctionsError }: DarkCircuitAuctionProps) {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});

  const handleBidAmountChange = (auctionId: string, amount: string) => {
    setBidAmounts(prev => ({ ...prev, [auctionId]: amount }));
  };

  const marketplaceContract = getContract({ 
      client, 
      chain: polygon, 
      address: CONTRACT_ADDRESS 
  });
  
  const handlePlaceBid = async (auctionId: bigint, bidAmount: string) => {
    if (!account || !bidAmount || isNaN(Number(bidAmount))) return;
    
    const transaction = await prepareContractCall({
      contract: marketplaceContract,
      method: "function bidInAuction(uint256 _auctionId, uint256 _bidAmount) payable",
      params: [auctionId, toWei(bidAmount)],
    });
    
    sendTransaction(transaction);
  };

  const handleCollectPayout = async (auctionId: bigint) => {
    if (!account) return;
    
    const transaction = await prepareContractCall({
      contract: marketplaceContract,
      method: "function collectAuctionPayout(uint256 _auctionId)",
      params: [auctionId],
    });
    
    sendTransaction(transaction);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Auctions</h2>
      {auctionsLoading ? (
        <p>Loading auctions...</p>
      ) : auctionsError ? (
        <p className="text-red-400">{auctionsError}</p>
      ) : auctions.length === 0 ? (
        <p>There are no auctions at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map(({ auction, metadata }) => {
            const auctionIdStr = auction.auctionId.toString();
            const isAuctionActive = auction.status === 1;
            const isAuctionCompleted = auction.status === 2;
            const canCollect = isAuctionCompleted && account?.address === auction.auctionCreator;

            return (
              <div key={auctionIdStr} className="bg-gray-800 rounded-lg p-4 flex flex-col">
                <div className="relative">
                  {metadata ? (
                    <MediaRenderer client={client} src={metadata.image} className="w-full h-auto rounded-md aspect-square" />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 rounded-md flex items-center justify-center">No Image</div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${isAuctionActive ? 'bg-green-500' : 'bg-gray-600'}`}>
                    {getAuctionStatusText(auction.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mt-4">{metadata?.name || 'Unnamed Eko'}</h3>
                <p>Minimum Bid: {auction.minimumBidAmount.toString()}</p>
                <p>Buyout: {auction.buyoutBidAmount.toString()}</p>
                
                <div className="mt-auto pt-4">
                  {isAuctionActive && (
                    <div className="space-y-2">
                      <input 
                        type="text"
                        placeholder="Bid amount in MATIC"
                        value={bidAmounts[auctionIdStr] || ''}
                        onChange={(e) => handleBidAmountChange(auctionIdStr, e.target.value)}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md"
                      />
                      <button
                        onClick={() => handlePlaceBid(auction.auctionId, bidAmounts[auctionIdStr])}
                        disabled={isPending || !bidAmounts[auctionIdStr]}
                        className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {isPending ? 'Bidding...' : 'Place Bid'}
                      </button>
                    </div>
                  )}

                  {canCollect && (
                    <button
                      onClick={() => handleCollectPayout(auction.auctionId)}
                      disabled={isPending}
                      className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg"
                    >
                      {isPending ? 'Collecting...' : 'Collect Payout'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 