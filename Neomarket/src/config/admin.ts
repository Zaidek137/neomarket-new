// Admin wallet addresses that can create proposals.
const normalizeWallet = (address: string | undefined): string => (address || '').trim().toLowerCase();

export const ADMIN_WALLETS = Array.from(
  new Set([
    import.meta.env.VITE_ADMIN_WALLET,
    import.meta.env.VITE_NEOMARKET_ADMIN_WALLET,
    ...(import.meta.env.VITE_ADMIN_WALLETS || '').split(','),
    ...(import.meta.env.VITE_NEOMARKET_ADMIN_WALLETS || '').split(','),
  ].map(normalizeWallet).filter(Boolean))
);

export function isAdminWallet(address: string | undefined): boolean {
  const normalizedAddress = normalizeWallet(address);
  if (!normalizedAddress) return false;
  return ADMIN_WALLETS.includes(normalizedAddress);
}
