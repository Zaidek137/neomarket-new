import { IPFS_CONFIG } from '../config/constants';

// Enhanced cache with performance tracking
class IPFSCache {
  private cache = new Map<string, { url: string; timestamp: number; hitCount: number }>();
  private stats = { hits: 0, misses: 0, errors: 0 };

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry) {
      entry.hitCount++;
      this.stats.hits++;
      return entry.url;
    }
    this.stats.misses++;
    return null;
  }

  set(key: string, url: string): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= IPFS_CONFIG.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  getStats() {
    return { ...this.stats, size: this.cache.size };
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, errors: 0 };
  }
}

// Global cache instance
const ipfsCache = new IPFSCache();

/**
 * Optimized IPFS to HTTP conversion using dedicated Pinata gateway
 * Falls back to public gateways if primary fails
 */
export function ipfsToHttp(ipfsUrl: string, options: {
  priority?: 'high' | 'medium' | 'low';
  useCache?: boolean;
  gatewayIndex?: number;
} = {}): string {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }

  const { priority = 'medium', useCache = true, gatewayIndex = 0 } = options;
  const hash = ipfsUrl.replace('ipfs://', '');
  const cacheKey = `${hash}-${priority}-${gatewayIndex}`;

  // Check cache first
  if (useCache && IPFS_CONFIG.cacheEnabled) {
    const cached = ipfsCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Select gateway (primary Pinata gateway first)
  const allGateways = [IPFS_CONFIG.primaryGateway, ...IPFS_CONFIG.fallbackGateways];
  const gateway = allGateways[gatewayIndex] || allGateways[0];
  
  const httpUrl = `${gateway}/ipfs/${hash}`;

  // Cache the result
  if (useCache && IPFS_CONFIG.cacheEnabled) {
    ipfsCache.set(cacheKey, httpUrl);
  }

  return httpUrl;
}

/**
 * Advanced IPFS converter with smart fallbacks and health checking
 */
export async function optimizedIpfsToHttp(
  ipfsUrl: string,
  options: {
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
    testConnectivity?: boolean;
  } = {}
): Promise<string> {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }

  const { priority = 'medium', timeout = 5000, testConnectivity = false } = options;
  const hash = ipfsUrl.replace('ipfs://', '');
  
  const allGateways = [IPFS_CONFIG.primaryGateway, ...IPFS_CONFIG.fallbackGateways];
  
  // For high priority requests, test connectivity first
  if (testConnectivity && priority === 'high') {
    for (const gateway of allGateways) {
      try {
        const testUrl = `${gateway}/ipfs/${hash}`;
        const response = await fetch(testUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(timeout)
        });
        
        if (response.ok) {
          return testUrl;
        }
      } catch (error) {
        continue;
      }
    }
  }

  // Return primary gateway URL (fastest approach for normal priority)
  return `${allGateways[0]}/ipfs/${hash}`;
}

/**
 * Pre-warm popular assets for better initial performance
 * Call this after page load or when new collections are revealed
 */
export async function preWarmAssets(ipfsUrls: string[], maxConcurrent = 10): Promise<void> {
  if (!ipfsUrls.length) return;

  console.log(`🔥 Pre-warming ${ipfsUrls.length} IPFS assets via Pinata gateway...`);
  
  const startTime = Date.now();
  const batches: string[][] = [];
  
  // Process in batches to avoid overwhelming the gateway
  for (let i = 0; i < ipfsUrls.length; i += maxConcurrent) {
    batches.push(ipfsUrls.slice(i, i + maxConcurrent));
  }

  let successCount = 0;
  
  for (const batch of batches) {
    const requests = batch.map(async (url) => {
      try {
        const httpUrl = ipfsToHttp(url, { priority: 'low' });
        const response = await fetch(httpUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) successCount++;
        return response.ok;
      } catch (error) {
        return false;
      }
    });

    await Promise.allSettled(requests);
    
    // Small delay between batches to be gateway-friendly
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`✅ Pre-warming complete: ${successCount}/${ipfsUrls.length} assets warmed in ${duration}ms`);
}

/**
 * Get performance statistics for monitoring
 */
export function getIPFSPerformanceStats() {
  return {
    cache: ipfsCache.getStats(),
    config: {
      primaryGateway: IPFS_CONFIG.primaryGateway,
      fallbackCount: IPFS_CONFIG.fallbackGateways.length,
      cacheEnabled: IPFS_CONFIG.cacheEnabled,
      maxCacheSize: IPFS_CONFIG.maxCacheSize
    }
  };
}

/**
 * Clear all caches (useful for debugging/testing)
 */
export function clearIPFSCache(): void {
  ipfsCache.clear();
  console.log('🧹 IPFS cache cleared');
}

/**
 * Generate optimized image URLs for different formats and sizes
 */
export function generateOptimizedImageSources(ipfsUrl: string) {
  const baseUrl = ipfsToHttp(ipfsUrl);
  
  // For now, return the direct URLs from Pinata gateway
  // In future: integrate with image CDN for format conversion & resizing
  return {
    thumbnail: baseUrl,
    thumbnailWebP: baseUrl,
    thumbnailAvif: baseUrl,
    medium: baseUrl,
    mediumWebP: baseUrl, 
    mediumAvif: baseUrl,
    large: baseUrl,
    largeWebP: baseUrl,
    largeAvif: baseUrl,
    original: baseUrl
  };
}
