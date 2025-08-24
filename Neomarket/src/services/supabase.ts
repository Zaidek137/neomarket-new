import { createClient } from '@supabase/supabase-js';

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
  async createProposal(proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'votes_for' | 'votes_against' | 'status'>) {
    const { data, error } = await supabase
      .from('proposals')
      .insert([proposal])
      .select()
      .single();
    
    if (error) throw error;

    // Log the proposal creation
    await this.logAction(data.id, proposal.created_by, 'created_proposal', { title: proposal.title });

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
  async submitVote(proposalId: string, walletAddress: string, voteType: VoteType) {
    // Check if already voted
    const hasVoted = await this.hasVoted(proposalId, walletAddress);
    if (hasVoted) {
      throw new Error('You have already voted on this proposal');
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([{
        proposal_id: proposalId,
        wallet_address: walletAddress,
        vote_type: voteType
      }])
      .select()
      .single();
    
    if (error) throw error;
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
  async logAction(proposalId: string | null, walletAddress: string, action: string, details?: any) {
    const { error } = await supabase
      .from('voting_logs')
      .insert([{
        proposal_id: proposalId,
        wallet_address: walletAddress,
        action,
        details
      }]);
    
    if (error) throw error;
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
  async deleteProposal(proposalId: string, adminWallet: string) {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposalId);
    
    if (error) throw error;

    // Log the deletion (proposal_id will be set to NULL due to foreign key constraint)
    await this.logAction(null, adminWallet, 'deleted_proposal', { 
      deleted_proposal_id: proposalId,
      deleted_at: new Date().toISOString() 
    });
  }
};
