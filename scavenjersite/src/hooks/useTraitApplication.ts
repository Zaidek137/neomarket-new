import { useState } from 'react';
import { applyTraitToNFT, TraitApplicationResponse } from '../services/nft/traits';

interface UseTraitApplicationReturn {
  isApplying: boolean;
  error: string | null;
  applyTrait: (tokenId: string, traitId: string) => Promise<TraitApplicationResponse>;
}

export function useTraitApplication(): UseTraitApplicationReturn {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyTrait = async (tokenId: string, traitId: string): Promise<TraitApplicationResponse> => {
    try {
      setIsApplying(true);
      setError(null);

      const result = await applyTraitToNFT(tokenId, traitId);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply trait';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsApplying(false);
    }
  };

  return {
    isApplying,
    error,
    applyTrait
  };
}