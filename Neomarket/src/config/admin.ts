// Admin wallet addresses that can create proposals
export const ADMIN_WALLETS = [
  "0xf8Ca9dA64Bb500C4C4395f7Bb987De3e77883130"
].map(addr => addr.toLowerCase());

export function isAdminWallet(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_WALLETS.includes(address.toLowerCase());
}
