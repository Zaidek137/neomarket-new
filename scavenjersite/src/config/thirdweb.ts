import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { THIRDWEB_CLIENT_ID, CONTRACT_ADDRESS, NETWORK_CONFIG } from "./constants";
import { logger } from "../utils/logger";

const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});

export const getNFTContract = () => {
  try {
    logger.info('contract', `Getting contract instance for ${NETWORK_CONFIG.name}`);

    const contract = getContract({
      client,
      chain: polygon,
      address: CONTRACT_ADDRESS,
    });

    logger.debug('contract', "Contract instance created successfully for address:", { address: CONTRACT_ADDRESS });

    return contract;
  } catch (error) {
    logger.error('contract', "Failed to get contract instance:", error as Error);
    throw new Error("Contract initialization failed");
  }
};

export async function validateContractConnection() {
  try {
    logger.info('contract', "Validating contract connection...");
    const contract = getNFTContract();
    
    // This is a placeholder for a read call to validate connection
    // For example, reading contract metadata or a simple public variable.
    // const metadata = await getNFT(contract, 0); // Example, might need adjustment
    
    logger.info('contract', "Contract connection appears to be valid (simulated check).");
    return true;
  } catch (error) {
    logger.error('contract', "Contract validation failed:", error as Error);
    return false;
  }
}