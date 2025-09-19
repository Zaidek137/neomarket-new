import { NETWORK_CONFIG } from './constants';
import { logger } from '../utils/logger';

export async function validateNetwork(provider: any): Promise<boolean> {
  try {
    const chainId = await provider.request({ method: "eth_chainId" });
    const currentChainId = parseInt(chainId, 16);

    logger.debug('network', 'Network validation:', {
      current: currentChainId,
      required: NETWORK_CONFIG.chainId
    });

    return currentChainId === NETWORK_CONFIG.chainId;
  } catch (error) {
    logger.error('network', 'Network validation failed:', error);
    return false;
  }
}

export async function switchToConfiguredNetwork(provider: any): Promise<boolean> {
  try {
    const chainIdHex = `0x${NETWORK_CONFIG.chainId.toString(16)}`;
    
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }]
    });

    logger.info('network', `Successfully switched to ${NETWORK_CONFIG.name}`);
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.name,
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer]
          }]
        });
        return true;
      } catch (addError) {
        logger.error('network', 'Failed to add network:', addError as Error);
        return false;
      }
    }
    logger.error('network', 'Failed to switch network:', error as Error);
    return false;
  }
}