import { useState, useEffect } from 'react';

// Simple in-memory cache
const cache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCryptoPrice(tokenId = 'matic-network') {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      // Check cache first
      const cachedData = cache.get(tokenId);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        setPrice(cachedData.price);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
        if (!response.ok) {
          throw new Error(`Failed to fetch price data: ${response.statusText}`);
        }
        const data = await response.json();
        const usdPrice = data[tokenId]?.usd;

        if (usdPrice) {
          setPrice(usdPrice);
          cache.set(tokenId, { price: usdPrice, timestamp: Date.now() });
        } else {
          throw new Error(`Price not found for token: ${tokenId}`);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
    
    // Optional: set an interval to refetch periodically
    const interval = setInterval(fetchPrice, CACHE_DURATION);
    return () => clearInterval(interval);

  }, [tokenId]);

  return { price, loading, error };
} 