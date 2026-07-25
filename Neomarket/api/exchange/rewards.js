import crypto from 'node:crypto';
import { getAddress } from 'viem';
import {
  createSupabaseAdminClient,
  handleCors,
  normalizeWallet,
  requireAdminWallet,
  sendJson,
  verifyNftHeldByServer,
  verifySignedVotingRequest
} from '../_utils/votingAuth.js';

const EXCHANGE_MESSAGE_SCOPE = 'NeoMarket Exchange API';
const DEFAULT_SERVER_WALLET_ADDRESS = '0xF17224EaA3c6410f16995b72b396067cf070a487';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const action = req.body?.action || await peekAction(req);

    if (action === 'addBurnReward') {
      return await addBurnReward(req, res);
    }

    if (action === 'deleteBurnReward') {
      return await deleteBurnReward(req, res);
    }

    if (action === 'logExchange') {
      return await logExchange(req, res);
    }

    if (action === 'getPendingExchanges') {
      return await getPendingExchanges(req, res);
    }

    if (action === 'markExchangeProcessed') {
      return await markExchangeProcessed(req, res);
    }

    return sendJson(res, 400, { error: 'Unsupported exchange action.' });
  } catch (error) {
    return sendJson(res, 400, { error: error instanceof Error ? error.message : 'Exchange request failed.' });
  }
}

async function addBurnReward(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'addBurnReward', EXCHANGE_MESSAGE_SCOPE);
  requireAdminWallet(walletAddress);

  const reward = validateRewardPayload(payload);
  const supabase = createSupabaseAdminClient();

  let duplicateQuery = supabase
    .from('burn_rewards')
    .select('id')
    .eq('collection_address', reward.collection_address);

  duplicateQuery = reward.token_id === null
    ? duplicateQuery.is('token_id', null)
    : duplicateQuery.eq('token_id', reward.token_id);

  const { data: duplicate, error: duplicateError } = await duplicateQuery.maybeSingle();

  if (duplicateError) {
    throw new Error(duplicateError.message);
  }

  if (duplicate) {
    throw new Error('A reward already exists for this collection and token ID combination.');
  }

  const { data, error } = await supabase
    .from('burn_rewards')
    .insert([{ id: crypto.randomUUID(), ...reward }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return sendJson(res, 200, { data: toFrontendReward(data) });
}

async function deleteBurnReward(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'deleteBurnReward', EXCHANGE_MESSAGE_SCOPE);
  requireAdminWallet(walletAddress);

  const id = normalizeId(payload.id);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from('burn_rewards')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return sendJson(res, 200, { data: { id } });
}

async function logExchange(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'logExchange', EXCHANGE_MESSAGE_SCOPE);
  const userWalletAddress = normalizeWallet(payload.userWalletAddress);

  if (userWalletAddress !== walletAddress) {
    throw new Error('Exchange wallet must match the signing wallet.');
  }

  const rewardId = normalizeId(payload.rewardId);
  const collectionAddress = getAddress(String(payload.collectionAddress)).toLowerCase();
  const tokenId = normalizeTokenId(payload.tokenId);
  const serverWalletAddress = process.env.SERVER_WALLET_ADDRESS || DEFAULT_SERVER_WALLET_ADDRESS;

  await verifyNftHeldByServer({
    collectionAddress,
    tokenId,
    serverWalletAddress
  });

  const supabase = createSupabaseAdminClient();
  const { data: reward, error: rewardError } = await supabase
    .from('burn_rewards')
    .select('*')
    .eq('id', rewardId)
    .single();

  if (rewardError || !reward) {
    throw new Error('Reward configuration was not found.');
  }

  if (reward.collection_address.toLowerCase() !== collectionAddress) {
    throw new Error('Reward does not match this NFT collection.');
  }

  if (reward.token_id && String(reward.token_id) !== tokenId) {
    throw new Error('Reward does not match this token.');
  }

  const transferTransactionHash = normalizeOptionalTransactionHash(payload.transferTransactionHash);

  if (transferTransactionHash) {
    const { data: existingExchange, error: existingError } = await supabase
      .from('exchange_logs')
      .select('*')
      .eq('transfer_transaction_hash', transferTransactionHash)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingExchange) {
      return sendJson(res, 200, { data: existingExchange });
    }
  }

  const logEntry = {
    id: crypto.randomUUID(),
    user_wallet_address: userWalletAddress,
    collection_address: collectionAddress,
    token_id: tokenId,
    reward_id: reward.id,
    usdt_amount: reward.usdt_amount,
    reward_type: reward.type,
    custom_reward_data: reward.custom_reward || null,
    user_info: normalizeUserInfo(payload.userInfo),
    transfer_transaction_hash: transferTransactionHash,
    status: 'pending_usdt'
  };

  const { data, error } = await supabase
    .from('exchange_logs')
    .insert([logEntry])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return sendJson(res, 200, { data });
}

