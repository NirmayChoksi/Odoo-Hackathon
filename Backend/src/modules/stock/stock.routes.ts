import { Router } from 'express';
import { StockController } from './stock.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate as any);

router.get('/ledger', StockController.getLedger);
router.get('/balances', StockController.getBalances);
router.get('/low-stock', StockController.getLowStock);
router.get('/products/:productId/summary', StockController.getProductSummary);

export default router;
