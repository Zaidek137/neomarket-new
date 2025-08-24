import { useState, useMemo } from 'react';
import CategoryFilters from './CategoryFilters';
import CollectionSpotlight from './CollectionSpotlight';
import NFTGrid from './NFTGrid';
import FeaturedCollections from './FeaturedCollections';
import VotingHighlight from './VotingHighlight';
import AxiumCard from './AxiumCard';
import MusicCard from './MusicCard';
import { useNeoMarket } from '../../hooks/useNeoMarket';
import { useCryptoPrice } from '../../hooks/useCryptoPrice';

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { listings, loading } = useNeoMarket();
  const { polPrice: maticPrice } = useCryptoPrice();

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
    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-8 sm:space-y-10 lg:space-y-14 max-w-full overflow-hidden">
      {/* Category Filters */}
      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Collection Spotlight */}
      <CollectionSpotlight />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Information Section */}
      <div className="space-y-6">
        {/* Category Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Information</h2>
          <p className="text-slate-400 text-sm">Stay updated with the latest from the Scavenjer ecosystem</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <VotingHighlight />
          <AxiumCard />
          <MusicCard />
        </div>
      </div>

      {/* NFT Grid */}
      <NFTGrid 
        nfts={nfts} 
        loading={loading}
        onLoadMore={() => {
          // Mock infinite scroll
          console.log('Loading more NFTs...');
        }}
      />
    </div>
  );
}
