import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', ProductController.list);
router.get('/:id', ProductController.get);
router.get('/:id/stock', ProductController.getStock);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.remove);

export default router;
