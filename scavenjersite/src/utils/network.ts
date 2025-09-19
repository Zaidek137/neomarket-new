import { ethers } from "ethers";
import { NETWORK_CONFIG } from "../config/constants";
import { logger } from "./logger";

export async function validateNetwork(provider: any): Promise<boolean> {
  try {
    if (!provider) {
      throw new Error("No provider available");
    }

    const chainId = await provider.request({ method: "eth_chainId" });
    const currentChainId = parseInt(chainId, 16);

    logger.debug("Network validation:", {
      current: currentChainId,
      required: NETWORK_CONFIG.chainId
    });

    return currentChainId === NETWORK_CONFIG.chainId;
  } catch (error) {
    logger.error("Network validation failed:", error);
    return false;
  }
}

export async function switchToAmoyNetwork(provider: any): Promise<boolean> {
  try {
    const chainIdHex = `0x${NETWORK_CONFIG.chainId.toString(16)}`;
    
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });

    logger.info("Successfully switched to Amoy network");
    return true;
  } catch (error: any) {
    // Chain not added to MetaMask
    if (error.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.name,
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer]
          }]
        });
        
        logger.info("Successfully added Amoy network");
        return true;
      } catch (addError) {
        logger.error("Failed to add Amoy network:", addError);
        return false;
      }
    }
    
    logger.error("Failed to switch network:", error);
    return false;
  }
}

export function getProvider(): ethers.providers.Web3Provider | null {
  try {
    if (!window.ethereum) {
      throw new Error("No ethereum provider found");
    }
    return new ethers.providers.Web3Provider(window.ethereum);
  } catch (error) {
    logger.error("Failed to get provider:", error);
    return null;
  }
}

export async function testRPCConnection(): Promise<boolean> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    
    // Test basic connection by getting network
    const network = await provider.getNetwork();
    logger.info("RPC connection successful:", {
      chainId: network.chainId,
      name: network.name
    });

    // Verify chain ID matches expected
    if (network.chainId !== NETWORK_CONFIG.chainId) {
      throw new Error(`Chain ID mismatch. Expected ${NETWORK_CONFIG.chainId}, got ${network.chainId}`);
    }

    // Test block retrieval
    const blockNumber = await provider.getBlockNumber();
    logger.debug("Current block number:", blockNumber);

    return true;
  } catch (error) {
    logger.error("RPC connection test failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      rpcUrl: NETWORK_CONFIG.rpcUrl
    });
    return false;
  }
}

export async function getNetworkStatus(): Promise<{
  isConnected: boolean;
  blockNumber?: number;
  gasPrice?: string;
  error?: string;
}> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getGasPrice()
    ]);

    return {
      isConnected: true,
      blockNumber,
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Failed to get network status"
    };
  }
}