async function getPendingExchanges(req, res) {
  const { walletAddress } = await verifySignedVotingRequest(req, 'getPendingExchanges', EXCHANGE_MESSAGE_SCOPE);
  requireAdminWallet(walletAddress);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('pending_exchanges_view')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return sendJson(res, 200, { data: data || [] });
}

async function markExchangeProcessed(req, res) {
  const { walletAddress, payload } = await verifySignedVotingRequest(req, 'markExchangeProcessed', EXCHANGE_MESSAGE_SCOPE);
  requireAdminWallet(walletAddress);

  const id = normalizeId(payload.exchangeId);
  const supabase = createSupabaseAdminClient();
  const updates = {
    status: 'processed',
    processed_by_admin_wallet: walletAddress,
    usdt_transaction_hash: normalizeOptionalTransactionHash(payload.usdtTransactionHash),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('exchange_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return sendJson(res, 200, { data });
}

function validateRewardPayload(payload) {
  const collectionAddress = getAddress(String(payload.collectionAddress)).toLowerCase();
  const tokenId = payload.tokenId ? normalizeTokenId(payload.tokenId) : null;
  const usdtAmount = Number(payload.usdtAmount);
  const type = payload.type;

  if (!['usdt', 'custom'].includes(type)) {
    throw new Error('Reward type is invalid.');
  }

  if (!Number.isFinite(usdtAmount) || usdtAmount < 0 || (type === 'usdt' && usdtAmount <= 0)) {
    throw new Error('USDT amount is invalid.');
  }

  return {
    collection_address: collectionAddress,
    token_id: tokenId,
    usdt_amount: usdtAmount,
    type,
    custom_reward: type === 'custom' ? normalizeCustomReward(payload.customReward) : null
  };
}

function toFrontendReward(dbReward) {
  return {
    id: dbReward.id,
    collectionAddress: dbReward.collection_address,
    tokenId: dbReward.token_id,
    usdtAmount: Number(dbReward.usdt_amount),
    type: dbReward.type,
    customReward: dbReward.custom_reward || undefined
  };
}

function normalizeCustomReward(value) {
  if (!value || typeof value !== 'object') {
    throw new Error('Custom reward details are required.');
  }

  return {
    title: normalizeText(value.title, 120),
    description: normalizeText(value.description, 1000),
    image: value.image ? String(value.image).trim().slice(0, 500) : '',
    requiresInfo: Boolean(value.requiresInfo)
  };
}

function normalizeUserInfo(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return {
    name: normalizeText(value.name, 120),
    email: normalizeText(value.email, 200),
    phone: normalizeText(value.phone, 50),
    address: normalizeText(value.address, 500)
  };
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function normalizeTokenId(value) {
  const tokenId = String(value).trim();
  if (!/^\d+$/.test(tokenId)) {
    throw new Error('Token ID is invalid.');
  }

  return tokenId;
}

function normalizeId(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9:_-]{1,120}$/.test(value)) {
    throw new Error('ID is invalid.');
  }

  return value;
}

function normalizeOptionalTransactionHash(value) {
  if (!value) {
    return null;
  }

  const hash = String(value).trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    throw new Error('Transaction hash is invalid.');
  }

  return hash.toLowerCase();
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
