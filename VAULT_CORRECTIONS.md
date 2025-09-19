# Vault SDK Corrections

Based on the [Thirdweb Vault SDK documentation](https://portal.thirdweb.com/vault/sdk), I've made the following corrections to ensure proper implementation:

## 🔧 **Key Changes Made**

### 1. **Correct Package Installation**
- ✅ Added `@thirdweb-dev/vault-sdk` to dependencies
- ✅ Using the official Vault SDK instead of custom wallet creation

### 2. **Updated Environment Variables**
**OLD (Incorrect):**
```bash
THIRDWEB_VAULT_ID=your_vault_id_here
THIRDWEB_ACCESS_TOKEN=your_access_token_here
```

**NEW (Correct):**
```bash
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here
VAULT_ADMIN_KEY=your_vault_admin_key_here
```

### 3. **Proper Vault Client Initialization**
**OLD:**
```javascript
this.serverWallet = createVaultWallet({
  vaultId: serverWalletConfig.vaultId,
  accessToken: serverWalletConfig.accessToken,
});
```

**NEW:**
```javascript
export const vaultClient = await createVaultClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});
```

### 4. **Correct Transaction Signing**
**OLD:**
```javascript
const result = await sendTransaction({
  account,
  transaction: transferTx,
});
```

**NEW:**
```javascript
const result = await signTransaction({
  client: this.vaultClient,
  request: {
    auth: { adminKey: serverWalletConfig.adminKey },
    options: {
      from: this.serverWalletAddress,
      transaction: transferTx,
    },
  },
});
```

## 📋 **Required Environment Variables**

Create a `.env` file in the `server` directory with:

```bash
# Thirdweb Configuration
THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here

# Vault Configuration  
VAULT_ADMIN_KEY=your_vault_admin_key_here
SERVER_WALLET_ADDRESS=0x1234567890123456789012345678901234567890

# Contract Addresses
USDT_CONTRACT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🚀 **Setup Process**

### 1. Get Thirdweb Credentials
- Go to [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
- Get your **Client ID** and **Secret Key** from Settings → API Keys

### 2. Create Vault
- Go to [https://portal.thirdweb.com/vault](https://portal.thirdweb.com/vault)
- Create a new Vault
- Save the **Admin Key** securely (cannot be recovered!)

### 3. Create Server Wallet
```bash
cd server
npm install
node create-wallet.js
```
This will create a new EOA (wallet) in your Vault and show you the address.

### 4. Fund Your Wallet
Send USDT tokens to the generated wallet address on Polygon.

### 5. Start Server
```bash
npm run dev
```

## 🔐 **Security Benefits**

- **TEE Protection**: Private keys secured in AWS Nitro Enclaves
- **Non-custodial**: Keys never exposed, even to your server
- **Programmatic Signing**: Server can sign without key access
- **Admin Controls**: Granular permissions via admin keys

## 📚 **Documentation References**

- [Vault SDK Installation](https://portal.thirdweb.com/vault/sdk/installation)
- [Vault SDK Overview](https://portal.thirdweb.com/vault/sdk)
- [Creating EOAs Guide](https://portal.thirdweb.com/vault/sdk/guides/creating-managing-eoas)
- [Signing Transactions Guide](https://portal.thirdweb.com/vault/sdk/guides/signing-transactions-messages)

## ✅ **Verification Steps**

1. **Environment Check**: All required env vars are set
2. **Vault Connection**: `createVaultClient` succeeds
3. **Wallet Creation**: `create-wallet.js` runs successfully  
4. **Server Start**: Server starts without errors on port 3001
5. **API Test**: `/health` endpoint returns success

The implementation now follows the official Vault SDK patterns and should work correctly with Thirdweb's infrastructure!
