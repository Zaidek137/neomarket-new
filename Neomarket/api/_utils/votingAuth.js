import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, getAddress, http, verifyMessage } from 'viem';
import { polygon } from 'viem/chains';

const REQUEST_MAX_AGE_MS = 10 * 60 * 1000;
const DEFAULT_NFT_COLLECTION_ADDRESS = '0x98E52EF271F0ff90F2f76A40Cb6A27dA011d279F';

const allowedCategories = new Set(['music', 'gaming', 'city_voting', 'creative_content']);
const allowedVoteTypes = new Set(['for', 'against']);

export function handleCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedCorsOrigin(origin);

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else if (origin) {
    sendJson(res, 403, { error: 'Origin is not allowed.' });
    return true;
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

function getAllowedCorsOrigin(origin) {
  if (!origin) {
    return null;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return null;
  }

  const allowedOrigins = [
    process.env.NEOMARKET_ALLOWED_ORIGINS,
    process.env.ALLOWED_ORIGINS,
    process.env.APP_URL,
    process.env.VITE_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL
  ]
    .flatMap((value) => (value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((value) => [value, value.startsWith('http') ? value : `https://${value}`])
    .map(normalizeOrigin)
    .filter(Boolean);

  const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(normalizedOrigin);
  if (isLocalOrigin && process.env.NODE_ENV !== 'production') {
    return origin;
  }

  return allowedOrigins.includes(normalizedOrigin) ? origin : null;
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function normalizeWallet(walletAddress) {
  if (!walletAddress || typeof walletAddress !== 'string') {
    throw new Error('Wallet address is required.');
  }

  return getAddress(walletAddress).toLowerCase();
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role configuration is missing.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function requireAdminWallet(walletAddress) {
  const configuredWallets = [
    process.env.NEOMARKET_ADMIN_WALLETS,
    process.env.ADMIN_WALLETS
  ]
    .flatMap((value) => (value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => normalizeWallet(value));

  if (configuredWallets.length === 0) {
    throw new Error('Admin wallet configuration is missing.');
  }

  if (!configuredWallets.includes(normalizeWallet(walletAddress))) {
    throw new Error('Wallet is not authorized for this action.');
  }
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

export async function verifySignedVotingRequest(req, expectedAction, messageScope = 'NeoMarket Voting API') {
  const body = await readJsonBody(req);
  const { action, walletAddress, payload, nonce, timestamp, signature } = body;

  if (action !== expectedAction) {
    throw new Error('Invalid voting action.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Signed payload is required.');
  }

  if (!nonce || typeof nonce !== 'string' || nonce.length < 16) {
    throw new Error('A valid nonce is required.');
  }

  const requestTime = Number(timestamp);
  if (!Number.isFinite(requestTime) || Math.abs(Date.now() - requestTime) > REQUEST_MAX_AGE_MS) {
    throw new Error('Signed request has expired.');
  }

  const normalizedWallet = normalizeWallet(walletAddress);
  const payloadHash = hashPayload(payload);
  const message = buildVotingMessage({
    messageScope,
    action,
    walletAddress: normalizedWallet,
    nonce,
    timestamp: String(timestamp),
    payloadHash
  });

  const isValidSignature = await verifyMessage({
    address: normalizedWallet,
    message,
    signature
  });

  if (!isValidSignature) {
    throw new Error('Invalid wallet signature.');
  }

  return {
    walletAddress: normalizedWallet,
    payload
  };
}

export function validateProposalPayload(payload, walletAddress) {
  const title = normalizeText(payload.title, 160);
  const description = normalizeText(payload.description, 5000);
  const category = payload.category;
  const votesRequired = Number(payload.votes_required);
  const endDate = new Date(payload.end_date);

  if (!title) {
    throw new Error('Proposal title is required.');
  }

  if (!description) {
    throw new Error('Proposal description is required.');
  }

  if (!allowedCategories.has(category)) {
    throw new Error('Proposal category is invalid.');
  }

  if (!Number.isInteger(votesRequired) || votesRequired < 1 || votesRequired > 100000) {
    throw new Error('Votes required must be between 1 and 100000.');
  }

  if (Number.isNaN(endDate.getTime()) || endDate.getTime() <= Date.now()) {
    throw new Error('Proposal end date must be in the future.');
  }

  if (payload.created_by && normalizeWallet(payload.created_by) !== walletAddress) {
    throw new Error('Proposal creator must match the signing wallet.');
  }

  return {
    title,
    description,
    category,
    votes_required: votesRequired,
    created_by: walletAddress,
    start_date: new Date().toISOString(),
    end_date: endDate.toISOString(),
    image_url: normalizeOptionalUrl(payload.image_url)
  };
}

export function validateVotePayload(payload, walletAddress) {
  const proposalId = normalizeUuid(payload.proposalId || payload.proposal_id);
  const voteType = payload.voteType || payload.vote_type;

  if (!allowedVoteTypes.has(voteType)) {
    throw new Error('Vote type is invalid.');
  }

  if (payload.walletAddress && normalizeWallet(payload.walletAddress) !== walletAddress) {
    throw new Error('Vote wallet must match the signing wallet.');
  }

  return {
    proposal_id: proposalId,
    wallet_address: walletAddress,
    vote_type: voteType
  };
}

export function validateDeleteProposalPayload(payload) {
  return normalizeUuid(payload.proposalId || payload.proposal_id);
}

export async function verifyEkoOwnership(walletAddress) {
  const collectionAddress = getAddress(
    process.env.NFT_COLLECTION_ADDRESS ||
    process.env.EKO_NFT_COLLECTION_ADDRESS ||
    DEFAULT_NFT_COLLECTION_ADDRESS
  );

  const rpcUrl = process.env.POLYGON_RPC_URL || process.env.ALCHEMY_POLYGON_RPC_URL || 'https://polygon-rpc.com';
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(rpcUrl)
  });

  const balance = await publicClient.readContract({
    address: collectionAddress,
    abi: [
      {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'balanceOf',
    args: [getAddress(walletAddress)]
  });

  if (balance <= 0n) {
    throw new Error('You need to own at least one Eko to vote.');
  }
}

export async function verifyNftHeldByServer({ collectionAddress, tokenId, serverWalletAddress }) {
  const normalizedCollectionAddress = getAddress(collectionAddress);
  const normalizedServerWallet = getAddress(serverWalletAddress);
  const normalizedTokenId = BigInt(String(tokenId));
  const rpcUrl = process.env.POLYGON_RPC_URL || process.env.ALCHEMY_POLYGON_RPC_URL || 'https://polygon-rpc.com';
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(rpcUrl)
  });

  const owner = await publicClient.readContract({
    address: normalizedCollectionAddress,
    abi: [
      {
        type: 'function',
        name: 'ownerOf',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'address' }]
      }
    ],
    functionName: 'ownerOf',
    args: [normalizedTokenId]
  });

  if (getAddress(owner).toLowerCase() !== normalizedServerWallet.toLowerCase()) {
    throw new Error('The NFT transfer to the server wallet has not been confirmed.');
  }
}

function buildVotingMessage({ messageScope, action, walletAddress, nonce, timestamp, payloadHash }) {
  return [
    messageScope,
    `Action: ${action}`,
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
    `Payload Hash: ${payloadHash}`
  ].join('\n');
}

function hashPayload(payload) {
  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function normalizeOptionalUrl(value) {
  if (!value) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Image URL is invalid.');
  }

  const url = new URL(value);
  if (!['https:', 'ipfs:'].includes(url.protocol)) {
    throw new Error('Image URL must use HTTPS or IPFS.');
  }

  return url.toString();
}

function normalizeUuid(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error('Proposal id is invalid.');
  }

  return value;
}
