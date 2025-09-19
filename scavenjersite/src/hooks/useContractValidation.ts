import { useState, useEffect } from 'react';
import { contractValidator } from '../utils/contractValidator';
// import { useWallet } from './useWallet';
import { logger } from '../utils/logger';

export function useContractValidation() {
  // const { address, isConnected } = useWallet();
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractDetails, setContractDetails] = useState<{
    name: string;
    symbol: string;
    totalSupply: number;
  } | null>(null);

  useEffect(() => {
    const validateContract = async () => {
      // if (!isConnected || !address) {
      //   setIsValid(false);
      //   setError('Wallet not connected');
      //   return;
      // }

      try {
        setIsValidating(true);
        setError(null);

        // Validate contract methods
        const isMethodsValid = await contractValidator.validateContractMethods();
        if (!isMethodsValid) {
          throw new Error('Contract validation failed');
        }

        // Validate wallet address
        // const isWalletValid = await contractValidator.validateWalletAddress(address);
        // if (!isWalletValid) {
        //   throw new Error('Wallet validation failed');
        // }

        // Get contract details
        const details = await contractValidator.getContractDetails();
        if (details.error) {
          throw new Error(details.error);
        }

        setContractDetails(details);
        setIsValid(true);
        logger.info('contract', 'Contract validation successful', {
          // address,
          contractName: details.name
        });

      } catch (err) {
        setIsValid(false);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj.message);
        logger.error('contract', 'Contract validation failed', errorObj);
      } finally {
        setIsValidating(false);
      }
    };

    validateContract();
  }, []);

  return {
    isValid,
    isValidating,
    error,
    contractDetails
  };
}