import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExchangePage from '../Exchange/ExchangePage';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronDown, 
  X, 
  Check, 
  Badge,
  Heart,
  Eye,
  Loader2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ipfsToHttp, generateOptimizedImageSources, preWarmAssets } from '../../lib/ipfs';
import { rarityService } from '../../services/rarityService';
import { fetchGameCollectionItems } from '../../services/gameCollectionsService';
import type { GameCollectionItem, GameRarityTier } from '../../types/gameCollection';
import RarityFilter from './RarityFilter';

// ⚡ PINATA GATEWAY OPTIMIZATION ⚡
// Old IPFS functions replaced with optimized Pinata gateway system  
// Now using dedicated gateway: https://ifps.scavenjer.com
// Enhanced caching, smart fallbacks, and performance monitoring included

interface GameItemTrait {
  trait_type: string;
  value: string;
}

interface GameItemCardData {
  id: string;
  name: string;
  image: string;
  attributes: GameItemTrait[];
  description?: string;
}

interface CollectionInfo {
  name: string;
  description: string;
  image: string;
  bannerImage?: string;
  totalSupply: number;
  statusLabel: string;
  verified: boolean;
  creator: string;
}

const collectionInfo: CollectionInfo = {
  name: 'The Scavenjers',
  description: 'Intro Eko collection for the Scavenjer game ecosystem. These items are curated for player inventory, traits, rarity, and future gameplay integrations.',
  image: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png',
  bannerImage: 'https://ik.imagekit.io/q9x52ygvo/banner-scavenjers.png',
  totalSupply: 9000,
  statusLabel: 'Curated game collection',
  verified: true,
  creator: 'Scavenjer'
};

const CURATED_COLLECTION_ID = 'SCV-BASE-01';

// Memoized trait option component to prevent unnecessary re-renders
const TraitOption = React.memo(({ 
  trait, 
  value, 
  count, 
  isSelected, 
  onToggle 
}: {
  trait: string;
  value: string;
  count: number;
  isSelected: boolean;
  onToggle: (trait: string, value: string) => void;
}) => {
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onToggle(trait, value);
  }, [trait, value, onToggle]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group"
      onClick={handleToggle}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
      />
      <div className={cn(
        "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
        isSelected
          ? "border-cyan-500 bg-cyan-500"
          : "border-slate-500 group-hover:border-slate-400"
      )}>
        {isSelected && (
          <Check size={12} className="text-white" />
        )}
      </div>
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">
        {value}
      </span>
      <span className="text-xs text-slate-500 bg-slate-700/50 rounded-full px-2 py-0.5">
        {count}
      </span>
    </div>
  );
});

