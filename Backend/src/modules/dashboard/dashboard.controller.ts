import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { DashboardService } from './dashboard.service';

export const DashboardController = {
  async getKPIs(req: AuthRequest, res: Response) {
    try {
      const { warehouse_id } = req.query;
      const result = await DashboardService.getKPIs({
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Dashboard KPI error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
