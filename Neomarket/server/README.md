# NFT Exchange Server

Backend server for handling NFT exchanges using Thirdweb Vault and server wallets.

## Features

- **Server-side NFT Processing**: Uses Thirdweb Vault for secure key management
- **Automated USDT Rewards**: Automatically sends USDT rewards upon NFT transfer
- **Multi-Collection Support**: Handle NFTs from different collections
- **Admin Panel API**: Manage reward configurations
- **Webhook Support**: Automatic processing via webhooks

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```bash
# Thirdweb Configuration
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_VAULT_ID=your_vault_id
THIRDWEB_ACCESS_TOKEN=your_access_token

# Wallet Configuration
SERVER_WALLET_ADDRESS=0x1234567890123456789012345678901234567890

# Contract Addresses
USDT_CONTRACT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Thirdweb Vault Setup

1. Go to [Thirdweb Vault](https://portal.thirdweb.com/vault)
2. Create a new Vault
3. Generate access tokens
4. Configure your server wallet

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Exchange Endpoints

- `GET /api/exchange/rewards` - Get reward configurations
- `POST /api/exchange/check-eligibility` - Check NFT eligibility
- `POST /api/exchange/initiate` - Process NFT exchange
- `POST /api/exchange/webhook` - Webhook for automatic processing
- `GET /api/exchange/server-wallet` - Get server wallet address

### Admin Endpoints

- `GET /api/admin/rewards` - Get all rewards
- `POST /api/admin/rewards` - Add new reward
- `PUT /api/admin/rewards/:id` - Update reward
- `DELETE /api/admin/rewards/:id` - Remove reward
- `GET /api/admin/stats` - Get exchange statistics

## Flow Overview

1. **User transfers NFT** to server wallet
2. **Server detects transfer** (via webhook or polling)
3. **Server validates eligibility** based on configured rewards
4. **Server sends USDT** to user's wallet
5. **Server burns NFT** (optional)
6. **Custom rewards logged** for manual processing

## Security Features

- **Non-custodial**: Private keys secured with TEE architecture
- **Access control**: Granular permissions via Vault
- **Transaction validation**: Server-side validation before processing
- **Error handling**: Comprehensive error handling and logging

## Production Considerations

- Replace in-memory storage with database (PostgreSQL, MongoDB, etc.)
- Implement proper authentication for admin endpoints
- Add rate limiting and request validation
- Set up monitoring and alerting
- Configure proper CORS settings
- Use environment-specific configurations
