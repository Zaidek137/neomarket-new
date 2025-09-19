# Deployment Guide

## Supabase Database Setup

### 1. Execute SQL Schema

Copy and paste the contents of `database/burn_rewards_schema.sql` into your Supabase SQL Editor and execute it.

This will create:
- `burn_rewards` table with proper constraints and indexes
- Row Level Security (RLS) policies
- Helper functions for statistics
- A view for easier querying

### 2. Verify Database Setup

After running the SQL, verify the table was created:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'burn_rewards';

-- Check table structure
\d burn_rewards;
```

## Vercel Deployment

### 1. Environment Variables

Set these environment variables in your Vercel dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
VAULT_ADMIN_KEY=your_vault_admin_key
SERVER_WALLET_ADDRESS=your_server_wallet_address
USDT_CONTRACT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Navigate to server directory
cd server

# Deploy
vercel --prod
```

### 3. Update Frontend

Update your frontend's API base URL to point to the deployed Vercel function:

In `vite.config.ts`, update the proxy target:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://your-vercel-deployment.vercel.app',
      changeOrigin: true,
    },
  },
}
```

Or update your API calls to use the production URL directly.

## Testing Deployment

### 1. Health Check

Visit: `https://your-vercel-deployment.vercel.app/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2023-...",
  "service": "NFT Exchange Server"
}
```

### 2. Database Connection Test

The deployment will automatically test the database connection on startup. Check the Vercel function logs for:
```
✅ Database connection successful
```

### 3. API Endpoints Test

Test the main endpoints:
- `GET /api/admin/rewards` - Should return empty array initially
- `POST /api/admin/rewards` - Create a test reward
- `GET /api/exchange/rewards` - Should return the created rewards

## Troubleshooting

### Database Connection Issues

1. **Check Service Key**: Ensure you're using the `service_role` key, not the `anon` key
2. **RLS Policies**: The service role should bypass RLS, but verify policies are correct
3. **Environment Variables**: Ensure all Supabase env vars are set correctly in Vercel

### Thirdweb Vault Issues

1. **401 Unauthorized**: Check your `VAULT_ADMIN_KEY` is correct and active
2. **Client ID/Secret**: Verify `THIRDWEB_CLIENT_ID` and `THIRDWEB_SECRET_KEY` are valid

### Vercel Function Issues

1. **Function Timeout**: Increase timeout in vercel.json if needed
2. **Memory Limit**: Increase memory allocation for heavy operations
3. **Cold Starts**: First request after inactivity may be slower

## Production Considerations

### 1. Database Backup

Set up automated backups in Supabase dashboard.

### 2. Monitoring

- Enable Vercel function analytics
- Set up error tracking (Sentry, etc.)
- Monitor database performance in Supabase

### 3. Security

- Rotate API keys regularly
- Monitor for unusual activity
- Set up rate limiting if needed

### 4. Scaling

- Supabase handles database scaling automatically
- Vercel functions scale automatically
- Consider implementing caching for frequently accessed data

## Migration from Development

1. Export any existing rewards from your development setup
2. Import them into the production database
3. Test all functionality thoroughly
4. Update frontend to use production API endpoints
5. Monitor for any issues after deployment
