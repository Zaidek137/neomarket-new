import {
  createSupabaseAdminClient,
  handleCors,
  sendJson,
  validateVotePayload,
  verifyEkoOwnership,
  verifySignedVotingRequest
} from '../_utils/votingAuth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const { walletAddress, payload } = await verifySignedVotingRequest(req, 'submitVote');
    const vote = validateVotePayload(payload, walletAddress);
    const supabase = createSupabaseAdminClient();

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id,status,end_date')
      .eq('id', vote.proposal_id)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposal was not found.');
    }

    if (proposal.status !== 'active' || new Date(proposal.end_date).getTime() <= Date.now()) {
      throw new Error('Voting is closed for this proposal.');
    }

    await verifyEkoOwnership(walletAddress);

    const { data: existingVote, error: existingVoteError } = await supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', vote.proposal_id)
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (existingVoteError) {
      throw new Error(existingVoteError.message);
    }

    if (existingVote) {
      return sendJson(res, 409, { error: 'You have already voted on this proposal.' });
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([vote])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return sendJson(res, 200, { data });
  } catch (error) {
    return sendJson(res, 400, { error: error instanceof Error ? error.message : 'Vote request failed.' });
  }
}
