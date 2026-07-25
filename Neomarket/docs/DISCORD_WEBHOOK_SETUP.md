# Discord Notification Relay Setup

This guide configures Nexus voting notifications without exposing a Discord webhook URL to the browser.

## What You Need

- A server-side notification relay, such as the Scavenjer site endpoint:
  `https://your-scavenjer-site.com/api/discord/notify`
- A Discord webhook URL stored only in that server's environment variables.

## Server-Side Relay Configuration

On the relay host, create the Discord webhook in Discord and store the URL as a server-only environment variable:

```env
DISCORD_WEBHOOK_COMMUNITY=<your-discord-community-webhook-url>
```

For the Scavenjer site relay, the endpoint accepts structured notification payloads and sends them to the configured Discord channel. Do not place Discord webhook URLs in NeoMarket frontend environment variables.

## NeoMarket Frontend Configuration

In `NeoMarket/Neomarket/.env`, add only the public relay endpoint:

```env
VITE_DISCORD_NOTIFY_ENDPOINT=https://your-scavenjer-site.com/api/discord/notify
```

This endpoint is not a secret. The actual Discord webhook URL stays on the relay server.

## Test

1. Restart NeoMarket after changing `.env`.
2. Open the app.
3. Run the webhook test from the app code path or cast a vote on a test proposal.
4. Confirm the relay server logs show a notification request and Discord receives the message.

## Security Notes

- Never store Discord webhook URLs in `VITE_` variables.
- Rotate any Discord webhook URL that was previously committed, pasted into a public frontend env var, or exposed in a deployed client bundle.
- Configure allowed origins on the relay host so only approved frontends can call it.
- Keep the relay payload structured and rate-limited.
