import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', WarehouseController.list);
router.get('/:id', WarehouseController.get);
router.post('/', WarehouseController.create);
router.put('/:id', WarehouseController.update);
router.delete('/:id', WarehouseController.remove);

export default router;