// Memoized trait category component
const TraitCategory = React.memo(({ 
  trait, 
  values, 
  isOpen, 
  selectedTraits, 
  onToggleCategory, 
  onToggleTrait 
}: {
  trait: string;
  values: { [value: string]: number };
  isOpen: boolean;
  selectedTraits: Set<string> | undefined;
  onToggleCategory: (trait: string) => void;
  onToggleTrait: (trait: string, value: string) => void;
}) => {
  const handleToggleCategory = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onToggleCategory(trait);
  }, [trait, onToggleCategory]);

  // Memoize sorted values to prevent re-sorting on every render
  const sortedValues = useMemo(() => {
    return Object.entries(values).sort(([a], [b]) => a.localeCompare(b));
  }, [values]);

  return (
    <div className="pb-2">
      <button
        onClick={handleToggleCategory}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        className="flex items-center justify-between w-full text-left mb-2 hover:text-cyan-300 transition-colors focus:outline-none"
        type="button"
      >
        <span className="text-sm font-medium text-white">{trait}</span>
        <ChevronDown 
          size={14} 
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ willChange: 'height' }}
          >
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {sortedValues.map(([value, count]) => (
                <TraitOption
                  key={value}
                  trait={trait}
                  value={value}
                  count={count}
                  isSelected={selectedTraits?.has(value) || false}
                  onToggle={onToggleTrait}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const TraitsFilter = React.memo(({ 
  collectionTraits, 
  selectedTraits, 
  onTraitsChange,
  selectedRarityTiers,
  onRarityTiersChange,
  tierCounts,
  isFiltering
}: {
  collectionTraits: { [trait: string]: { [value: string]: number } };
  selectedTraits: { [trait: string]: Set<string> };
  onTraitsChange: (traits: { [trait: string]: Set<string> }) => void;
  selectedRarityTiers: GameRarityTier[];
  onRarityTiersChange: (tiers: GameRarityTier[]) => void;
  tierCounts: { [tier: string]: number };
  isFiltering: boolean;
}) => {
  const [openCategories, setOpenCategories] = useState<{ [trait: string]: boolean }>({});

  // Initialize all categories as open by default
  useEffect(() => {
    const initialState: { [trait: string]: boolean } = {};
    Object.keys(collectionTraits).forEach(trait => {
      initialState[trait] = false; // Start collapsed for better UX
    });
    setOpenCategories(initialState);
  }, [collectionTraits]);

  const toggleCategory = useCallback((trait: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [trait]: !prev[trait]
    }));
  }, []);

  const toggleTrait = useCallback((trait: string, value: string) => {
    const newSelectedTraits = { ...selectedTraits };
    if (!newSelectedTraits[trait]) {
      newSelectedTraits[trait] = new Set();
    }
    
    if (newSelectedTraits[trait].has(value)) {
      newSelectedTraits[trait].delete(value);
      if (newSelectedTraits[trait].size === 0) {
        delete newSelectedTraits[trait];
      }
    } else {
      newSelectedTraits[trait].add(value);
    }
    
    onTraitsChange(newSelectedTraits);
  }, [selectedTraits, onTraitsChange]);

  const clearAllTraits = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onTraitsChange({});
  }, [onTraitsChange]);

  // Memoize expensive calculation
  const activeTraitCount = useMemo(() => {
    return Object.values(selectedTraits).reduce((acc, set) => acc + set.size, 0);
  }, [selectedTraits]);

  // Memoize traits entries to prevent re-creating array on every render
  const traitsEntries = useMemo(() => {
    return Object.entries(collectionTraits);
  }, [collectionTraits]);

  return (
    <div className="bg-slate-800/20 rounded-xl h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h3 className="text-white font-medium">Traits</h3>
        {activeTraitCount > 0 && (
          <button
            onClick={clearAllTraits}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 focus:outline-none"
            type="button"
          >
            <X size={12} />
            Clear ({activeTraitCount})
          </button>
        )}
      </div>

      {/* Trait Categories - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
        {/* Rarity Filter */}
        <RarityFilter
          selectedTiers={selectedRarityTiers}
          onTiersChange={onRarityTiersChange}
          tierCounts={tierCounts}
          isFiltering={isFiltering}
        />
        
        {traitsEntries.map(([trait, values]) => (
          <TraitCategory
            key={trait}
            trait={trait}
            values={values}
            isOpen={openCategories[trait]}
            selectedTraits={selectedTraits[trait]}
            onToggleCategory={toggleCategory}
            onToggleTrait={toggleTrait}
          />
        ))}
      </div>
    </div>
  );
});

