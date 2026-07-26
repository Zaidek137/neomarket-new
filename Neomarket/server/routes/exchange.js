import express from 'express';

const router = express.Router();

router.use((_req, res) => {
  res.set('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    error: 'NeoMarket blockchain exchange processing has been retired.',
    code: 'BLOCKCHAIN_EXCHANGE_RETIRED'
  });
});

export default router;
