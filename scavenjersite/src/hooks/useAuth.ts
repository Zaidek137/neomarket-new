import { useState, useCallback } from 'react';
// import { useWallet } from './useWallet';
import { authenticateUser } from '../services/auth';
import { logger } from '../utils/logger';

interface UseAuthReturn {
  isAuthenticating: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  // const { address, provider } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    // if (!address || !provider) {
    //   logger.warn('Cannot authenticate: wallet not connected');
    //   setError('Please connect your wallet first');
    //   return;
    // }

    try {
      setIsAuthenticating(true);
      setError(null);

      // Create message to sign
      const message = `Sign this message to authenticate with CyberVault\nNonce: ${Date.now()}`;
      
      // Get signer from provider
      // const signer = provider.getSigner();
      
      // Request signature from user
      // logger.info('Requesting signature from user:', address);
      // const signature = await signer.signMessage(message);

      // Authenticate with backend
      // const authResponse = await authenticateUser(address, signature);

      // if (!authResponse.success) {
      //   throw new Error('Authentication failed');
      // }

      // Store auth token
      // localStorage.setItem('auth_token', authResponse.token);
      // logger.info('Authentication successful');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      const errorObj = err instanceof Error ? err : new Error(String(err));
      logger.error('general', 'Authentication error:', errorObj);
      setError(errorMessage);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    isAuthenticating,
    error,
    authenticate
  };
}