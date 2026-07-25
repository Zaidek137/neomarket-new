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
  endDate: string;
}

class DiscordWebhookService {
  private notifyEndpoint: string | null = null;

  constructor() {
    // Get notification relay URL from environment variables
    this.notifyEndpoint = import.meta.env.VITE_DISCORD_NOTIFY_ENDPOINT || null;
    
    if (!this.notifyEndpoint) {
      console.warn('Discord notification relay not configured. Set VITE_DISCORD_NOTIFY_ENDPOINT to a server-side relay URL.');
    }
  }

  private async sendToRelay(payload: DiscordWebhookPayload): Promise<boolean> {
    if (!this.notifyEndpoint) {
      console.log('Discord notification relay not configured, skipping notification');
      return false;
    }

    const response = await fetch(this.notifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'community',
        embeds: payload.embeds || [],
        username: payload.username,
        avatarUrl: payload.avatar_url,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord notification relay failed:', response.status, errorText);
      return false;
    }

    return true;
  }

  /**
   * Send a vote notification to Discord
   */
  async sendVoteNotification(data: VoteNotificationData): Promise<boolean> {

    try {
      const embed = this.createVoteEmbed(data);
      const payload: DiscordWebhookPayload = {
        username: 'Nexus Voting Bot',
        avatar_url: 'https://scavenjer.io/scavenjer-logo.png', // Scavenjer logo
        embeds: [embed]
      };

      console.log('Sending Discord notification relay...');
      return await this.sendToRelay(payload);
    } catch (error) {
      console.error('Error sending Discord notification:', error);
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
      voteType,
      votesFor,
      votesAgainst,
      votesRequired,
      endDate
    } = data;

    // Color based on vote type (green for 'for', red for 'against')
    const color = voteType === 'for' ? 0x10B981 : 0xEF4444; // Green or Red

    // Calculate progress percentage
    const progress = Math.min((votesFor / votesRequired) * 100, 100).toFixed(1);

    // Create progress bar
    const progressBar = this.createProgressBar(votesFor, votesRequired);

    // Format end date
    const endDateObj = new Date(endDate);
    const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate time remaining
    const now = new Date();
    const timeRemaining = endDateObj.getTime() - now.getTime();
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let timeRemainingText = '';
    if (daysRemaining > 0) {
      timeRemainingText = `${daysRemaining}d ${hoursRemaining}h remaining`;
    } else if (hoursRemaining > 0) {
      timeRemainingText = `${hoursRemaining}h remaining`;
    } else {
      timeRemainingText = 'Less than 1h remaining';
    }

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
          name: '🏷️ Category',
          value: proposalCategory.replace('_', ' ').toUpperCase(),
          inline: true
        },
        {
          name: '⏰ Expires',
          value: `${formattedEndDate}\n*${timeRemainingText}*`,
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
    endDate: string,
    proposalImageUrl?: string
  ): Promise<boolean> {

    try {
      // Format end date
      const endDateObj = new Date(endDate);
      const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Calculate time remaining
      const now = new Date();
      const timeRemaining = endDateObj.getTime() - now.getTime();
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let timeRemainingText = '';
      if (daysRemaining > 0) {
        timeRemainingText = `${daysRemaining}d ${hoursRemaining}h to vote`;
      } else if (hoursRemaining > 0) {
        timeRemainingText = `${hoursRemaining}h to vote`;
      } else {
        timeRemainingText = 'Less than 1h to vote';
      }
      
      const embed: DiscordEmbed = {
        title: '📢 New Proposal Created!',
        description: `**${proposalTitle}**\n${proposalDescription.slice(0, 200)}${proposalDescription.length > 200 ? '...' : ''}`,
        color: 0x8B5CF6, // Purple
        fields: [
          {
            name: '🏷️ Category',
            value: proposalCategory.replace('_', ' ').toUpperCase(),
            inline: true
          },
          {
            name: '⏰ Voting Ends',
            value: `${formattedEndDate}\n*${timeRemainingText}*`,
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
        avatar_url: 'https://scavenjer.io/scavenjer-logo.png',
        embeds: [embed]
      };

      console.log('📤 Sending proposal creation notification...');
      return await this.sendToRelay(payload);
    } catch (error) {
      console.error('Error sending Discord notification:', error);
      return false;
    }
  }

  /**
   * Test the webhook connection
   */
  async testWebhook(): Promise<boolean> {
    if (!this.notifyEndpoint) {
      console.error('No Discord notification relay configured');
      return false;
    }

    try {
      const payload: DiscordWebhookPayload = {
        username: 'Nexus Voting Bot',
        embeds: [{
          title: 'Notification relay test',
          description: 'The Nexus voting system is connected to the Discord notification relay.',
          color: 0x10B981,
          timestamp: new Date().toISOString()
        }]
      };

      return await this.sendToRelay(payload);
    } catch (error) {
      console.error('Notification relay test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const discordWebhook = new DiscordWebhookService();

