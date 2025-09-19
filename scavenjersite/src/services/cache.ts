/**
 * Simple in-memory cache with TTL support
 */
export class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL)
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Singleton instances for different cache types
export const abiCache = new Cache<any>(60 * 60 * 1000); // 1 hour for ABIs
export const apiCache = new Cache<any>(5 * 60 * 1000); // 5 minutes for API data
export const contractCache = new Cache<any>(30 * 1000); // 30 seconds for contract reads
