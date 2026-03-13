import { Request, Response, NextFunction } from 'express';
import { cashSessionsService } from './cash-sessions.service';

export class CashSessionsController {
  async openSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { openingBalance, observations, date } = req.body;
      const schoolId = req.user!.schoolId;
      const cashierId = req.user!.userId;

      const session = await cashSessionsService.openSession({
        schoolId,
        cashierId,
        date: date ? new Date(date) : new Date(),
        openingBalance: Number(openingBalance),
        observations
      });

      res.status(201).json({ session });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentSession(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const cashierId = req.user!.userId;
      
      const session = await cashSessionsService.getCurrentSession(schoolId, cashierId);
      
      res.json({ session });
    } catch (error) {
      next(error);
    }
  }

  async recordExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type, amount, beneficiary, motif, receiptFile } = req.body;
      const cashierId = req.user!.userId;

      const movement = await cashSessionsService.recordExpense(id, {
        type,
        amount: Number(amount),
        beneficiary,
        motif,
        receiptFile,
        cashierId
      });

      res.status(201).json({ movement });
    } catch (error) {
      next(error);
    }
  }

  async closeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { actualBalance, denominations, discrepancyReason, discrepancyDetails } = req.body;
      const cashierId = req.user!.userId;

      const result = await cashSessionsService.closeSession(id, {
        actualBalance: Number(actualBalance),
        denominations,
        discrepancyReason,
        discrepancyDetails,
        cashierId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const cashSessionsController = new CashSessionsController();
