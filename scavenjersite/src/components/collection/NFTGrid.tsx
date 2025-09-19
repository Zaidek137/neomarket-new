import React from 'react';
import { NFT } from '../../hooks/useNFTCollection';

interface NFTGridProps {
  nfts: NFT[];
}

export default function NFTGrid({ nfts }: NFTGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className="group relative bg-[#111111] border border-[#2DD4BF]/20 rounded-lg overflow-hidden hover:border-[#2DD4BF]/40 transition-all"
        >
          <div className="aspect-square">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white mb-1">{nft.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2DD4BF] capitalize">{nft.element}</span>
                <span className="text-[#2DD4BF]">{nft.price} ETH</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}