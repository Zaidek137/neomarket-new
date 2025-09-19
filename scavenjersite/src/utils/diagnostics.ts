import { networkHandler } from './networkHandler';
import { contractIntegration } from './contractIntegration';
import { logger } from './logger';
import { errorTracker } from './errorTracker';
import { NETWORK_CONFIG } from '../config/constants';

export async function runDiagnostics() {
  logger.info('general', 'Starting system diagnostics');

  try {
    // Network checks
    const networkStatus = await networkHandler.getCurrentNetwork();
    if (!networkStatus) {
      throw new Error('Failed to get network status');
    }

    logger.info('network', 'Network diagnostics', {
      chainId: networkStatus.chainId,
      expectedChainId: NETWORK_CONFIG.chainId,
      blockNumber: networkStatus.blockNumber,
      gasPrice: networkStatus.gasPrice
    });

    // Contract checks
    const isContractInitialized = await contractIntegration.initialize();
    if (!isContractInitialized) {
      throw new Error('Contract initialization failed');
    }

    logger.info('contract', 'Contract diagnostics successful', {
      address: CONTRACT_ADDRESS,
      network: NETWORK_CONFIG.name
    });

    return {
      success: true,
      networkStatus,
      contractStatus: isContractInitialized
    };
  } catch (error) {
    errorTracker.trackError(error, 'diagnostics', {
      networkConfig: NETWORK_CONFIG,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Diagnostics failed'
    };
  }
}

export function getDiagnosticReport() {
  return {
    recentErrors: errorTracker.getRecentErrors(),
    networkLogs: logger.getLogsByContext('network'),
    contractLogs: logger.getLogsByContext('contract'),
    errorLogs: logger.getLogsByLevel('error')
  };
}