// Enhanced loading animation
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin`} />
        <div className="text-xs text-slate-400">Loading Eko...</div>
                          </div>
                  </div>
  );
};

// Skeleton card component for smooth loading transitions
const SkeletonCard = React.memo(({ viewMode, isMobile }: { viewMode: 'grid' | 'list'; isMobile?: boolean }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          {/* Skeleton Image */}
          <div className="w-16 h-16 bg-gradient-to-r from-slate-700/50 via-slate-600/60 to-slate-700/50 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg flex-shrink-0" />
          
          {/* Skeleton Info */}
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gradient-to-r from-slate-700/50 via-slate-600/60 to-slate-700/50 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded mb-2 w-3/4" />
            <div className="h-3 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-700/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-1/2" />
          </div>
          
          {/* Skeleton Actions */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-700/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg" />
            <div className="w-8 h-8 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-700/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg" />
          </div>
      </div>
    </div>
  );
}

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden group">
      {/* Skeleton Image with shimmer effect */}
      <div className="aspect-square bg-gradient-to-br from-slate-700/40 via-slate-600/50 to-slate-700/40 bg-[length:200%_200%] animate-[shimmer_2.5s_infinite] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[slide_2s_infinite]" />
      </div>
      
      {/* Skeleton Info */}
      <div className={cn("p-4", isMobile && "p-2")}>
        <div className={cn(
          "h-4 bg-gradient-to-r from-slate-700/50 via-slate-600/60 to-slate-700/50 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded mb-2",
          isMobile && "h-3"
        )} />
        <div className="flex items-center justify-between">
          <div className={cn(
            "h-3 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-700/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-1/2",
            isMobile && "h-2"
          )} />
          <div className={cn(
            "h-3 bg-gradient-to-r from-slate-700/30 via-slate-600/40 to-slate-700/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-1/4",
            isMobile && "h-2"
          )} />
        </div>
      </div>
    </div>
  );
});

// Grid of skeleton cards
const SkeletonGrid = React.memo(({ count = 36, viewMode, isMobile }: { count?: number; viewMode: 'grid' | 'list'; isMobile?: boolean }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <SkeletonCard key={`skeleton-${i}`} viewMode={viewMode} isMobile={isMobile} />
  ));

  if (viewMode === 'list') {
    return <div className="space-y-2">{skeletons}</div>;
  }

  return (
    <div className={cn(
      "grid gap-3",
      isMobile 
        ? "grid-cols-3 gap-2" // Mobile: 3 columns, smaller gaps
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" // Desktop: original layout
    )}>
      {skeletons}
    </div>
  );
});

// Optimized image component with WebP/AVIF support and responsive sizing
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className, 
  priority = false,
  size = 'thumbnail',
  onLoad,
  onError
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: 'thumbnail' | 'medium' | 'large';
  onLoad?: () => void;
  onError?: () => void;
}) => {
  const sources = generateOptimizedImageSources(src);
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  
  const handleError = useCallback(() => {
    if (fallbackAttempt === 0) {
      // Try cloudflare gateway
      setFallbackAttempt(1);
    } else if (fallbackAttempt === 1) {
      // Mark as error and use original
      setImageError(true);
      setFallbackAttempt(2);
    }
    onError?.();
  }, [fallbackAttempt, onError]);



  const getCurrentSrc = () => {
    if (fallbackAttempt === 0) {
      switch (size) {
        case 'thumbnail':
          return sources.thumbnail;
        case 'medium':
          return sources.medium;
        case 'large':
          return sources.large;
        default:
          return sources.thumbnail;
      }
    } else if (fallbackAttempt === 1) {
      // Try fallback gateway
      return ipfsToHttp(src, { gatewayIndex: 1 });
    } else {
      return sources.original;
    }
  };

  if (imageError && fallbackAttempt >= 2) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-700/50", className)}>
        <span className="text-slate-400 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <picture className={className}>
      {/* AVIF format (best compression) */}
      <source 
        srcSet={size === 'thumbnail' ? sources.thumbnailAvif : 
               size === 'medium' ? sources.mediumAvif : sources.largeAvif}
        type="image/avif"
      />
      {/* WebP format (good compression, wide support) */}
      <source 
        srcSet={size === 'thumbnail' ? sources.thumbnail : 
               size === 'medium' ? sources.medium : sources.large}
        type="image/webp"
      />
      {/* Fallback JPEG */}
      <img
        src={getCurrentSrc()}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? ('high' as any) : ('auto' as any)}
        width={size === 'thumbnail' ? 300 : size === 'medium' ? 600 : 1200}
        height={size === 'thumbnail' ? 300 : size === 'medium' ? 600 : 1200}
        onLoad={onLoad}
        onError={handleError}
        sizes={
          size === 'thumbnail' ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw' :
          size === 'medium' ? '(max-width: 768px) 100vw, 50vw' :
          '(max-width: 768px) 100vw, 80vw'
        }
      />
    </picture>
  );
});



const GameItemCard = React.memo(function GameItemCard({ item, viewMode, onClick, priority = false, isMobile = false }: { item: GameItemCardData; viewMode: 'grid' | 'list'; onClick: () => void; priority?: boolean; isMobile?: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        onClick={onClick}
        className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* Item Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {!imageLoaded && !imageError && (
              <LoadingSpinner size="sm" />
            )}
            <OptimizedImage
              src={item.image}
                alt={item.name}
                className={cn(
                  "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              priority={priority}
              size="thumbnail"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Eko Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">The Scavenjers</span>
              <Badge size={12} className="text-cyan-400" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Eye size={16} className="text-slate-400 hover:text-white" />
            </button>
            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Heart size={16} className="text-slate-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group cursor-pointer bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-700/30 hover:border-slate-600/50 hover:scale-105 transition-all duration-300"
      style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '256px' as any }}
    >
      {/* Item Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && !imageError && (
          <LoadingSpinner />
        )}
        <OptimizedImage
          src={item.image}
            alt={item.name}
            className={cn(
              "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          priority={priority}
          size="thumbnail"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Hover Actions - Hidden on mobile for better touch experience */}
        {!isMobile && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <Eye size={16} className="text-white" />
              </button>
              <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <Heart size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className={cn("p-4", isMobile && "p-2")}>
        <h3 className={cn(
          "font-semibold text-white truncate group-hover:text-cyan-300 transition-colors mb-1",
          isMobile && "text-sm"
        )}>
          {item.name}
        </h3>
        <div className={cn("flex items-center justify-between text-sm", isMobile && "text-xs")}>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">The Scavenjers</span>
            <Badge size={isMobile ? 8 : 12} className="text-cyan-400" />
          </div>
          <span className="text-slate-500">#{item.id}</span>
        </div>
      </div>
    </motion.div>
  );
});

export default function ScavenjersCollectionPage() {
  useParams();
  const [allItems, setAllItems] = useState<GameItemCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Start with filters hidden
  const [selectedTraits, setSelectedTraits] = useState<{ [trait: string]: Set<string> }>({});
  const [selectedRarityTiers, setSelectedRarityTiers] = useState<GameRarityTier[]>([]);
  const [rarityData, setRarityData] = useState<any>(null);
  const [tierCounts, setTierCounts] = useState<{ [tier: string]: number }>({});
  const [selectedItem, setSelectedItem] = useState<GameItemCardData | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'exchange' | 'registry' | 'about'>('explore');
  const [visibleCount, setVisibleCount] = useState(36); // Start with 36 items for larger collection
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [previousFilterState, setPreviousFilterState] = useState<string>('');
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, keep filters hidden by default, on desktop show them
      if (!mobile) {
        setShowFilters(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent page scrolling beyond the collection view while allowing internal scrolling
  useEffect(() => {
    // Set body and html to prevent page-level overflow scrolling
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Ensure we start at the top
    window.scrollTo(0, 0);
    
    return () => {
      // Restore original overflow styles when component unmounts
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);
  
  // Performance optimization: Pre-compute trait maps for faster filtering
  const itemTraitMaps = useMemo(() => {
    return allItems.map(item => ({
      item,
      traitMap: new Map((item.attributes || []).map(attr => {
        const type = attr.trait_type?.trim();
        const value = attr.value?.trim();
        const displayValue = value === '' || value?.toLowerCase() === 'blank' ? 'None' : value;
        return [type, displayValue] as [string, string];
      }).filter(([type]) => type && type.length > 0)), // Filter out entries with empty trait types
      searchText: item.name.toLowerCase()
    }));
  }, [allItems]);

  // Load curated game item metadata with archive fallback.
  useEffect(() => {
    async function loadMetadata() {
      setLoading(true);
      try {
        const curatedItems = await fetchGameCollectionItems(CURATED_COLLECTION_ID, { limit: 500 });
        if (curatedItems.length > 0) {
          const items = curatedItems.map(gameItemToCardData);
          setAllItems(items);
          const imageUrls = items.slice(0, 20).map(item => item.image).filter(Boolean);
          if (imageUrls.length > 0) {
            preWarmAssets(imageUrls).catch(console.warn);
          }
          return;
        }

        // Request with compression headers for better performance
        const response = await fetch('/metadata-fixed.json', {
          headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Fallback to import if fetch fails
        const data = await import('../../../metadata-fixed.json');
        let archiveItems: GameItemCardData[] = [];
        if (Array.isArray(data)) {
          archiveItems = data;
        } else if (data && Array.isArray((data as any).default)) {
          archiveItems = (data as any).default;
        }
        setAllItems(archiveItems);
          return;
        }
        
        const archiveItems = await response.json();
        if (Array.isArray(archiveItems)) {
          setAllItems(archiveItems);
          
          // 🔥 Pre-warm first 20 images via Pinata gateway for faster loading
          const imageUrls = archiveItems.slice(0, 20).map(item => item.image).filter(Boolean);
          if (imageUrls.length > 0) {
            preWarmAssets(imageUrls).catch(console.warn);
          }
        } else {
          console.error('Invalid metadata format:', archiveItems);
          setAllItems([]);
        }
      } catch (error) {
        console.error('Error loading game collection metadata:', error);
        // Final fallback
        try {
          const data = await import('../../../metadata-fixed.json');
          let archiveItems: GameItemCardData[] = [];
          if (Array.isArray(data)) {
            archiveItems = data;
          } else if (data && Array.isArray((data as any).default)) {
            archiveItems = (data as any).default;
          }
          setAllItems(archiveItems);
          
          // 🔥 Pre-warm images for fallback data too
          const imageUrls = archiveItems.slice(0, 20).map(item => item.image).filter(Boolean);
          if (imageUrls.length > 0) {
            preWarmAssets(imageUrls).catch(console.warn);
          }
        } catch (fallbackError) {
          console.error('Fallback metadata loading failed:', fallbackError);
          setAllItems([]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, []);

  // Calculate rarity data when items are loaded
  useEffect(() => {
    if (allItems.length > 0) {
      const calculateRarity = async () => {
        try {
          const collectionId = 'scavenjers';
          const rarityCollection = await rarityService.getCollectionRarity(collectionId, allItems);
          const counts = rarityService.getTierCounts(collectionId);
          setRarityData(rarityCollection);
          setTierCounts(counts);
        } catch (error) {
          console.error('Error calculating rarity:', error);
        }
      };
      calculateRarity();
    }
  }, [allItems]);

  // Calculate collection traits with improved handling for the new collection
  const collectionTraits = useMemo(() => {
    const traitsMap: { [trait: string]: { [value: string]: number } } = {};
    allItems.forEach(item => {
      (item.attributes || []).forEach((trait: GameItemTrait) => {
        const type = trait.trait_type?.trim(); // Trim whitespace from trait types
        const value = trait.value?.trim(); // Trim whitespace from values
        
        // Only skip if trait_type is missing or if value is null/undefined
        // Include empty strings as they represent "blank" or "none" traits
        if (!type || value === undefined || value === null) return;
        
        if (!traitsMap[type]) traitsMap[type] = {};
        
        // Handle empty string values by giving them a proper display name
        const displayValue = value === '' || value.toLowerCase() === 'blank' ? 'None' : value;
        traitsMap[type][displayValue] = (traitsMap[type][displayValue] || 0) + 1;
      });
    });
    return traitsMap;
  }, [allItems]);

  // Enhanced debouncing for better performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const filterUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const skeletonTimeoutRef = useRef<NodeJS.Timeout>();

  // Track filter state changes to show immediate feedback
  const currentFilterState = useMemo(() => {
    const traitsKey = Object.entries(selectedTraits)
      .map(([key, values]) => `${key}:${Array.from(values).sort().join(',')}`)
      .sort()
      .join('|');
    const rarityKey = selectedRarityTiers.sort().join(',');
    return `${searchQuery}::${traitsKey}::${rarityKey}`;
  }, [searchQuery, selectedTraits, selectedRarityTiers]);

  // Immediately show skeletons when filter state changes
  useEffect(() => {
    if (previousFilterState && previousFilterState !== currentFilterState) {
      // Show skeletons immediately when filters change
      setShowSkeletons(true);
      setVisibleCount(36); // Reset visible count
      
      // Clear any existing skeleton timeout
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
      
      // Hide skeletons after minimum display time to prevent flashing
      skeletonTimeoutRef.current = setTimeout(() => {
        setShowSkeletons(false);
      }, 800); // Show skeletons for at least 800ms
    }
    setPreviousFilterState(currentFilterState);
  }, [currentFilterState, previousFilterState]);

  // Debounce search input with faster response for short queries
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Faster response for short queries, longer delay for complex searches
    const delay = searchQuery.length <= 2 ? 150 : 300;
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, delay);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Debounce trait filter updates to prevent excessive re-filtering
  const debouncedOnTraitsChange = useCallback((newTraits: { [trait: string]: Set<string> }) => {
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }
    
    filterUpdateTimeoutRef.current = setTimeout(() => {
      setSelectedTraits(newTraits);
    }, 100); // Quick response for better UX
  }, []);

  // Debounced rarity filter handler with immediate visual feedback
  const handleRarityTiersChange = useCallback((newTiers: GameRarityTier[]) => {
    // Show immediate filtering state
    setFiltering(true);
    setShowSkeletons(true);
    
    // Clear any existing timeout
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }
    
    // Apply rarity filter with slight delay for smooth animation
    filterUpdateTimeoutRef.current = setTimeout(() => {
      setSelectedRarityTiers(newTiers);
    }, 150); // Slight delay for visual feedback
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(36);
  }, [debouncedSearchQuery, selectedTraits, selectedRarityTiers]);

  // Optimized filter function with performance improvements and batching
  const filteredItems = useMemo(() => {
    // Early return for empty data
    if (itemTraitMaps.length === 0) {
      return [];
    }

    setFiltering(true);
    
    let filtered = itemTraitMaps;

    // Search filter with optimized string matching
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      // Use native filter for better performance than custom loops
      filtered = filtered.filter(item => item.searchText.includes(query));
    }

    // Optimized traits filtering with early exit
    const traitEntries = Object.entries(selectedTraits);
    if (traitEntries.length > 0) {
      filtered = filtered.filter(item => {
        // Early exit: check all traits in one pass
        return traitEntries.every(([trait, selectedValues]) => {
          if (selectedValues.size === 0) return true;
          const itemValue = item.traitMap.get(trait);
          return itemValue && selectedValues.has(itemValue);
        });
      });
    }

    // Rarity filtering
    if (selectedRarityTiers.length > 0 && rarityData) {
      filtered = filtered.filter(item => {
        const itemRarity = rarityData.nft_rarities[item.item.id || item.item.name];
        return itemRarity && selectedRarityTiers.includes(itemRarity.rarity_tier);
      });
    }

    const result = filtered.map(item => item.item);

    // Use requestIdleCallback for non-blocking state update
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setFiltering(false);
        // Hide skeletons when filtering is complete and we have results
        if (result.length > 0) {
          setShowSkeletons(false);
          if (skeletonTimeoutRef.current) {
            clearTimeout(skeletonTimeoutRef.current);
          }
        }
      });
    } else {
      setTimeout(() => {
        setFiltering(false);
        if (result.length > 0) {
          setShowSkeletons(false);
          if (skeletonTimeoutRef.current) {
            clearTimeout(skeletonTimeoutRef.current);
          }
        }
      }, 0);
    }
    
    return result;
  }, [itemTraitMaps, debouncedSearchQuery, selectedTraits, selectedRarityTiers, rarityData]);

  // Memoize expensive operations for better performance
  const collectionStats = useMemo(() => {
    return {
      totalItems: filteredItems.length,
      remainingItems: Math.max(0, filteredItems.length - visibleCount),
      hasMore: visibleCount < filteredItems.length
    };
  }, [filteredItems.length, visibleCount]);

  // Get visible items based on current visible count
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Optimized load more function with better performance
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !collectionStats.hasMore) return;
    
    setLoadingMore(true);
    
    // Use requestIdleCallback for better performance
    await new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setTimeout(resolve, 150); // Reduced loading time
        });
      } else {
        setTimeout(resolve, 150);
      }
    });
    
    setVisibleCount(prev => Math.min(prev + 36, collectionStats.totalItems));
    setLoadingMore(false);
  }, [loadingMore, collectionStats.hasMore, collectionStats.totalItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="collection-container min-h-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden" 
      style={{ 
        height: 'calc(100vh - 96px)', // Mobile: 56px header + 40px footer = 96px
        scrollBehavior: 'auto' 
      }}
    >
      {/* Responsive height adjustment for larger screens */}
      <style>{`
        @media (min-width: 640px) {
          .collection-container {
            height: calc(100vh - 112px) !important;
          }
        }
      `}</style>
      {/* Collection Header - Simplified */}
      <div className="flex-shrink-0">
        <div className="px-4 lg:px-6 xl:px-8 py-6">
          {/* Collection Info - Compact */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={collectionInfo.image}
                alt={collectionInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {collectionInfo.name}
                </h1>
                {collectionInfo.verified && (
                  <Badge size={16} className="text-cyan-400 sm:w-5 sm:h-5" />
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                <img 
                  src="https://ifps.scavenjer.com/ipfs/bafkreif42agmn7wpyvvg2363payc75ek6nuanwezswjpzjgabuhaaggofy" 
                  alt="Akibaza Studio"
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover flex-shrink-0"
                />
                <span className="text-xs sm:text-sm text-slate-400 truncate">Design by <span className="text-slate-300 font-medium">Akibaza Studio</span></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {(['explore', 'exchange', 'registry', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 capitalize whitespace-nowrap",
                  activeTab === tab
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                {tab === 'exchange' ? 'The Exchange' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Bar - Simplified */}
      {activeTab === 'explore' && (
        <div className="px-4 lg:px-6 xl:px-8 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-slate-800/30 border-0 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800/50 transition-all duration-300 text-sm"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm",
                  showFilters 
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                <SlidersHorizontal size={16} />
                Traits
              </button>

              {/* Results Count */}
              <div className="flex items-center gap-2">
                {filtering && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
              <span className="text-sm text-slate-500">
                  {filtering ? 'Filtering...' : `${collectionStats.totalItems} items`}
              </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded transition-all duration-300",
                    viewMode === 'grid'
                      ? "bg-slate-700/50 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded transition-all duration-300",
                    viewMode === 'list'
                      ? "bg-slate-700/50 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout - Scrollable */}
      <div className="flex-1 flex gap-4 px-4 lg:px-6 xl:px-8 pb-6 overflow-hidden min-h-0">
        {/* Traits Filter Sidebar - Only show for explore tab */}
        {activeTab === 'explore' && showFilters && (
          <div className="w-80 flex-shrink-0 h-full overflow-hidden">
            <TraitsFilter
              collectionTraits={collectionTraits}
              selectedTraits={selectedTraits}
              onTraitsChange={debouncedOnTraitsChange}
              selectedRarityTiers={selectedRarityTiers}
              onRarityTiersChange={handleRarityTiersChange}
              tierCounts={tierCounts}
              isFiltering={filtering}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {activeTab === 'exchange' && (
            <ExchangePage />
          )}
          
          {activeTab === 'explore' && (
            <>
              {/* Show skeletons immediately when filtering starts */}
              {showSkeletons ? (
                <div className="relative">
                  <SkeletonGrid count={visibleCount} viewMode={viewMode} isMobile={isMobile} />
                  {/* Filtering status overlay */}
                  <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-sm text-slate-300">
                        {selectedRarityTiers.length > 0 && Object.keys(selectedTraits).length === 0 
                          ? `Filtering by ${selectedRarityTiers.length} rarity tier${selectedRarityTiers.length > 1 ? 's' : ''}...`
                          : selectedRarityTiers.length > 0 
                            ? 'Filtering by rarity & traits...'
                            : 'Filtering Ekos...'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="relative">
                  {/* Secondary filtering overlay for heavy operations */}
                  {filtering && (
                    <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600/50 z-10">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span className="text-sm text-slate-300">Finalizing...</span>
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'grid' ? (
                    <div className={cn(
                      "grid gap-3",
                      isMobile 
                        ? "grid-cols-3 gap-2" // Mobile: 3 columns, smaller gaps
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" // Desktop: original layout
                    )}>
                      {visibleItems.map((item, i) => (
                        <GameItemCard
                          key={item.id}
                          item={item}
                          viewMode={viewMode}
                          onClick={() => setSelectedItem(item)}
                          priority={i < 12} // First 12 items get priority loading
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleItems.map((item, i) => (
                        <GameItemCard
                          key={item.id}
                          item={item}
                          viewMode={viewMode}
                          onClick={() => setSelectedItem(item)}
                          priority={i < 12}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {collectionStats.hasMore && (
                    <div className="flex justify-center pt-8 pb-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className={cn(
                          "px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2",
                          loadingMore 
                            ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl"
                        )}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading More Ekos...
                          </>
                        ) : (
                          <>
                            Load More ({collectionStats.remainingItems} remaining)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-slate-500" />
                  </div>
                  <h3 className="text-white mb-1">No items found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'registry' && (
            <div className="text-center py-20">
              <h3 className="text-white mb-2">Registry</h3>
              <p className="text-slate-500 text-sm">Collection registry data is coming soon.</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-3">About The Scavenjers</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                      Intro Eko collection for the Scavenjer game ecosystem. This catalog is arranged for player inventory,
                      rarity, traits, and future gameplay integrations across Scavenjer experiences.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Total Supply</span>
                    <div className="text-white font-medium">{collectionInfo.totalSupply.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Status</span>
                    <div className="text-white font-medium">{collectionInfo.statusLabel}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Creator</span>
                    <div className="text-white font-medium">{collectionInfo.creator}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Collection ID</span>
                    <div className="text-white font-medium">{CURATED_COLLECTION_ID}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square bg-slate-700/30 rounded-xl overflow-hidden">
                  <OptimizedImage
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    priority={true}
                    size="large"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Collection</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">The Scavenjers</span>
                      <Badge size={16} className="text-cyan-400" />
                    </div>
                  </div>

                  {/* Traits */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Traits</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(selectedItem.attributes || []).map((trait, index) => (
                        <div
                          key={`${trait.trait_type}-${trait.value}-${index}`}
                          className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                        >
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            {trait.trait_type}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {trait.value}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {collectionTraits[trait.trait_type?.trim()]?.[trait.value?.trim() === '' || trait.value?.toLowerCase() === 'blank' ? 'None' : trait.value?.trim()] || 0} have this trait
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

function gameItemToCardData(item: GameCollectionItem): GameItemCardData {
  return {
    id: item.image_id,
    name: item.name,
    image: item.image || item.thumbnail_url || '',
    description: item.description || undefined,
    attributes: (item.attributes || []).map((attribute) => ({
      trait_type: attribute.trait_type,
      value: attribute.value,
    })),
  };
}
