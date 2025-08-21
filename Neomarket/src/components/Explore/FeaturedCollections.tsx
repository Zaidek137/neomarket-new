import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Featured collections data - only showing The Scavenjers for now
  const collections: Collection[] = [
    {
      id: '1',
      name: 'The Scavenjers',
      creator: 'Scavenjer',
      coverImage: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png',
      verified: true,
      floorPrice: '$25.00',
      change7d: 0
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
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
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-tech text-white">Featured Collections</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Collections Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => navigate('/collection/scavenjers')}
              className="flex-shrink-0 w-60 bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-200 cursor-pointer group"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Cover Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Collection Info */}
              <div className="p-3 space-y-2">
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-white text-sm truncate">{collection.name}</h3>
                    {collection.verified && (
                      <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">by {collection.creator}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Floor Price</p>
                    <p className="font-medium text-white text-sm">{collection.floorPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">7D Change</p>
                    <p className={cn(
                      "font-medium text-sm",
                      collection.change7d > 0 ? "text-green-400" : collection.change7d < 0 ? "text-red-400" : "text-slate-400"
                    )}>
                      {collection.change7d > 0 && "+"}
                      {collection.change7d === 0 ? "—" : `${collection.change7d}%`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add more collections placeholder */}
          <div className="flex-shrink-0 w-60 h-full bg-slate-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
            <div className="text-center p-6">
              <p className="text-slate-400 text-sm">More collections coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}