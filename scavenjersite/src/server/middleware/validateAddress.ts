import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

export function validateAddress(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { address } = req.params;

  if (!address || !ethers.utils.isAddress(address)) {
    return res.status(400).json({
      error: 'Invalid Ethereum address'
    });
  }

  next();
}