import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { THIRDWEB_CLIENT_ID, CONTRACT_ADDRESS, CHAIN_ID } from "../../config/constants";

const sdk = new ThirdwebSDK("polygon", {
  clientId: THIRDWEB_CLIENT_ID
});

const getContract = async () => {
  return await sdk.getContract(CONTRACT_ADDRESS);
};

export interface MetadataUpdateResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
}

export async function updateTokenMetadata(
  tokenId: string,
  newURI: string
): Promise<MetadataUpdateResponse> {
  try {
    const contract = await getContract();
    const result = await contract.erc721.setTokenURI(tokenId, newURI);
    
    return {
      success: true,
      message: "NFT metadata updated successfully",
      transactionHash: result.receipt.transactionHash,
    };
  } catch (error) {
    console.error("Failed to update NFT metadata:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update NFT metadata",
    };
  }
}

export async function validateMetadataURI(uri: string): Promise<boolean> {
  try {
    const response = await fetch(uri);
    const data = await response.json();
    
    // Basic validation of required metadata fields
    return !!(
      data.name &&
      data.description &&
      data.image &&
      typeof data.attributes === 'object'
    );
  } catch {
    return false;
  }
}