import { logger } from './logger';
import { supabase } from '../lib/supabaseClient';

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Basic JWT expiration check
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    logger.error('Error checking authentication status:', error);
    return false;
  }
}

export const getSupabaseToken = async () => {
  // For now, let's assume we store the token in localStorage
  // A more robust solution might involve a dedicated auth state manager
  let token = localStorage.getItem('supabase_jwt');

  // If we have a token and it's not expired, use it
  if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now() - 60000) { // check if expired, with 1min grace
            return token;
        }
    } catch (e) {
        console.error("Error parsing token, fetching new one", e);
        localStorage.removeItem('supabase_jwt');
    }
  }

  // If no valid token, you might need to trigger a sign-in flow.
  // For this example, we'll return null, and the logic in AuthButton will handle signing.
  // The fetch wrapper in supabaseClient will then proceed without the Authorization header.
  return null;
};

// This function will be called from AuthButton after connecting wallet
export const signInWithWallet = async (address: string, signMessage: (message: string) => Promise<string>) => {
    const { data, error } = await supabase.from('nonce').select('nonce').eq('address', address).single();

    let nonce;
    if (data) {
        nonce = data.nonce;
    } else {
        // If no nonce, create one
        const { data: newData, error: newNonceError } = await supabase.from('nonce').insert({ address: address }).select('nonce').single();
        if (newNonceError) {
            console.error("Error creating nonce:", newNonceError);
            return;
        }
        nonce = newData.nonce;
    }

    const signature = await signMessage(`Sign this message to authenticate with your wallet: ${nonce}`);

    const { data: authData, error: authError } = await supabase.rpc('login', {
        address,
        signature
    });

    if(authError) {
        console.error('Supabase login error:', authError);
        return;
    }

    if(authData?.token) {
        localStorage.setItem('supabase_jwt', authData.token);
        // also update nonce
        await supabase.from('nonce').update({nonce: `signed_${new Date().toISOString()}`}).eq('address', address)
    }
};