import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReceiptService } from './receipt.service';

export const ReceiptController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { status, warehouse_id } = req.query;
      const result = await ReceiptService.list({
        status: status as string | undefined,
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Receipt list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Receipt get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.create(req.body, req.user!.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Receipt create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async addItem(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.addItem(Number(req.params.id), req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Receipt addItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.removeItem(Number(req.params.id), Number(req.params.itemId));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Receipt removeItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.updateStatus(Number(req.params.id), req.body.status);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Receipt updateStatus error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.validate(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Receipt validate error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async cancel(req: AuthRequest, res: Response) {
    try {
      const result = await ReceiptService.cancel(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Receipt cancel error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
