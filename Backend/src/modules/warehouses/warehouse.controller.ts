import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { WarehouseService } from './warehouse.service';

export const WarehouseController = {
  async list(req: AuthRequest, res: Response) {
    try {
      res.json(await WarehouseService.list());
    } catch (err) {
      console.error('Warehouse list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await WarehouseService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Warehouse get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await WarehouseService.create(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Warehouse create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await WarehouseService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Warehouse update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await WarehouseService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Warehouse delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
