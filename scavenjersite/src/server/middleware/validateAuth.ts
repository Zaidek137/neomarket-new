import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';
import { logger } from '../../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    address: string;
  };
}

export function validateAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, AUTH_CONFIG.jwtSecret);
    req.user = decoded as { userId: string; address: string };
    
    logger.debug('Token validated for user:', req.user.address);
    next();
  } catch (error) {
    logger.error('Token validation failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}