import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CategoryService } from './category.service';

export const CategoryController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await CategoryService.list();
      res.json(result);
    } catch (err) {
      console.error('Category list error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async get(req: AuthRequest, res: Response) {
    try {
      const result = await CategoryService.get(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Category get error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await CategoryService.create(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Category create error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await CategoryService.update(Number(req.params.id), req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Category update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await CategoryService.delete(Number(req.params.id));
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Category delete error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
