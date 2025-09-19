@echo off
echo Creating .env file for NFT Exchange Server...
echo.

(
echo # Thirdweb Configuration
echo THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
echo THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here
echo.
echo # Vault Configuration
echo VAULT_ADMIN_KEY=your_vault_admin_key_here
echo SERVER_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
echo.
echo # Contract Addresses
echo USDT_CONTRACT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
echo.
echo # Server Configuration
echo PORT=3001
echo NODE_ENV=development
) > .env

echo ✅ .env file created successfully!
echo.
echo 📝 Next steps:
echo 1. Edit the .env file and replace the placeholder values
echo 2. Get your Thirdweb credentials from: https://thirdweb.com/dashboard
echo 3. Create a Vault at: https://portal.thirdweb.com/vault
echo 4. Run: npm install
echo 5. Run: npm run dev
echo.
echo 📖 For detailed instructions, see SETUP.md
pause
