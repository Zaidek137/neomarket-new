export interface NFT {
  id: string;
  name: string;
  image: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface Trait {
  id: string;
  name: string;
  image: string;
  description: string;
  rarity: string;
}