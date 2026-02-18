import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';

export class AlertsController {
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const status = req.query.status as string | undefined;

      const result = await alertsService.getAlerts(schoolId, status);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const alertsController = new AlertsController();
