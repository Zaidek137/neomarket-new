import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Initialize Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface PresaleSignup {
  email: string;
  wallet_address?: string;
  amount_interested?: number;
}

export async function submitPresaleSignup(data: PresaleSignup) {
  try {
    const { error } = await supabase
      .from('presale_signups')
      .insert([{
        email: data.email,
        wallet_address: data.wallet_address || null,
        amount_interested: data.amount_interested || null
      }]);

    if (error) {
      logger.error('presale', 'Failed to submit presale signup:', error);
      throw new Error(error.message);
    }

    logger.info('presale', 'Successfully submitted presale signup:', {
      email: data.email,
      wallet: data.wallet_address ? `${data.wallet_address.slice(0, 6)}...` : undefined
    });

    return { success: true };
  } catch (error) {
    logger.error('presale', 'Error in submitPresaleSignup:', error);
    throw error;
  }
}

export async function checkPresaleStatus(email: string) {
  try {
    const { data, error } = await supabase
      .from('presale_signups')
      .select('status')
      .eq('email', email)
      .single();

    if (error) {
      logger.error('presale', 'Failed to check presale status:', error);
      throw error;
    }

    return data?.status || null;
  } catch (error) {
    logger.error('presale', 'Error in checkPresaleStatus:', error);
    throw error;
  }
}