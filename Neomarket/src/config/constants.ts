import { NATIVE_TOKEN_ADDRESS } from "thirdweb";

export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "dc56b7276133338ec60eebc93d1c38b1";
export const THIRDWEB_SECRET_KEY = import.meta.env.VITE_THIRDWEB_SECRET_KEY;

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'
);

export const CONTRACT_ADDRESS = "0x6649564Bf8992dbA38D24946FB95Acb1953610DE";
export const NFT_COLLECTION_ADDRESS = "0x45a5A7F0c407F8178B138C74906bed90414fC923";

// Currency Addresses on Polygon Mainnet
export const WMATIC_ADDRESS = NATIVE_TOKEN_ADDRESS;
export const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export { NATIVE_TOKEN_ADDRESS };

// Chain configuration
export const CHAIN_ID = 137;
export const NETWORK_CONFIG = {
  name: 'Polygon Mainnet',
  chainId: CHAIN_ID,
  currency: 'MATIC',
  rpcUrl: 'https://polygon-rpc.com',
  blockExplorer: 'https://polygonscan.com',
  testnet: false,
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

// Debug configuration
export const DEBUG = {
  logNetworkCalls: true,
  logContractCalls: true,
  logWalletEvents: true,
  logErrors: true
};

// ThirdWeb configuration
export const THIRDWEB_CONFIG = {
  supportedChains: ["polygon"],
  dAppMeta: {
    name: "NeoMarket",
    description: "Your gateway to exclusive Eko collections and digital collectibles.",
    logoUrl: "https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675",
    url: window.location.origin,
    isDarkMode: true
  },
  walletConnectors: {
    metamask: { recommended: true },
    coinbase: true,
    walletConnect: true
  }
};