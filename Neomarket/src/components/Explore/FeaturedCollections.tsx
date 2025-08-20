import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Collection {
  id: string;
  name: string;
  creator: string;
  coverImage: string;
  verified: boolean;
  floorPrice: string;
  change7d: number;
}

export default function FeaturedCollections() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock featured collections data
  const collections: Collection[] = [
    {
      id: '1',
      name: 'UFT (a self portrait)',
      creator: 'Snowfro',
      coverImage: 'https://picsum.photos/300/200?random=201',
      verified: true,
      floorPrice: '$1,204.66',
      change7d: -14.0
    },
    {
      id: '2',
      name: 'CryptoFish',
      creator: 'Artist2',
      coverImage: 'https://picsum.photos/300/200?random=202',
      verified: true,
      floorPrice: '$946.47',
      change7d: 1.5
    },
    {
      id: '3',
      name: "Lil' Bangers",
      creator: 'BangerCreator',
      coverImage: 'https://picsum.photos/300/200?random=203',
      verified: false,
      floorPrice: '$21.47',
      change7d: -18.2
    },
    {
      id: '4',
      name: 'Quills Adventure',
      creator: 'QuilArt',
      coverImage: 'https://picsum.photos/300/200?random=204',
      verified: true,
      floorPrice: '$680.80',
      change7d: 10.7
    },
    {
      id: '5',
      name: 'NODES',
      creator: 'NodeMaster',
      coverImage: 'https://picsum.photos/300/200?random=205',
      verified: true,
      floorPrice: '$48.19',
      change7d: -2.5
    },
    {
      id: '6',
      name: 'Digital Dreams',
      creator: 'DreamWeaver',
      coverImage: 'https://picsum.photos/300/200?random=206',
      verified: false,
      floorPrice: '$156.32',
      change7d: 25.8
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 252; // Card width (240px) + gap (12px)
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header - Compact */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Featured Collections</h2>
        <div className="text-xs text-gray-400">This week's picks</div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows - Smaller */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-900/90 hover:bg-gray-800 rounded-full border border-gray-700 transition-colors"
        >
          <ChevronLeft size={16} className="text-white" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-900/90 hover:bg-gray-800 rounded-full border border-gray-700 transition-colors"
        >
          <ChevronRight size={16} className="text-white" />
        </button>

        {/* Collections Scroll Container - Compact */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="flex-shrink-0 w-60 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-black/20"
            >
              {/* Cover Image - Smaller */}
              <div className="relative h-32 bg-gray-800 overflow-hidden">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Collection Info - Compact */}
              <div className="p-3 space-y-2">
                {/* Name and Verification */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {collection.name}
                      </h3>
                      {collection.verified && (
                        <CheckCircle size={12} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">by {collection.creator}</p>
                  </div>
                </div>

                {/* Stats - Compact */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Floor</div>
                    <div className="font-medium text-white text-sm">{collection.floorPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">7d</div>
                    <div className={cn(
                      "font-medium text-sm",
                      collection.change7d >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {collection.change7d >= 0 ? '+' : ''}{collection.change7d.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
