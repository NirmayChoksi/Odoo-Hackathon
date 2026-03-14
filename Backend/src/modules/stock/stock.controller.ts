import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { StockService } from './stock.service';

export const StockController = {
  async getLedger(req: AuthRequest, res: Response) {
    try {
      const { product_id, location_id, warehouse_id, movement_type, page, limit } = req.query;
      const result = await StockService.getLedger({
        product_id: product_id ? Number(product_id) : undefined,
        location_id: location_id ? Number(location_id) : undefined,
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
        movement_type: movement_type as string | undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });
      res.json(result);
    } catch (err) {
      console.error('Stock ledger error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async getBalances(req: AuthRequest, res: Response) {
    try {
      const { product_id, location_id, warehouse_id } = req.query;
      const result = await StockService.getBalances({
        product_id: product_id ? Number(product_id) : undefined,
        location_id: location_id ? Number(location_id) : undefined,
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Stock balances error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async getLowStock(req: AuthRequest, res: Response) {
    try {
      const result = await StockService.getLowStock();
      res.json(result);
    } catch (err) {
      console.error('Low stock error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async adjustBalance(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { quantity, reserved_quantity, note } = req.body;
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid balance ID.' });
      if (quantity == null || quantity < 0) return res.status(400).json({ success: false, message: 'quantity must be ≥ 0.' });
      const result = await StockService.adjustBalance(id, {
        quantity: Number(quantity),
        reserved_quantity: Number(reserved_quantity ?? 0),
        note,
      });
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Adjust balance error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async getProductSummary(req: AuthRequest, res: Response) {
    try {
      const result = await StockService.getProductSummary(Number(req.params.productId));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Product summary error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
