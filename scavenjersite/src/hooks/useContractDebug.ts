import { useState, useEffect } from 'react';
import { debugUtils } from '../utils/debugUtils';
import { logger } from '../utils/logger';

export function useContractDebug() {
  const [isValidating, setIsValidating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    sdkConfigured: boolean;
    rpcConnected: boolean;
    chainIdValid: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDebugChecks = async () => {
    try {
      setIsValidating(true);
      setError(null);

      // Log SDK configuration
      debugUtils.logSDKConfiguration();

      // Test RPC connection
      const rpcConnected = await debugUtils.testRPCConnection();
      if (!rpcConnected) {
        throw new Error('RPC connection failed');
      }

      // Validate chain ID
      const chainIdValid = await debugUtils.validateChainId();
      if (!chainIdValid) {
        throw new Error('Chain ID mismatch');
      }

      setDebugInfo({
        sdkConfigured: true,
        rpcConnected,
        chainIdValid
      });

      logger.info('contract', 'Debug checks passed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Debug checks failed';
      setError(message);
      logger.error('contract', 'Debug checks failed', err);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runDebugChecks();
  }, []);

  return {
    isValidating,
    debugInfo,
    error,
    rerunChecks: runDebugChecks
  };
}