import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../../utils/logger';

export function validateRequestSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Request validation failed:', errors.array());
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  next();
}