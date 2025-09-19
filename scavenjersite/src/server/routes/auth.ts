import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, getNonce } from '../controllers/authController';
import { validateRequestSchema } from '../middleware/validateRequestSchema';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get nonce for authentication
router.get(
  '/nonce/:address',
  [
    param('address').isString().notEmpty(),
    validateRequestSchema
  ],
  getNonce
);

// Authenticate with signature
router.post(
  '/authenticate',
  authRateLimiter, // Apply rate limiting
  [
    body('userId').isString().notEmpty(),
    body('signature').isString().notEmpty(),
    validateRequestSchema
  ],
  authenticate
);

export const authRouter = router;