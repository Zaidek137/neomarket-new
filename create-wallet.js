import dotenv from 'dotenv';
import { createVaultClient, createEoa } from "@thirdweb-dev/vault-sdk";

// Load environment variables
dotenv.config();

/**
 * Utility script to create a new wallet (EOA) in your Vault
 * Run this after setting up your .env file with THIRDWEB_SECRET_KEY and VAULT_ADMIN_KEY
 */
async function createServerWallet() {
  try {
    console.log("🔐 Creating server wallet in Vault...");

    // Initialize Vault client
    const vaultClient = await createVaultClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    // Create new EOA (wallet) in the Vault
    const { success, data: eoa } = await createEoa({
      client: vaultClient,
      request: {
        auth: { adminKey: process.env.VAULT_ADMIN_KEY },
        options: {
          metadata: { 
            purpose: "nft-exchange-server",
            description: "Server wallet for NFT exchange rewards"
          },
        },
      },
    });

    if (!success) {
      throw new Error("Failed to create EOA in Vault");
    }

    console.log("✅ Server wallet created successfully!");
    console.log("📋 Wallet Details:");
    console.log(`   Address: ${eoa.address}`);
    console.log(`   Purpose: ${eoa.metadata?.purpose}`);
    console.log("");
    console.log("🔧 Next Steps:");
    console.log("1. Update your .env file:");
    console.log(`   SERVER_WALLET_ADDRESS=${eoa.address}`);
    console.log("");
    console.log("2. Fund this wallet with USDT tokens on Polygon:");
    console.log(`   Send USDT to: ${eoa.address}`);
    console.log(`   USDT Contract: ${process.env.USDT_CONTRACT_ADDRESS || '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'}`);
    console.log("");
    console.log("3. Start your server:");
    console.log("   npm run dev");

  } catch (error) {
    console.error("❌ Error creating server wallet:", error.message);
    console.log("");
    console.log("🔍 Troubleshooting:");
    console.log("- Ensure THIRDWEB_SECRET_KEY is correct in your .env file");
    console.log("- Ensure VAULT_ADMIN_KEY is correct in your .env file");
    console.log("- Check that your Vault is properly set up");
    process.exit(1);
  }
}

// Run the script
createServerWallet();
