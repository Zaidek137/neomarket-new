// Ensure env is loaded even if this module is imported before index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
import { createThirdwebClient } from "thirdweb";

// Lazy initialization to ensure environment variables are loaded
let _client = null;
export function getClient() {
  if (!_client) {
    const clientId = process.env.THIRDWEB_CLIENT_ID;
    const secretKey = process.env.THIRDWEB_SECRET_KEY;

    console.log("🔍 Environment check:");
    console.log("- CLIENT_ID exists:", !!clientId);
    console.log("- SECRET_KEY exists:", !!secretKey);

    if (!clientId && !secretKey) {
      console.error("❌ Neither THIRDWEB_CLIENT_ID nor THIRDWEB_SECRET_KEY found in environment");
      console.error("🔧 Please check your .env file configuration");
      throw new Error("Missing Thirdweb credentials");
    }

    _client = createThirdwebClient({
      clientId,
      secretKey,
    });
  }
  return _client;
}

// For backward compatibility
export const client = new Proxy({}, {
  get(target, prop) {
    return getClient()[prop];
  }
});

// Engine configuration
export const engineConfig = {
  url: process.env.THIRDWEB_ENGINE_URL || "https://engine.thirdweb.com",
  accessToken: process.env.THIRDWEB_ACCESS_TOKEN,
  backendWalletAddress: process.env.SERVER_WALLET_ADDRESS,
};

// Server wallet configuration
export const serverWalletConfig = {
  walletAddress: process.env.SERVER_WALLET_ADDRESS,
};

// Contract configurations
export const contracts = {
  // USDT Contract (replace with actual USDT contract address)
  usdt: {
    address: process.env.USDT_CONTRACT_ADDRESS || "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT on Polygon
    chain: "polygon",
  },
  
  // Server wallet address for receiving NFTs
  serverWallet: process.env.SERVER_WALLET_ADDRESS,
};

// Reward configurations
export const rewardConfig = {
  // Default USDT decimals
  usdtDecimals: 6,
  
  // Gas settings
  gasSettings: {
    maxFeePerGas: "50000000000", // 50 gwei
    maxPriorityFeePerGas: "2000000000", // 2 gwei
  },
};
