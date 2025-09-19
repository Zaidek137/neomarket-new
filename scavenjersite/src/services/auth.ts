import { logger } from '../utils/logger';
import { API_BASE_URL } from '../config/constants';

const API_URL = API_BASE_URL;

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    address: string;
  };
}

export async function authenticateUser(userId: string, signature: string): Promise<AuthResponse> {
  try {
    logger.info('Authenticating user:', userId);
    
    const response = await fetch(`${API_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();
    logger.info('Authentication successful for:', userId);
    
    return data;
  } catch (error) {
    logger.error('Authentication error:', error);
    throw error;
  }
}