export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: 'Token-governed NeoMarket proposals have been retired.',
    code: 'TOKEN_GOVERNANCE_RETIRED'
  });
}
