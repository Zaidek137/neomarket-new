export interface GameCollectionAttribute {
  trait_id: string;
  category_id: string;
  trait_type: string;
  value: string;
  confidence?: number;
  source?: string;
}

export type GameRarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface GameCollectionItem {
  image_record_id: string;
  collection_id: string;
  collection_name: string;
  generation_id: string;
  image_id: string;
  name: string;
  description: string | null;
  image: string | null;
  thumbnail_url: string | null;
  alt_text: string | null;
  rarity_score: number | null;
  rarity_rank: number | null;
  rarity_tier: GameRarityTier | string;
  attributes: GameCollectionAttribute[];
  metadata: Record<string, unknown>;
}
