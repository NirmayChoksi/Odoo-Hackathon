import { Router } from 'express';
import { AdjustmentController } from './adjustment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', AdjustmentController.list);
router.get('/:id', AdjustmentController.get);
router.post('/', AdjustmentController.create);

export default router;
