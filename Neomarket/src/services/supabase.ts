import { createClient } from '@supabase/supabase-js';
import { discordWebhook } from './discordWebhook';
import { API_BASE_URL } from '../config/constants';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the voting system
export type ProposalCategory = 'music' | 'gaming' | 'city_voting' | 'creative_content';
export type ProposalStatus = 'active' | 'passed' | 'failed' | 'cancelled';
export type VoteType = 'for' | 'against';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  status: ProposalStatus;
  votes_required: number;
  votes_for: number;
  votes_against: number;
  created_by: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

export interface Vote {
  id: string;
  proposal_id: string;
  wallet_address: string;
  vote_type: VoteType;
  voted_at: string;
}

export interface VotingLog {
  id: string;
  proposal_id: string | null;
  wallet_address: string;
  action: string;
  details: any;
  created_at: string;
}

interface VotingSigningAccount {
  address?: string;
  signMessage?: (args: { message: string } | string) => Promise<string>;
}

type VotingAction = 'createProposal' | 'submitVote' | 'deleteProposal';

interface SignedApiResponse<T> {
  data?: T;
  error?: string;
}

async function requestSignedVotingAction<T>(
  endpoint: 'proposals' | 'votes',
  action: VotingAction,
  payload: Record<string, unknown>,
  account: VotingSigningAccount
): Promise<T> {
  if (!account?.address || !account.signMessage) {
    throw new Error('Please connect a wallet that supports message signing.');
  }

  const timestamp = String(Date.now());
  const nonce = crypto.randomUUID();
  const payloadHash = await hashPayload(payload);
  const walletAddress = account.address.toLowerCase();
  const message = buildVotingMessage({
    action,
    walletAddress,
    nonce,
    timestamp,
    payloadHash
  });

  let signature: string;
  try {
    signature = await account.signMessage({ message });
  } catch {
    signature = await account.signMessage(message);
  }

  const response = await fetch(`${API_BASE_URL}/voting/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      walletAddress,
      payload,
      nonce,
      timestamp,
      signature
    })
  });

  const result = await response.json() as SignedApiResponse<T>;

  if (!response.ok || result.error || !result.data) {
    throw new Error(result.error || 'Voting request failed.');
  }

  return result.data;
}

function buildVotingMessage({
  action,
  walletAddress,
  nonce,
  timestamp,
  payloadHash
}: {
  action: VotingAction;
  walletAddress: string;
  nonce: string;
  timestamp: string;
  payloadHash: string;
}) {
  return [
    'NeoMarket Voting API',
    `Action: ${action}`,
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
    `Payload Hash: ${payloadHash}`
  ].join('\n');
}

async function hashPayload(payload: Record<string, unknown>) {
  const data = new TextEncoder().encode(stableStringify(payload));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

// Voting Service
export const votingService = {
  // Fetch all proposals by category and status
  async getProposals(category?: ProposalCategory, status?: ProposalStatus) {
    let query = supabase.from('proposals').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Proposal[];
  },

  // Get active proposals
  async getActiveProposals(category?: ProposalCategory) {
    return this.getProposals(category, 'active');
  },

  // Get a single proposal
  async getProposal(id: string) {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Proposal;
  },

  // Create a new proposal (admin only)
  async createProposal(
    proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'votes_for' | 'votes_against' | 'status'>,
    account: VotingSigningAccount
  ) {
    const data = await requestSignedVotingAction<Proposal>('proposals', 'createProposal', proposal as unknown as Record<string, unknown>, account);

    // Send Discord notification (non-blocking)
    try {
      await discordWebhook.sendProposalCreatedNotification(
        proposal.title,
        proposal.description,
        proposal.category,
        proposal.end_date,
        proposal.image_url || undefined
      );
    } catch (webhookError) {
      console.error('Discord webhook notification failed:', webhookError);
    }

    return data as Proposal;
  },

  // Check if a wallet has already voted on a proposal
  async hasVoted(proposalId: string, walletAddress: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return !!data;
  },

  // Submit a vote
  async submitVote(proposalId: string, walletAddress: string, voteType: VoteType, account: VotingSigningAccount) {
    // Check if already voted
    const hasVoted = await this.hasVoted(proposalId, walletAddress);
    if (hasVoted) {
      throw new Error('You have already voted on this proposal');
    }

    const data = await requestSignedVotingAction<Vote>('votes', 'submitVote', {
      proposalId,
      walletAddress,
      voteType
    }, account);

    // Send Discord notification (non-blocking)
    try {
      const proposal = await this.getProposal(proposalId);
      
      await discordWebhook.sendVoteNotification({
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        proposalDescription: proposal.description,
        proposalCategory: proposal.category,
        proposalImageUrl: proposal.image_url || undefined,
        voterAddress: walletAddress,
        voteType: voteType,
        votesFor: proposal.votes_for + (voteType === 'for' ? 1 : 0),
        votesAgainst: proposal.votes_against + (voteType === 'against' ? 1 : 0),
        votesRequired: proposal.votes_required,
        endDate: proposal.end_date
      });
    } catch (webhookError) {
      // Don't fail the vote if webhook fails
      console.error('Discord webhook notification failed:', webhookError);
    }

    return data as Vote;
  },

  // Get votes for a proposal
  async getVotesForProposal(proposalId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('proposal_id', proposalId);
    
    if (error) throw error;
    return data as Vote[];
  },

  // Get votes by wallet address
  async getVotesByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('*, proposals(*)')
      .eq('wallet_address', walletAddress);
    
    if (error) throw error;
    return data;
  },

  // Log an action
  async logAction(_proposalId: string | null, _walletAddress: string, _action: string, _details?: any) {
    throw new Error('Voting logs are written by the signed voting API.');
  },

  // Get logs for a proposal
  async getProposalLogs(proposalId: string) {
    const { data, error } = await supabase
      .from('voting_logs')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as VotingLog[];
  },

  // Subscribe to proposal updates
  subscribeToProposalUpdates(proposalId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`proposal:${proposalId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'proposals',
        filter: `id=eq.${proposalId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to new votes on a proposal
  subscribeToVotes(proposalId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`votes:${proposalId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `proposal_id=eq.${proposalId}`
      }, callback)
      .subscribe();
  },

  // Delete a proposal (admin only)
  async deleteProposal(proposalId: string, adminWallet: string, account: VotingSigningAccount) {
    await requestSignedVotingAction<{ id: string }>('proposals', 'deleteProposal', {
      proposalId,
      adminWallet
    }, account);
  }
};
