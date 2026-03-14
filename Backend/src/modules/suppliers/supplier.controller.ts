import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SupplierService } from './supplier.service';

export const SupplierController = {
  async list(req: AuthRequest, res: Response) {
    try {
      res.json(await SupplierService.list(req.query.search as string | undefined));
    } catch (err) {
      console.error('Supplier list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await SupplierService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Supplier get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await SupplierService.create(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Supplier create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await SupplierService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Supplier update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await SupplierService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Supplier delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
