import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '../config/constants';
import { logger } from './logger';
import { errorTracker } from './errorTracker';
import { contractIntegration } from './contractIntegration';

export class ContractValidator {
  async validateContractMethods(): Promise<boolean> {
    try {
      const contract = contractIntegration.getContractInstance();
      
      // Check if getOwned method exists
      if (!contract.erc721?.getOwned) {
        logger.error('contract', 'getOwned method not found on contract', {
          address: CONTRACT_ADDRESS,
          availableMethods: Object.keys(contract.erc721 || {})
        });
        return false;
      }

      // Validate contract type
      const isERC721 = await this.isERC721Contract(contract);
      if (!isERC721) {
        logger.error('contract', 'Contract is not ERC721 compliant', {
          address: CONTRACT_ADDRESS
        });
        return false;
      }

      logger.info('contract', 'Contract validation successful', {
        address: CONTRACT_ADDRESS,
        network: NETWORK_CONFIG.name
      });

      return true;
    } catch (error) {
      errorTracker.trackError(error, 'contract-validation', {
        address: CONTRACT_ADDRESS,
        network: NETWORK_CONFIG.name
      });
      return false;
    }
  }

  private async isERC721Contract(contract: any): Promise<boolean> {
    try {
      // Check ERC721 interface support using supportsInterface
      const ERC721_INTERFACE_ID = '0x80ac58cd';
      const supportsERC721 = await contract.erc721.supportsInterface(ERC721_INTERFACE_ID);
      
      logger.debug('contract', 'ERC721 interface check', {
        supportsERC721,
        address: CONTRACT_ADDRESS
      });

      return supportsERC721;
    } catch (error) {
      logger.error('contract', 'Failed to check ERC721 interface', error);
      return false;
    }
  }

  async validateWalletAddress(address: string): Promise<boolean> {
    try {
      if (!address || !ethers.utils.isAddress(address)) {
        logger.error('contract', 'Invalid wallet address', { address });
        return false;
      }

      // Check if address has any NFTs
      const contract = contractIntegration.getContractInstance();
      const balance = await contract.erc721.balanceOf(address);
      
      logger.info('contract', 'Wallet validation successful', {
        address,
        balance: balance.toString()
      });

      return true;
    } catch (error) {
      errorTracker.trackError(error, 'wallet-validation', { address });
      return false;
    }
  }

  async getContractDetails(): Promise<{
    name: string;
    symbol: string;
    totalSupply: number;
    error?: string;
  }> {
    try {
      const contract = contractIntegration.getContractInstance();
      
      const [name, symbol, totalSupply] = await Promise.all([
        contract.erc721.name(),
        contract.erc721.symbol(),
        contract.erc721.totalSupply()
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.toNumber()
      };
    } catch (error) {
      errorTracker.trackError(error, 'contract-details');
      return {
        name: '',
        symbol: '',
        totalSupply: 0,
        error: error instanceof Error ? error.message : 'Failed to get contract details'
      };
    }
  }
}

export const contractValidator = new ContractValidator();