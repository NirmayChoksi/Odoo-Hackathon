import { Router } from 'express';
import { DeliveryController } from './delivery.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', DeliveryController.list);
router.get('/:id', DeliveryController.get);
router.post('/', DeliveryController.create);
router.post('/:id/items', DeliveryController.addItem);
router.delete('/:id/items/:itemId', DeliveryController.removeItem);
router.patch('/:id/status', DeliveryController.updateStatus);
router.post('/:id/validate', DeliveryController.validate);
router.post('/:id/cancel', DeliveryController.cancel);

export default router;
