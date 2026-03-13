
import type { Request, Response, NextFunction } from 'express';
import { debtsService } from './debts.service';

export class DebtsController {
  async getDebts(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const data = await debtsService.getDebts(schoolId, req.query as any);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async sendReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const result = await debtsService.sendReminders(schoolId, req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async createPaymentPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const result = await debtsService.createPaymentPlan(schoolId, req.params.studentId, req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export const debtsController = new DebtsController();
