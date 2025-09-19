import { getNFTContract } from '../config/thirdweb';
import { NFT } from '../types/nft';
import { logger } from '../utils/logger';

export async function fetchOwnedNFTs(address: string): Promise<NFT[]> {
  try {
    logger.info('nft', 'Fetching owned NFTs for address:', address);
    
    const contract = await getNFTContract();
    const ownedNFTs = await contract.erc721.getOwned(address);
    
    const transformedNFTs = ownedNFTs.map(nft => ({
      id: nft.metadata.id,
      name: nft.metadata.name || `NFT #${nft.metadata.id}`,
      image: nft.metadata.image || '',
      description: nft.metadata.description || '',
      attributes: nft.metadata.attributes || []
    }));

    logger.info('nft', `Found ${transformedNFTs.length} NFTs for address:`, address);
    
    return transformedNFTs;
  } catch (error) {
    logger.error('nft', 'Failed to fetch owned NFTs:', error);
    throw error;
  }
}