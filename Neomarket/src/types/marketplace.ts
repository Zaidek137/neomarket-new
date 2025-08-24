export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface EnrichedListing {
  id: string;
  tokenId: string;
  price: string;
  currency: string;
  seller: string;
  metadata: NFTMetadata;
  listingType: 'direct' | 'auction';
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface EnrichedAuction {
  id: string;
  tokenId: string;
  startingPrice: string;
  currentBid: string;
  currency: string;
  seller: string;
  highestBidder: string;
  metadata: NFTMetadata;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'cancelled';
  bidCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage?: string;
  creator: string;
  verified: boolean;
  floorPrice: number;
  totalVolume: number;
  owners: number;
  totalSupply: number;
  createdAt: string;
}

export interface User {
  address: string;
  username?: string;
  avatar?: string;
  verified: boolean;
  joinedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: string;
  currency: string;
  timestamp: string;
  status: 'active' | 'outbid' | 'winning' | 'won';
}

export interface Activity {
  id: string;
  type: 'sale' | 'listing' | 'bid' | 'transfer' | 'mint';
  tokenId?: string;
  from: string;
  to: string;
  price?: string;
  currency?: string;
  timestamp: string;
  transactionHash: string;
}

// Rarity calculation interfaces and types
export interface TraitRarity {
  trait_type: string;
  value: string;
  count: number;
  percentage: number;
  rarity_score: number;
}

export interface NFTRarity {
  tokenId: string;
  name: string;
  overall_rarity_score: number;
  overall_rarity_rank: number;
  rarity_tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  trait_rarities: TraitRarity[];
  total_traits: number;
}

export interface CollectionRarityData {
  total_supply: number;
  trait_counts: { [trait_type: string]: { [value: string]: number } };
  nft_rarities: { [tokenId: string]: NFTRarity };
  rarity_tiers: {
    [tier: string]: {
      min_percentile: number;
      max_percentile: number;
      count: number;
    };
  };
}