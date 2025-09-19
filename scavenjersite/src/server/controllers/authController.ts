import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { AUTH_CONFIG } from '../config/auth';
import { logger } from '../../utils/logger';

export async function authenticate(req: Request, res: Response) {
  try {
    const { userId, signature } = req.body;

    // Validate user ID format (e.g., Ethereum address)
    if (!ethers.utils.isAddress(userId)) {
      logger.warn('Invalid address format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid address format'
      });
    }

    // Verify signature (implement your verification logic here)
    const isValidSignature = await verifySignature(userId, signature);
    if (!isValidSignature) {
      logger.warn('Invalid signature for address:', userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId, address: userId },
      AUTH_CONFIG.jwtSecret,
      { expiresIn: AUTH_CONFIG.jwtExpiresIn }
    );

    logger.info('Authentication successful for address:', userId);

    res.json({
      success: true,
      token,
      user: {
        address: userId
      }
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

// In-memory store for nonces (use Redis or database in production)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>();

function generateNonce(): string {
  return `Authenticate with Scavenjer: ${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

export async function getNonce(req: Request, res: Response) {
  try {
    const { address } = req.params;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format'
      });
    }
    
    const nonce = generateNonce();
    nonceStore.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now()
    });
    
    // Clean up old nonces (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [addr, data] of nonceStore.entries()) {
      if (data.timestamp < fiveMinutesAgo) {
        nonceStore.delete(addr);
      }
    }
    
    res.json({
      success: true,
      nonce
    });
  } catch (error) {
    logger.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate nonce'
    });
  }
}

async function verifySignature(address: string, signature: string): Promise<boolean> {
  try {
    const storedData = nonceStore.get(address.toLowerCase());
    
    if (!storedData) {
      logger.warn('No nonce found for address:', address);
      return false;
    }
    
    // Check if nonce is expired (5 minutes)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
      logger.warn('Nonce expired for address:', address);
      nonceStore.delete(address.toLowerCase());
      return false;
    }
    
    // Verify the signature
    const recoveredAddress = ethers.utils.verifyMessage(storedData.nonce, signature);
    
    // Clear the nonce after use (one-time use)
    nonceStore.delete(address.toLowerCase());
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error('Signature verification failed:', error);
    return false;
  }
}