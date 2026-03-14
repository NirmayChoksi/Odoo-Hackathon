import { Router } from 'express';
import { TransferController } from './transfer.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', TransferController.list);
router.get('/:id', TransferController.get);
router.post('/', TransferController.create);
router.post('/:id/items', TransferController.addItem);
router.delete('/:id/items/:itemId', TransferController.removeItem);
router.patch('/:id/status', TransferController.updateStatus);
router.post('/:id/validate', TransferController.validate);
router.post('/:id/cancel', TransferController.cancel);

export default router;
