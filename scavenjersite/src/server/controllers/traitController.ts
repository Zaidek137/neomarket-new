import { create } from 'ipfs-http-client';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { CHAIN_ID, CONTRACT_ADDRESS } from '../../config/constants';

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
const sdk = new ThirdwebSDK("polygon");

export async function applyTrait(tokenId: string, traitId: string) {
  try {
    // Get contract instance
    const contract = await sdk.getContract(CONTRACT_ADDRESS);

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

    // Upload updated metadata to IPFS
    const { cid } = await ipfs.add(JSON.stringify(updatedMetadata));
    const metadataUri = `ipfs://${cid}`;

    // Update token URI on blockchain
    const tx = await contract.erc721.setTokenURI(tokenId, metadataUri);
    await tx.wait();

    return {
      success: true,
      message: 'Trait applied successfully',
      metadataUri,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Error applying trait:', error);
    throw error;
  }
}