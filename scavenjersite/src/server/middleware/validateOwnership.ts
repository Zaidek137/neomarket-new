import { Request, Response, NextFunction } from 'express';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { CONTRACT_ADDRESS } from '../../config/constants';

const sdk = new ThirdwebSDK("polygon");

export async function validateOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tokenId } = req.body;
    const userAddress = req.headers['x-user-address'] as string;

    if (!userAddress) {
      return res.status(401).json({ error: 'User address not provided' });
    }

    // Get contract instance
    const contract = await sdk.getContract(CONTRACT_ADDRESS);

    // Check NFT ownership
    const owner = await contract.erc721.ownerOf(tokenId);
    
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Not the NFT owner' });
    }

    next();
  } catch (error) {
    next(error);
  }
}