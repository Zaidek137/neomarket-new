function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

export default function handler(_req, res) {
  return sendJson(res, 410, {
    error: 'NeoMarket blockchain exchange rewards have been retired.',
    code: 'BLOCKCHAIN_EXCHANGE_RETIRED'
  });
}
