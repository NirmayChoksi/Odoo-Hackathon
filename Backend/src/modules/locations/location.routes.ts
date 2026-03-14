import { Router } from 'express';
import { LocationController } from './location.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', LocationController.list);
router.get('/:id', LocationController.get);
router.post('/', LocationController.create);
router.put('/:id', LocationController.update);
router.delete('/:id', LocationController.remove);

export default router;
