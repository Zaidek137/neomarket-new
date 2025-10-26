# Discord Webhook Setup Guide

This guide will help you set up Discord webhooks to receive notifications when votes are cast in The Nexus voting system.

## What You'll Get

When configured, you'll receive Discord notifications for:
- **New Votes**: When a user votes on a proposal (with vote type, voter address, and current results)
- **New Proposals**: When an admin creates a new proposal

## Step 1: Create a Discord Webhook

1. **Open your Discord server** where you want to receive notifications
2. **Go to Server Settings** → **Integrations** → **Webhooks**
3. **Click "New Webhook"** or "Create Webhook"
4. **Configure the webhook:**
   - Name: `Nexus Voting Bot` (or any name you prefer)
   - Channel: Select the channel where notifications should be posted
   - Avatar: Optional - upload an icon for the bot
5. **Copy the Webhook URL** - it will look like:
   ```
   https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz
   ```

## Step 2: Add Webhook URL to Environment Variables

1. **Open your `.env` file** in the Neomarket project root
2. **Add the following line:**
   ```env
   VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   ```
3. **Replace** `YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN` with your actual webhook URL
4. **Save the file**

### Example `.env` Configuration

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Discord Webhook (NEW)
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz

# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your-client-id
```

## Step 3: Restart Your Development Server

After adding the webhook URL to your `.env` file:

```bash
npm run dev
```

## Step 4: Test the Webhook

### Option 1: Test via Browser Console

1. Open your app in the browser
2. Open the browser console (F12)
3. Run this command:
   ```javascript
   import { discordWebhook } from './src/services/discordWebhook';
   await discordWebhook.testWebhook();
   ```

### Option 2: Test by Voting

1. Navigate to **The Nexus** page
2. Vote on any active proposal
3. Check your Discord channel for the notification

## Notification Examples

### Vote Notification

When a user votes, Discord will receive a rich embed with:
- **Vote Type**: 👍 FOR or 👎 AGAINST
- **Voter Address**: Shortened wallet address (e.g., `0x1234...5678`)
- **Proposal Title & Description**
- **Category**: Music, Gaming, City Voting, or Creative Content
- **Current Results**: Progress bar, vote counts, and percentage
- **Thumbnail**: Proposal image (if available)

### Proposal Creation Notification

When a new proposal is created, Discord will receive:
- **Proposal Title & Description**
- **Creator Address**
- **Category**
- **Full Image**: Proposal image (if available)

## Troubleshooting

### Webhook Not Sending Notifications

1. **Check the webhook URL** in your `.env` file
   - Make sure it starts with `https://discord.com/api/webhooks/`
   - Ensure there are no extra spaces or quotes

2. **Verify the webhook exists** in Discord
   - Go to Server Settings → Integrations → Webhooks
   - Check that the webhook is still active

3. **Check browser console** for errors
   - Look for messages like "Discord webhook failed"
   - Check the network tab for failed requests

4. **Restart your dev server** after changing `.env`

### Webhook Rate Limits

Discord webhooks have rate limits:
- **5 requests per 2 seconds** per webhook
- If you exceed this, you'll get a 429 error

The app handles this gracefully - votes will still be recorded even if the webhook fails.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env` file** to version control
   - It should be in your `.gitignore`
   
2. **Keep your webhook URL private**
   - Anyone with the URL can send messages to your Discord channel
   
3. **Use environment variables** for production
   - Set `VITE_DISCORD_WEBHOOK_URL` in your hosting platform (Vercel, Netlify, etc.)

4. **Regenerate webhook if compromised**
   - If your webhook URL is exposed, delete it in Discord and create a new one

## Advanced Configuration

### Customizing the Bot Avatar

In `src/services/discordWebhook.ts`, update the `avatar_url`:

```typescript
avatar_url: 'https://your-image-url.com/avatar.png'
```

### Customizing Embed Colors

Colors are defined in `createVoteEmbed()`:
- **Green (FOR)**: `0x10B981`
- **Red (AGAINST)**: `0xEF4444`
- **Purple (Proposal)**: `0x8B5CF6`

### Disabling Webhooks

To temporarily disable webhooks without removing the URL:
1. Comment out the `VITE_DISCORD_WEBHOOK_URL` in `.env`
2. Or delete the webhook in Discord (it will fail silently)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your webhook URL is correct
3. Test the webhook directly using Discord's API
4. Check Discord's webhook documentation: https://discord.com/developers/docs/resources/webhook

---

**Happy voting! 🗳️**

