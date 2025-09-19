import dotenv from 'dotenv';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

dotenv.config();

// Ensure JWT secret is properly set
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'your-default-secret-key') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  } else {
    logger.warn('Using generated JWT secret for development. Set JWT_SECRET in .env for production');
  }
}

export const AUTH_CONFIG = {
  jwtSecret: jwtSecret || crypto.randomBytes(32).toString('hex'),
  jwtExpiresIn: '24h',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  bcryptRounds: 10,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

logger.debug('Auth configuration loaded', {
  expiresIn: AUTH_CONFIG.jwtExpiresIn,
  originsCount: AUTH_CONFIG.allowedOrigins.length,
  environment: process.env.NODE_ENV || 'development'
});