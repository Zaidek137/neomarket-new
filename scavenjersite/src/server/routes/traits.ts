import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { applyTrait } from '../controllers/traitController';
import { validateOwnership } from '../middleware/validateOwnership';

const router = Router();

router.post(
  '/apply',
  [
    body('tokenId').isString().notEmpty(),
    body('traitId').isString().notEmpty(),
    validateOwnership,
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await applyTrait(req.body.tokenId, req.body.traitId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export const traitRouter = router;