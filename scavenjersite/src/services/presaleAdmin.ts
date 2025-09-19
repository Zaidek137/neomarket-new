import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Initialize Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface PresaleSignupData {
  id: number;
  email: string;
  wallet_address: string;
  amount_interested: number | null;
  status: string;
  created_at: string;
}

// Admin function to get all presale signups
export async function getAllPresaleSignups(): Promise<PresaleSignupData[]> {
  try {
    const { data, error } = await supabase
      .from('presale_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('presaleAdmin', 'Failed to fetch presale signups:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('presaleAdmin', 'Error in getAllPresaleSignups:', error);
    throw error;
  }
}

// Admin function to export presale signups as CSV
export async function exportPresaleSignupsCSV(): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('export_presale_signups_csv');

    if (error) {
      logger.error('presaleAdmin', 'Failed to export presale signups:', error);
      throw error;
    }

    // Join all lines with newlines
    return data.map((row: { csv_line: string }) => row.csv_line).join('\n');
  } catch (error) {
    logger.error('presaleAdmin', 'Error in exportPresaleSignupsCSV:', error);
    throw error;
  }
}

// Admin function to update presale signup status
export async function updatePresaleSignupStatus(
  id: number, 
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('presale_signups')
      .update({ status })
      .eq('id', id);

    if (error) {
      logger.error('presaleAdmin', 'Failed to update presale signup status:', error);
      throw error;
    }

    logger.info('presaleAdmin', `Updated presale signup ${id} status to ${status}`);
  } catch (error) {
    logger.error('presaleAdmin', 'Error in updatePresaleSignupStatus:', error);
    throw error;
  }
}

// Helper function to download CSV
export function downloadCSV(csvContent: string, filename: string = 'presale_signups.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
