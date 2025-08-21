# Voting System Setup Guide

## Overview
The Nexus voting system is a fully functional governance platform for the Scavenjer ecosystem, built with Supabase and integrated with blockchain wallet authentication.

## Features Implemented

✅ **Database Schema**
- Proposals table with categories, voting requirements, and status tracking
- Votes table with one-vote-per-wallet enforcement
- Comprehensive logging system for audit trails
- Automatic vote counting and status updates via triggers

✅ **Voting Categories**
- Music & Music Videos
- Gaming
- City Voting
- Creative Content

✅ **Admin Features**
- Create proposals with custom voting requirements
- Set voting periods with specific end dates/times
- Full control over proposal parameters

✅ **User Features**
- Vote on active proposals (requires Eko ownership)
- View voting history
- Real-time vote updates
- Category filtering

✅ **Security**
- Eko NFT ownership verification for voting eligibility
- One vote per wallet per proposal enforcement
- Admin-only proposal creation
- Row Level Security policies in Supabase

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the Neomarket directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Execute the SQL from `src/database/voting-schema.sql`
4. This will create all necessary tables, indexes, functions, and policies

### 3. Admin Configuration

Edit `src/config/admin.ts` and add your admin wallet addresses:
```typescript
export const ADMIN_WALLETS = [
  "0xf8Ca9dA64Bb500C4C4395f7Bb987De3e77883130" // Current admin wallet
].map(addr => addr.toLowerCase());
```

**Current Admin Wallet**: `0xf8Ca9dA64Bb500C4C4395f7Bb987De3e77883130`

### 4. NFT Contract Configuration

The system checks for Eko ownership using the correct NFT collection contract:
- Contract Address: `0x45a5A7F0c407F8178B138C74906bed90414fC923`
- Network: Polygon (Chain ID: 137)
- Uses `getOwnedNFTs` from ThirdWeb extensions for reliable verification

To change this, update the contract address in `src/hooks/useEkoOwnership.ts`

## Usage

### Creating Proposals (Admin)

1. Connect your admin wallet
2. Navigate to The Nexus page
3. Click "Create Proposal" button
4. Fill in:
   - Title and description
   - Category (Music, Gaming, City Voting, Creative Content)
   - Required votes to pass
   - End date and time
5. Submit the proposal

### Voting (Users)

1. Connect wallet with at least 1 Eko NFT
2. Navigate to The Nexus page
3. Browse active proposals by category
4. Click "Vote For" or "Vote Against"
5. Each wallet can only vote once per proposal

### Monitoring

- View real-time vote counts
- Check proposal status (active/passed/failed)
- Review voting history
- Filter by categories

## Database Tables

### proposals
- `id`: UUID primary key
- `title`: Proposal title
- `description`: Detailed description
- `category`: enum (music, gaming, city_voting, creative_content)
- `status`: enum (active, passed, failed, cancelled)
- `votes_required`: Minimum votes needed to pass
- `votes_for`: Current for votes
- `votes_against`: Current against votes
- `created_by`: Admin wallet address
- `start_date`: When voting begins
- `end_date`: When voting ends

### votes
- `id`: UUID primary key
- `proposal_id`: Reference to proposal
- `wallet_address`: Voter's wallet
- `vote_type`: enum (for, against)
- `voted_at`: Timestamp
- Unique constraint on (proposal_id, wallet_address)

### voting_logs
- `id`: UUID primary key
- `proposal_id`: Reference to proposal
- `wallet_address`: Actor's wallet
- `action`: Action performed
- `details`: JSONB with additional info
- `created_at`: Timestamp

## Real-time Updates

The system supports real-time updates via Supabase subscriptions:
- Vote counts update automatically
- Proposal status changes are reflected immediately
- New proposals appear without refresh

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled
2. **Wallet Verification**: Admin actions require wallet ownership check
3. **NFT Verification**: Voting requires Eko NFT ownership
4. **Vote Uniqueness**: Database enforces one vote per wallet per proposal
5. **Audit Trail**: All actions are logged for transparency

## Troubleshooting

### Common Issues

1. **"Only admins can create proposals"**
   - Ensure your wallet address is in the ADMIN_WALLETS array
   - Addresses must be lowercase

2. **"You need to own at least one Eko NFT"**
   - Verify you own an Eko from the correct contract
   - Check that your wallet is connected to Polygon network

3. **"Failed to fetch proposals"**
   - Check Supabase environment variables
   - Ensure database tables are created
   - Verify RLS policies are in place

### Logs

All voting activities are logged in the `voting_logs` table:
- Proposal creation
- Votes cast
- Status changes (passed/failed)

Query logs via:
```sql
SELECT * FROM voting_logs 
WHERE proposal_id = 'your-proposal-id' 
ORDER BY created_at DESC;
```

## Future Enhancements

Consider implementing:
- Proposal comments/discussion
- Vote delegation
- Quorum requirements
- Time-weighted voting
- Proposal templates
- Email notifications
- Vote reasoning/comments
- Proposal amendments
