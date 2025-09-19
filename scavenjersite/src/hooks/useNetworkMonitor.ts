import { useState, useEffect, useCallback } from 'react';
import { networkHandler, NetworkStatus } from '../utils/networkHandler';
import { contractIntegration } from '../utils/contractIntegration';
import { logger } from '../utils/logger';
import { NETWORK_CONFIG } from '../config/constants';

export function useNetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetwork = useCallback(async () => {
    try {
      const status = await networkHandler.getCurrentNetwork();
      setNetworkStatus(status);

      if (status && !status.isCorrectNetwork) {
        setError(`Please switch to ${NETWORK_CONFIG.name} network`);
        const switched = await networkHandler.promptNetworkSwitch();
        if (switched) {
          // Reinitialize contract after network switch
          await contractIntegration.initialize();
          setError(null);
        }
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network check failed');
      logger.error('network', 'Network monitor error', err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    checkNetwork();
    const interval = setInterval(checkNetwork, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isMonitoring, checkNetwork]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  return {
    networkStatus,
    error,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkNetwork
  };
}