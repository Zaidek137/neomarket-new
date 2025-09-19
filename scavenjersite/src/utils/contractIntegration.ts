import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { CONTRACT_ADDRESS, THIRDWEB_CLIENT_ID, CHAIN_ID } from '../config/constants';
import { logger } from './logger';
import { networkHandler } from './networkHandler';

export class ContractIntegration {
  private sdk: ThirdwebSDK | null = null;
  private contract: any = null;

  async initialize(): Promise<boolean> {
    try {
      // Validate network connection first
      const isValid = await networkHandler.validateConnection();
      if (!isValid) {
        throw new Error('Invalid network connection');
      }

      // Initialize SDK
      this.sdk = new ThirdwebSDK("polygon", {
        clientId: THIRDWEB_CLIENT_ID,
      });

      // Get contract instance
      this.contract = await this.sdk.getContract(CONTRACT_ADDRESS);

      // Test contract connection
      const metadata = await this.contract.metadata.get();
      
      logger.info('contract', 'Contract integration successful', {
        address: CONTRACT_ADDRESS,
        name: metadata.name,
        chainId: CHAIN_ID
      });

      return true;
    } catch (error) {
      logger.error('contract', 'Contract integration failed', error);
      return false;
    }
  }

  async validateWalletConnection(address: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Verify wallet connection
      const balance = await this.contract.erc721.balanceOf(address);
      
      logger.info('contract', 'Wallet connection validated', {
        address,
        nftBalance: balance.toString()
      });

      return true;
    } catch (error) {
      logger.error('contract', 'Wallet validation failed', error);
      return false;
    }
  }

  async getNFTsForAddress(address: string) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const nfts = await this.contract.erc721.getOwned(address);
      
      logger.info('contract', 'Retrieved NFTs for address', {
        address,
        count: nfts.length
      });

      return nfts;
    } catch (error) {
      logger.error('contract', 'Failed to get NFTs', error);
      throw error;
    }
  }

  async updateTokenMetadata(tokenId: string, newURI: string) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.erc721.setTokenURI(tokenId, newURI);
      await tx.wait();

      logger.info('contract', 'Token metadata updated', {
        tokenId,
        newURI,
        txHash: tx.hash
      });

      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      logger.error('contract', 'Failed to update token metadata', error);
      throw error;
    }
  }

  getContractInstance() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }
}

export const contractIntegration = new ContractIntegration();