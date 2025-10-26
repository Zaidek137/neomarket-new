/**
 * Discord Webhook Service
 * Sends notifications to Discord when votes are cast
 */

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface VoteNotificationData {
  proposalId: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalCategory: string;
  proposalImageUrl?: string;
  voterAddress: string;
  voteType: 'for' | 'against';
  votesFor: number;
  votesAgainst: number;
  votesRequired: number;
}

class DiscordWebhookService {
  private webhookUrl: string | null = null;

  constructor() {
    // Get webhook URL from environment variables
    this.webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL || null;
    
    if (!this.webhookUrl) {
      console.warn('⚠️ Discord webhook URL not configured. Set VITE_DISCORD_WEBHOOK_URL in your .env file.');
    }
  }

  /**
   * Send a vote notification to Discord
   */
  async sendVoteNotification(data: VoteNotificationData): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('🔕 Discord webhook not configured, skipping notification');
      return false;
    }

    try {
      const embed = this.createVoteEmbed(data);
      const payload: DiscordWebhookPayload = {
        username: 'Nexus Voting Bot',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png', // Optional: Replace with your bot avatar
        embeds: [embed]
      };

      console.log('📤 Sending Discord webhook notification...');
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord webhook failed:', response.status, errorText);
        return false;
      }

      console.log('✅ Discord notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending Discord webhook:', error);
      return false;
    }
  }

  /**
   * Create a rich embed for vote notifications
   */
  private createVoteEmbed(data: VoteNotificationData): DiscordEmbed {
    const {
      proposalTitle,
      proposalDescription,
      proposalCategory,
      proposalImageUrl,
      voterAddress,
      voteType,
      votesFor,
      votesAgainst,
      votesRequired
    } = data;

    // Color based on vote type (green for 'for', red for 'against')
    const color = voteType === 'for' ? 0x10B981 : 0xEF4444; // Green or Red

    // Calculate progress percentage
    const progress = Math.min((votesFor / votesRequired) * 100, 100).toFixed(1);

    // Format voter address (show first 6 and last 4 characters)
    const formattedAddress = `${voterAddress.slice(0, 6)}...${voterAddress.slice(-4)}`;

    // Create progress bar
    const progressBar = this.createProgressBar(votesFor, votesRequired);

    const embed: DiscordEmbed = {
      title: `🗳️ New Vote Cast!`,
      description: `**${proposalTitle}**\n${proposalDescription.slice(0, 150)}${proposalDescription.length > 150 ? '...' : ''}`,
      color: color,
      fields: [
        {
          name: '📊 Vote',
          value: voteType === 'for' ? '👍 **FOR**' : '👎 **AGAINST**',
          inline: true
        },
        {
          name: '👤 Voter',
          value: `\`${formattedAddress}\``,
          inline: true
        },
        {
          name: '🏷️ Category',
          value: proposalCategory.replace('_', ' ').toUpperCase(),
          inline: true
        },
        {
          name: '📈 Current Results',
          value: `${progressBar}\n👍 For: **${votesFor}** | 👎 Against: **${votesAgainst}**\nRequired: **${votesRequired}** (${progress}%)`,
          inline: false
        }
      ],
      footer: {
        text: 'Scavenjer Nexus Voting System'
      },
      timestamp: new Date().toISOString()
    };

    // Add image if available
    if (proposalImageUrl) {
      embed.thumbnail = { url: proposalImageUrl };
    }

    return embed;
  }

  /**
   * Create a visual progress bar
   */
  private createProgressBar(current: number, required: number): string {
    const percentage = Math.min((current / required) * 100, 100);
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `[${filledBar}${emptyBar}] ${percentage.toFixed(0)}%`;
  }

  /**
   * Send a proposal creation notification
   */
  async sendProposalCreatedNotification(
    proposalTitle: string,
    proposalDescription: string,
    proposalCategory: string,
    creatorAddress: string,
    proposalImageUrl?: string
  ): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('🔕 Discord webhook not configured, skipping notification');
      return false;
    }

    try {
      const formattedAddress = `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`;
      
      const embed: DiscordEmbed = {
        title: '📢 New Proposal Created!',
        description: `**${proposalTitle}**\n${proposalDescription.slice(0, 200)}${proposalDescription.length > 200 ? '...' : ''}`,
        color: 0x8B5CF6, // Purple
        fields: [
          {
            name: '👤 Created By',
            value: `\`${formattedAddress}\``,
            inline: true
          },
          {
            name: '🏷️ Category',
            value: proposalCategory.replace('_', ' ').toUpperCase(),
            inline: true
          }
        ],
        footer: {
          text: 'Scavenjer Nexus Voting System'
        },
        timestamp: new Date().toISOString()
      };

      if (proposalImageUrl) {
        embed.image = { url: proposalImageUrl };
      }

      const payload: DiscordWebhookPayload = {
        username: 'Nexus Voting Bot',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed]
      };

      console.log('📤 Sending proposal creation notification...');
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord webhook failed:', response.status, errorText);
        return false;
      }

      console.log('✅ Proposal creation notification sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending Discord webhook:', error);
      return false;
    }
  }

  /**
   * Test the webhook connection
   */
  async testWebhook(): Promise<boolean> {
    if (!this.webhookUrl) {
      console.error('❌ No webhook URL configured');
      return false;
    }

    try {
      const payload: DiscordWebhookPayload = {
        username: 'Nexus Voting Bot',
        content: '✅ Webhook test successful! The Nexus voting system is connected to Discord.'
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Webhook test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const discordWebhook = new DiscordWebhookService();

