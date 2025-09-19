import React, { useState, useEffect } from 'react';
import { useContractEvents, MediaRenderer } from "thirdweb/react";
import { getContract, prepareEvent, toEther } from "thirdweb";
import { getNFT } from 'thirdweb/extensions/erc721';
import { getListing } from 'thirdweb/extensions/marketplace';
import { client } from '../client';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS, CONTRACT_ADDRESS } from '../config/constants';
import { ExternalLink } from 'lucide-react';

const marketplaceContract = getContract({ 
    client, 
    chain: polygon, 
    address: CONTRACT_ADDRESS 
});

const nftCollectionContract = getContract({
    client,
    chain: polygon,
    address: NFT_COLLECTION_ADDRESS
});

const newSaleEvent = prepareEvent({
  signature: "event NewSale(uint256 indexed listingId, address indexed assetContract, address indexed lister, address indexed buyer, uint256 quantityBought, uint256 totalPricePaid)",
});

type EnrichedSaleEvent = {
  log: any;
  metadata?: any; 
  listing?: any;
};

export default function ActivityPage() {
  const [saleEvents, setSaleEvents] = useState<EnrichedSaleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: events } = useContractEvents({
    contract: marketplaceContract,
    events: [newSaleEvent],
  });

  useEffect(() => {
    const enrichEvents = async () => {
      if (!events || events.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const enriched = await Promise.all(events.slice(0, 20).map(async (event) => { // Limit to 20 to avoid rate limits/performance issues
        try {
          const listingId = event.args.listingId;
          const listing = await getListing({ contract: marketplaceContract, listingId });
          const nft = await getNFT({ contract: nftCollectionContract, tokenId: listing.asset.id });

          return { log: event, metadata: nft.metadata, listing };

        } catch (e) {
          console.error("Failed to enrich event:", e);
          return { log: event };
        }
      }));
      setSaleEvents(enriched.reverse()); // Show newest first
      setLoading(false);
    };

    enrichEvents();
  }, [events]);
  
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatPrice = (price: bigint) => `${toEther(price)} POL`;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2DD4BF] via-[#EC4899] to-[#2DD4BF] bg-clip-text text-transparent mb-4">
            Activity Feed
          </h1>
          <p className="text-gray-400">
            Real-time sales from the NeoMarket
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400">Loading activity...</div>
          ) : saleEvents.length === 0 ? (
            <p className="text-center text-gray-500">No sales activity yet.</p>
          ) : (
            saleEvents.map((sale, index) => (
              <div
                key={`${sale.log.transactionHash}-${index}`}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                    {sale.metadata?.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <MediaRenderer client={client} src={sale.metadata.image} className="w-full h-full object-cover" />
                        </div>
                    )}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full">
                    <div>
                      <h3 className="text-white font-medium">
                        {sale.metadata?.name || `Listing #${sale.listing?.id.toString()}`}
                      </h3>
                      <span className="text-sm text-green-400">
                        Sale Completed
                      </span>
                    </div>

                    <div>
                      <div className="text-cyan-400 font-medium">
                        {formatPrice(sale.log.args.totalPricePaid)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">From:</span>
                        <a href={`https://polygonscan.com/address/${sale.log.args.lister}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                          {formatAddress(sale.log.args.lister)}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">To:</span>
                        <a href={`https://polygonscan.com/address/${sale.log.args.buyer}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                          {formatAddress(sale.log.args.buyer)}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <a
                        href={`https://polygonscan.com/tx/${sale.log.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-pink-500 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}