import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  public static get = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const data = await DashboardService.getDashboard(schoolId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
