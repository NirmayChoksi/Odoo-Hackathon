import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CustomerService } from './customer.service';

export const CustomerController = {
  async list(req: AuthRequest, res: Response) {
    try {
      res.json(await CustomerService.list(req.query.search as string | undefined));
    } catch (err) {
      console.error('Customer list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await CustomerService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Customer get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await CustomerService.create(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Customer create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await CustomerService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Customer update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await CustomerService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Customer delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
