import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../config/constants';
import { logger } from './logger';

export interface NetworkStatus {
  chainId: number;
  name: string;
  isCorrectNetwork: boolean;
  blockNumber?: number;
  gasPrice?: string;
}

export class NetworkHandler {
  private provider: ethers.providers.Web3Provider | null = null;

  constructor() {
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
    }
  }

  async getCurrentNetwork(): Promise<NetworkStatus | null> {
    try {
      if (!this.provider) {
        throw new Error('No provider available');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      const status: NetworkStatus = {
        chainId: network.chainId,
        name: network.name,
        isCorrectNetwork: network.chainId === NETWORK_CONFIG.chainId,
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      };

      logger.debug('Network status:', status);
      return status;
    } catch (error) {
      logger.error('Failed to get network status:', error);
      return null;
    }
  }

  async promptNetworkSwitch(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('No Web3 provider found');
      }

      const chainIdHex = `0x${NETWORK_CONFIG.chainId.toString(16)}`;

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        return true;
      } catch (switchError: any) {
        // This error code indicates the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: NETWORK_CONFIG.name,
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.blockExplorer]
            }]
          });
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      logger.error('Failed to switch network:', error);
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const status = await this.getCurrentNetwork();
      if (!status) return false;

      if (!status.isCorrectNetwork) {
        logger.warn('Wrong network detected. Current:', status.chainId, 'Expected:', NETWORK_CONFIG.chainId);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Connection validation failed:', error);
      return false;
    }
  }
}

export const networkHandler = new NetworkHandler();