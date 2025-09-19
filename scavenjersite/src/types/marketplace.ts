export interface MarketplaceListing {
  listingId: bigint;
  tokenId: bigint;
  quantity: bigint;
  pricePerToken: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  listingCreator: string;
  assetContract: string;
  currency: string;
  tokenType: number;
  status: number;
  reserved: boolean;
}

export interface MarketplaceAuction {
  auctionId: bigint;
  auctionCreator: string;
  assetContract: string;
  tokenId: bigint;
  quantity: bigint;
  currency: string;
  minimumBidAmount: bigint;
  buyoutBidAmount: bigint;
  timeBufferInSeconds: bigint;
  bidBufferBps: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  status: number;
}

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  background_color?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties?: Record<string, any>;
}

export interface EnrichedListing {
  listing: MarketplaceListing;
  metadata: NFTMetadata;
}

export interface EnrichedAuction {
  auction: MarketplaceAuction;
  metadata: NFTMetadata;
}

export interface SaleEvent {
  listingId: bigint;
  assetContract: string;
  lister: string;
  buyer: string;
  quantityBought: bigint;
  totalPricePaid: bigint;
}

export interface EnrichedSaleEvent {
  event: SaleEvent;
  metadata: NFTMetadata;
  blockTimestamp: number;
}
