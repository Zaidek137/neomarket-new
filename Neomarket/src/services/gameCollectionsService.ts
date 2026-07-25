import { API_BASE_URL } from '../config/constants';
import type { GameCollectionItem } from '../types/gameCollection';

const GAME_API_BASE_URL = import.meta.env.VITE_SCAVENJER_API_BASE_URL || API_BASE_URL;

interface ItemsResponse {
  success: boolean;
  items?: GameCollectionItem[];
  error?: string;
}

export async function fetchGameCollectionItems(
  collectionId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<GameCollectionItem[]> {
  const params = new URLSearchParams({
    collection_id: collectionId,
    limit: String(options.limit ?? 500),
    offset: String(options.offset ?? 0),
  });

  const response = await fetch(`${GAME_API_BASE_URL}/game/collection-items?${params.toString()}`);
  const result = await response.json() as ItemsResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to load game collection items');
  }

  return result.items || [];
}
