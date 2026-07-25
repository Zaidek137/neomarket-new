import {
  createSupabaseAdminClient,
  handleCors,
  requireAdminWallet,
  sendJson,
  validateDeleteProposalPayload,
  validateProposalPayload,
  verifySignedVotingRequest
} from '../_utils/votingAuth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const action = req.body?.action || await peekAction(req);

    if (action === 'createProposal') {
      return await createProposal(req, res);
    }

    if (action === 'deleteProposal') {
      return await deleteProposal(req, res);
    }

    return sendJson(res, 400, { error: 'Unsupported proposal action.' });
  } catch (error) {
    return sendJson(res, 400, { error: error instanceof Error ? error.message : 'Proposal request failed.' });
  }
}

async function createProposal(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'createProposal');
  requireAdminWallet(walletAddress);

  const proposal = validateProposalPayload(payload, walletAddress);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('proposals')
    .insert([proposal])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from('voting_logs').insert([{
    proposal_id: data.id,
    wallet_address: walletAddress,
    action: 'created_proposal',
    details: { title: data.title }
  }]);

  return sendJson(res, 200, { data });
}

async function deleteProposal(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'deleteProposal');
  requireAdminWallet(walletAddress);

  const proposalId = validateDeleteProposalPayload(payload);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', proposalId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from('voting_logs').insert([{
    proposal_id: null,
    wallet_address: walletAddress,
    action: 'deleted_proposal',
    details: {
      deleted_proposal_id: proposalId,
      deleted_at: new Date().toISOString()
    }
  }]);

  return sendJson(res, 200, { data: { id: proposalId } });
}

async function peekAction(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  req.body = rawBody ? JSON.parse(rawBody) : {};
  return req.body.action;
}
