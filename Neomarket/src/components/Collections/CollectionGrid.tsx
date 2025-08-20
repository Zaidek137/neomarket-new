import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Users, Package, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Collection } from './CollectionsPage';

interface CollectionGridProps {
  collections: Collection[];
  viewMode: 'grid' | 'list';
}

function CollectionCard({ collection, viewMode }: { collection: Collection; viewMode: 'grid' | 'list' }) {
  const navigate = useNavigate();

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'ethereum': return 'from-blue-500 to-blue-600';
      case 'polygon': return 'from-purple-500 to-purple-600';
      case 'solana': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'ethereum': return '⟠';
      case 'polygon': return '⬟';
      case 'solana': return '◉';
      default: return '○';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };



  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/collection/scavenjers`)}
        className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* Collection Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={collection.image}
              alt={collection.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {collection.verified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <Badge size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Collection Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                {collection.name}
              </h3>
              <span className={cn("w-3 h-3 rounded-full bg-gradient-to-r", getChainColor(collection.chain))} />
            </div>
            <p className="text-sm text-slate-400 truncate">{collection.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>by {collection.creator}</span>
              <span>{formatNumber(collection.items)} items</span>
              <span>{formatNumber(collection.owners)} owners</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-right">
                    <div>
          <div className="text-sm text-slate-400">Average price</div>
          <div className="font-semibold text-white">${formatPrice(collection.floorPrice)} USD</div>
        </div>
            <div>
              <div className="text-sm text-slate-400">Items</div>
              <div className="font-semibold text-white">{formatNumber(collection.items)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Owners</div>
              <div className="font-semibold text-white">{formatNumber(collection.owners)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/collection/scavenjers`)}
      className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-700/30 hover:border-slate-600/50 hover:scale-105 transition-all duration-300"
    >
      {/* Collection Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {collection.verified && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Badge size={12} className="text-white" />
          </div>
        )}
        
        {/* Chain indicator */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            "w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center text-white text-xs font-bold shadow-lg",
            getChainColor(collection.chain)
          )}>
            {getChainIcon(collection.chain)}
          </div>
        </div>
      </div>

      {/* Collection Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {collection.name}
            </h3>
            <p className="text-sm text-slate-400 truncate">by {collection.creator}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2">{collection.description}</p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-slate-400">Average price: </span>
              <span className="font-semibold text-white">${formatPrice(collection.floorPrice)} USD</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} className="text-slate-400" />
              <span className="text-slate-300">{formatNumber(collection.owners)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Package size={12} className="text-slate-400" />
              <span className="text-slate-300">{formatNumber(collection.items)} items</span>
            </div>
            <div className="flex items-center gap-1">
              <List size={12} className="text-slate-400" />
              <span className="text-slate-300">{formatNumber(collection.listed)} listed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionGrid({ collections, viewMode }: CollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No collections found</h3>
        <p className="text-slate-400">Try adjusting your filters to see more collections</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
