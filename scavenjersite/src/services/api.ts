import { CHAIN_ID, API_BASE_URL } from '../config/constants';

export async function fetchAssets(address: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${address}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch assets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

export async function applyTraitToNFT(tokenId: string, traitId: string, userAddress: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/traits/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-address': userAddress,
      },
      body: JSON.stringify({ tokenId, traitId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply trait');
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying trait:', error);
    throw error;
  }
}