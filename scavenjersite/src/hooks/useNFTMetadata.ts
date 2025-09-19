import { useState } from 'react';
import { updateTokenMetadata, validateMetadataURI, MetadataUpdateResponse } from '../services/nft/metadata';

interface UseNFTMetadataReturn {
  isUpdating: boolean;
  error: string | null;
  updateMetadata: (tokenId: string, newURI: string) => Promise<MetadataUpdateResponse>;
  validateURI: (uri: string) => Promise<boolean>;
}

export function useNFTMetadata(): UseNFTMetadataReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMetadata = async (tokenId: string, newURI: string): Promise<MetadataUpdateResponse> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Validate URI before attempting update
      const isValid = await validateMetadataURI(newURI);
      if (!isValid) {
        throw new Error('Invalid metadata URI format');
      }

      const result = await updateTokenMetadata(tokenId, newURI);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update metadata';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const validateURI = async (uri: string): Promise<boolean> => {
    try {
      return await validateMetadataURI(uri);
    } catch {
      return false;
    }
  };

  return {
    isUpdating,
    error,
    updateMetadata,
    validateURI
  };
}