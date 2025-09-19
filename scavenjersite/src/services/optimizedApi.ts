import { API_BASE_URL } from '../config/constants';
import { apiCache, abiCache } from './cache';
import { requestDeduplicator } from './requestDeduplicator';
import { logger } from '../utils/logger';

interface RequestOptions extends RequestInit {
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch wrapper with caching, retry logic, and error handling
 */
export async function optimizedFetch<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    cache = true,
    cacheKey = url,
    cacheTTL,
    retry = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  // Check cache first
  if (cache && fetchOptions.method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      logger.debug('network', 'Cache hit', { url, cacheKey });
      return cached;
    }
  }

  // Use request deduplicator for GET requests
  if (fetchOptions.method === 'GET' || !fetchOptions.method) {
    return requestDeduplicator.execute(cacheKey, async () => {
      const result = await fetchWithRetry(url, fetchOptions, retry, retryDelay);
      
      // Cache successful GET responses
      if (cache) {
        apiCache.set(cacheKey, result, cacheTTL);
      }
      
      return result;
    });
  }

  // For non-GET requests, execute directly
  return fetchWithRetry(url, fetchOptions, retry, retryDelay);
}

/**
 * Fetch with automatic retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number,
  delay: number
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.message || `Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('network', 'Request successful', { url, attempt: i + 1 });
      return data;

    } catch (error) {
      lastError = error as Error;
      logger.warn('network', `Request failed (attempt ${i + 1}/${retries + 1})`, {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

/**
 * Optimized asset fetching
 */
export async function fetchAssets(address: string) {
  return optimizedFetch(`${API_BASE_URL}/assets/${address}`, {
    cacheKey: `assets-${address}`,
    cacheTTL: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Optimized trait application
 */
export async function applyTraitToNFT(
  tokenId: string,
  traitId: string,
  userAddress: string
) {
  return optimizedFetch(`${API_BASE_URL}/traits/apply`, {
    method: 'POST',
    cache: false, // Don't cache mutations
    headers: {
      'x-user-address': userAddress,
    },
    body: JSON.stringify({ tokenId, traitId }),
  });
}

/**
 * Fetch and cache ABI files
 */
export async function fetchABI(filename: string): Promise<any> {
  const cacheKey = `abi-${filename}`;
  
  // Check cache first
  const cached = abiCache.get(cacheKey);
  if (cached) {
    logger.debug('network', 'ABI cache hit', { filename });
    return cached;
  }

  // Fetch ABI
  const abi = await optimizedFetch(`/${filename}`, {
    cache: false, // We'll use our own ABI cache
  });

  // Cache for 1 hour
  abiCache.set(cacheKey, abi);
  return abi;
}

/**
 * Clear all caches
 */
export function clearCaches() {
  apiCache.clear();
  abiCache.clear();
  requestDeduplicator.clear();
}
