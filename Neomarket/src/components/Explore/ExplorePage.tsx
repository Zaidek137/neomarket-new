import React, { useState, useMemo } from 'react';
import CategoryFilters from './CategoryFilters';
import CollectionSpotlight from './CollectionSpotlight';
import NFTGrid from './NFTGrid';
import FeaturedCollections from './FeaturedCollections';
import VotingHighlight from './VotingHighlight';
import { useNeoMarket } from '../../hooks/useNeoMarket';
import { useCryptoPrice } from '../../hooks/useCryptoPrice';

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { listings, loading, error } = useNeoMarket();
  const { price: maticPrice } = useCryptoPrice('matic-network');

  // Transform listings to NFT format for the grid
  const nfts = useMemo(() => {
    return listings.map((listing) => ({
      id: parseInt(listing.id),
      name: listing.metadata.name,
      collection: 'The Scavenjers',
      image: listing.metadata.image,
      price: {
        amount: listing.price,
        currency: 'MATIC',
        usd: Math.floor(parseFloat(listing.price) * (maticPrice || 1))
      },
      likes: Math.floor(Math.random() * 100), // Mock likes for now
      verified: true,
      tokenId: listing.tokenId,
      seller: listing.seller
    }));
  }, [listings, maticPrice]);

  return (
    <div className="px-3 py-4 space-y-4 max-w-full overflow-hidden">
      {/* Category Filters */}
      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Collection Spotlight */}
      <CollectionSpotlight />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Voting Highlight */}
      <VotingHighlight />

      {/* NFT Grid */}
      <NFTGrid 
        nfts={nfts} 
        loading={loading}
        activeCategory={activeCategory}
        onLoadMore={() => {
          // Mock infinite scroll
          console.log('Loading more NFTs...');
        }}
      />
    </div>
  );
}
