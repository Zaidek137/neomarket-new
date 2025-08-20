import { useState, useEffect } from 'react';

export interface CryptoPrices {
  matic: number;
  ethereum: number;
  bitcoin: number;
  lastUpdated: number;
}

export function useCryptoPrice() {
  const [prices, setPrices] = useState<CryptoPrices>({
    matic: 0,
    ethereum: 0,
    bitcoin: 0,
    lastUpdated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using CoinGecko API for real-time prices
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=matic-network,ethereum,bitcoin&vs_currencies=usd'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();
      
      setPrices({
        matic: data['matic-network']?.usd || 0,
        ethereum: data.ethereum?.usd || 0,
        bitcoin: data.bitcoin?.usd || 0,
        lastUpdated: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      console.error('Error fetching crypto prices:', err);
      
      // Fallback to mock prices if API fails
      setPrices({
        matic: 0.85, // Fallback MATIC price
        ethereum: 2300,
        bitcoin: 45000,
        lastUpdated: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Update prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const convertToUSD = (amount: number, currency: 'matic' | 'ethereum' | 'bitcoin'): number => {
    return amount * prices[currency];
  };

  const formatPrice = (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  return {
    prices,
    polPrice: prices.matic, // Alias for backward compatibility
    loading,
    error,
    convertToUSD,
    formatPrice,
    refetch: fetchPrices
  };
}
