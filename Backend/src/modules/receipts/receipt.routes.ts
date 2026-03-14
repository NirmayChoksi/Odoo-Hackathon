import { Router } from 'express';
import { ReceiptController } from './receipt.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', ReceiptController.list);
router.get('/:id', ReceiptController.get);
router.post('/', ReceiptController.create);
router.post('/:id/items', ReceiptController.addItem);
router.delete('/:id/items/:itemId', ReceiptController.removeItem);
router.patch('/:id/status', ReceiptController.updateStatus);
router.post('/:id/validate', ReceiptController.validate);
router.post('/:id/cancel', ReceiptController.cancel);

export default router;
