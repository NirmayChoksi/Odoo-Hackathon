import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ProductService } from './product.service';

export const ProductController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { category_id, search } = req.query;
      const result = await ProductService.list({
        category_id: category_id ? Number(category_id) : undefined,
        search: search as string | undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Product list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await ProductService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Product get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await ProductService.create(req.body, req.user!.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Product create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await ProductService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Product update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await ProductService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Product delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async getStock(req: AuthRequest, res: Response) {
    try {
      const result = await ProductService.getStock(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Product stock error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
