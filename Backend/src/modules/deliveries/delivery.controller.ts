import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { DeliveryService } from './delivery.service';

export const DeliveryController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { status, warehouse_id } = req.query;
      const result = await DeliveryService.list({
        status: status as string | undefined,
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Delivery list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Delivery get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.create(req.body, req.user!.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Delivery create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async addItem(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.addItem(Number(req.params.id), req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Delivery addItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.removeItem(Number(req.params.id), Number(req.params.itemId));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Delivery removeItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.updateStatus(Number(req.params.id), req.body.status);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Delivery updateStatus error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.validate(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Delivery validate error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async cancel(req: AuthRequest, res: Response) {
    try {
      const result = await DeliveryService.cancel(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Delivery cancel error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
