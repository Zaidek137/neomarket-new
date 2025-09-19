import { ethers } from 'ethers';
import { logger } from './logger';
import { errorTracker } from './errorTracker';

export class ContractFallbacks {
  async getNFTsByBalance(contract: any, address: string) {
    try {
      logger.info('contract', 'Using balance fallback method');
      
      // Get total balance
      const balance = await contract.erc721.balanceOf(address);
      const totalBalance = balance.toNumber();
      
      if (totalBalance === 0) {
        return [];
      }

      // Fetch token IDs owned by address
      const ownedTokens = [];
      for (let i = 0; i < totalBalance; i++) {
        try {
          const tokenId = await contract.erc721.tokenOfOwnerByIndex(address, i);
          const tokenMetadata = await contract.erc721.get(tokenId);
          ownedTokens.push(tokenMetadata);
        } catch (error) {
          logger.error('contract', `Failed to fetch token at index ${i}`, error);
        }
      }

      logger.info('contract', 'Balance fallback successful', {
        address,
        tokensFound: ownedTokens.length
      });

      return ownedTokens;
    } catch (error) {
      errorTracker.trackError(error, 'balance-fallback');
      throw error;
    }
  }

  async validateTokenOwnership(contract: any, address: string, tokenId: string): Promise<boolean> {
    try {
      const owner = await contract.erc721.ownerOf(tokenId);
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('contract', 'Ownership validation failed', error);
      return false;
    }
  }

  async getTokenMetadata(contract: any, tokenId: string) {
    try {
      // Try URI method first
      try {
        const uri = await contract.erc721.tokenURI(tokenId);
        const response = await fetch(uri);
        if (response.ok) {
          return await response.json();
        }
      } catch (uriError) {
        logger.warn('contract', 'TokenURI fetch failed, trying direct metadata', uriError);
      }

      // Fallback to direct metadata
      return await contract.erc721.get(tokenId);
    } catch (error) {
      errorTracker.trackError(error, 'metadata-fallback');
      throw error;
    }
  }
}

export const contractFallbacks = new ContractFallbacks();