import { logger } from './logger';
import { NETWORK_CONFIG, THIRDWEB_CLIENT_ID } from '../config/constants';

export class DebugUtils {
  logSDKConfiguration() {
    logger.debug('contract', 'ThirdWeb SDK Configuration', {
      chainId: NETWORK_CONFIG.chainId,
      rpcUrl: NETWORK_CONFIG.rpcUrl,
      clientId: THIRDWEB_CLIENT_ID,
      networkName: NETWORK_CONFIG.name
    });
  }

  async testRPCConnection() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      logger.info('network', 'RPC Connection Test', {
        chainId: network.chainId,
        blockNumber,
        networkName: network.name
      });

      return true;
    } catch (error) {
      logger.error('network', 'RPC Connection Test Failed', error);
      return false;
    }
  }

  async validateChainId() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
      const network = await provider.getNetwork();
      
      const isValid = network.chainId === NETWORK_CONFIG.chainId;
      
      logger.info('network', 'Chain ID Validation', {
        expected: NETWORK_CONFIG.chainId,
        actual: network.chainId,
        isValid
      });

      return isValid;
    } catch (error) {
      logger.error('network', 'Chain ID Validation Failed', error);
      return false;
    }
  }
}

export const debugUtils = new DebugUtils();