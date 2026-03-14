import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { LocationService } from './location.service';

export const LocationController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { warehouse_id } = req.query;
      const result = await LocationService.list(warehouse_id ? Number(warehouse_id) : undefined);
      res.json(result);
    } catch (err) {
      console.error('Location list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await LocationService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Location get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await LocationService.create(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Location create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await LocationService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Location update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await LocationService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Location delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
