import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.get);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;
