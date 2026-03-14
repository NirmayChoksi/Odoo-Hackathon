import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AdjustmentService } from './adjustment.service';

export const AdjustmentController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { product_id, location_id } = req.query;
      const result = await AdjustmentService.list({
        product_id: product_id ? Number(product_id) : undefined,
        location_id: location_id ? Number(location_id) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Adjustment list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await AdjustmentService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Adjustment get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await AdjustmentService.create(req.body, req.user!.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Adjustment create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
