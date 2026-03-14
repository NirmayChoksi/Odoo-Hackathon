import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TransferService } from './transfer.service';

export const TransferController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.list({ status: req.query.status as string | undefined });
      res.json(result);
    } catch (err) {
      console.error('Transfer list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Transfer get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.create(req.body, req.user!.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Transfer create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async addItem(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.addItem(Number(req.params.id), req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Transfer addItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.removeItem(Number(req.params.id), Number(req.params.itemId));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Transfer removeItem error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.updateStatus(Number(req.params.id), req.body.status);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Transfer updateStatus error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.validate(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Transfer validate error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async cancel(req: AuthRequest, res: Response) {
    try {
      const result = await TransferService.cancel(Number(req.params.id));
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Transfer cancel error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
