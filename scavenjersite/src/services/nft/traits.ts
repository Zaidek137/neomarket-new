import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { THIRDWEB_CLIENT_ID, CONTRACT_ADDRESS, CHAIN_ID } from "../../config/constants";

const sdk = new ThirdwebSDK("polygon", {
  clientId: THIRDWEB_CLIENT_ID
}); 

const getContract = async () => {
  return await sdk.getContract(CONTRACT_ADDRESS);
};

export interface TraitApplicationResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
}

export async function applyTraitToNFT(
  tokenId: string,
  traitId: string
): Promise<TraitApplicationResponse> {
  try {
    const contract = await getContract();
    // Get current metadata
    const metadata = await contract.erc721.get(tokenId);
    
    // Update metadata with new trait
    const updatedMetadata = {
      ...metadata,
      attributes: [
        ...(metadata.attributes || []).filter(attr => attr.trait_type !== 'applied_trait'),
        { trait_type: 'applied_trait', value: traitId }
      ]
    };

    // Update token URI with new metadata
    const result = await contract.erc721.setTokenURI(tokenId, JSON.stringify(updatedMetadata));
    
    return {
      success: true,
      message: "Trait applied successfully",
      transactionHash: result.receipt.transactionHash,
    };
  } catch (error) {
    console.error("Failed to apply trait:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to apply trait",
    };
  }
}