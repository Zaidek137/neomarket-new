# Server Setup Instructions

## 📁 File Location
You need to create a `.env` file in the `Neomarket/server/` directory.

## 🔧 Configuration Steps

### 1. Create `.env` file
In the `Neomarket/server/` directory, create a new file called `.env` with the following content:

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

### 2. Get Your Thirdweb Vault Credentials

#### Step 2.1: Create Thirdweb Account
1. Go to [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Create an account or sign in

#### Step 2.2: Get Project Credentials
1. In your Thirdweb dashboard, go to **Settings** → **API Keys**
2. Copy your **Client ID** and **Secret Key**
3. Replace `your_thirdweb_client_id_here` and `your_thirdweb_secret_key_here` in the `.env` file

#### Step 2.3: Create a Vault
1. Go to [https://portal.thirdweb.com/vault](https://portal.thirdweb.com/vault)
2. Click **"Create Vault"** 
3. Follow the setup wizard to bootstrap your Vault
4. This will generate an **Admin Key** for your Vault

#### Step 2.4: Get Admin Key
1. During Vault creation, you'll receive an **Admin Key**
2. **IMPORTANT**: Save this key securely - it cannot be recovered!
3. Replace `your_vault_admin_key_here` in the `.env` file

#### Step 2.5: Create Server Wallet (EOA)
1. Use the Vault SDK to create a new wallet (EOA) inside your Vault
2. This wallet will be used for signing transactions
3. Copy the **wallet address**
4. Replace `0x1234567890123456789012345678901234567890` in the `.env` file
5. **Important**: This wallet will need USDT tokens to send rewards!

### 3. Fund Your Server Wallet
Your server wallet needs USDT tokens to send as rewards:

1. **Get USDT on Polygon**: 
   - Contract: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
   - You can buy USDT on exchanges and transfer to Polygon
   - Or use bridges like Polygon Bridge

2. **Send USDT to your server wallet address**

### 4. Install Dependencies and Start Server

```bash
cd server
npm install
npm run dev
```

### 5. Test the Setup

The server should start on `http://localhost:3001`. You can test it by visiting:
- `http://localhost:3001/health` - Should return server status
- `http://localhost:3001/api/exchange/server-wallet` - Should return your wallet address

## 🔐 Security Notes

- **Never commit your `.env` file** to version control
- **Keep your access tokens secure**
- **Use environment-specific configurations** for production
- **Consider using a dedicated server wallet** separate from your main wallet

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing environment variables" error**
   - Check that all required variables are set in `.env`
   - Ensure no typos in variable names

2. **"Failed to initialize server wallet" error**
   - Verify your Vault ID and Access Token are correct
   - Check that the Vault is properly configured

3. **"Insufficient funds" error**
   - Ensure your server wallet has enough USDT tokens
   - Check that you're using the correct USDT contract address

### Getting Help:

- Check the server logs for detailed error messages
- Verify your Thirdweb dashboard shows the Vault as active
- Test your API keys with Thirdweb's documentation examples
