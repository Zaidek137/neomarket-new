import { Router } from 'express';
import { getAssets } from '../controllers/assetController';
import { validateAddress } from '../middleware/validateAddress';

const router = Router();

router.get(
  '/:address',
  validateAddress,
  async (req, res, next) => {
    try {
      const { address } = req.params;
      const assets = await getAssets(address);
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }
);

export const assetRouter = router;