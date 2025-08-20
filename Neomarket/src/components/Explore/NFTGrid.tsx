import React, { useState, useEffect } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NFT {
  id: number;
  name: string;
  collection: string;
  image: string;
  price: {
    amount: string;
    currency: string;
    usd: number;
  };
  likes: number;
  verified: boolean;
}

interface NFTGridProps {
  nfts: NFT[];
  loading: boolean;
  onLoadMore: () => void;
}

// Skeleton loader component
function NFTCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
        <div className="flex justify-between items-center">
          <div className="h-2 bg-gray-800 rounded w-1/4" />
          <div className="h-6 bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function NFTCard({ nft }: { nft: NFT }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "bg-gray-900 rounded-lg overflow-hidden border border-gray-700 transition-all duration-200 cursor-pointer group",
        "hover:border-gray-600 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-800 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        <img
          src={nft.image}
          alt={nft.name}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && "scale-105"
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Hover Actions */}
        <div className={cn(
          "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded hover:bg-white/30 transition-colors">
            <Eye size={14} className="text-white" />
          </button>
          <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded hover:bg-white/30 transition-colors">
            <ShoppingCart size={14} className="text-white" />
          </button>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded hover:bg-black/60 transition-colors group">
          <Heart size={12} className="text-white group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Card Content - Compact */}
      <div className="p-3 space-y-2">
        {/* Collection Name */}
        <div className="text-xs text-gray-400">{nft.collection}</div>
        
        {/* NFT Name */}
        <h3 className="font-medium text-white truncate text-sm">{nft.name}</h3>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Price</div>
            <div className="font-medium text-white text-sm">
              {nft.price.amount} {nft.price.currency}
            </div>
            <div className="text-xs text-gray-500">${nft.price.usd}</div>
          </div>
          
          {/* Likes */}
          <div className="flex items-center gap-1 text-gray-400">
            <Heart size={12} />
            <span className="text-xs">{nft.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NFTGrid({ nfts, loading, onLoadMore }: NFTGridProps) {
  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [loading, onLoadMore]);

  return (
    <div className="space-y-4">
      {/* Section Header - Compact */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Trending NFTs</h2>
        <div className="text-xs text-gray-400">
          {nfts.length} items
        </div>
      </div>

      {/* Grid - More compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* NFT Cards */}
        {nfts.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
        
        {/* Loading Skeletons */}
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <NFTCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      <div id="scroll-sentinel" className="h-6" />
    </div>
  );
}
