import { Request, Response, NextFunction } from 'express';
import { budgetsService } from './budgets.service';
import { ApiError } from '../../middleware/errorHandler.middleware';
import prisma from '../../lib/prisma';

export class BudgetsController {

  async getBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      let { academicYearId } = req.params;

      if (!academicYearId || academicYearId === 'active') {
        const activeYear = await prisma.academicYear.findFirst({
          where: { schoolId, isActive: true },
        });
        if (!activeYear) throw new ApiError('Aucune année scolaire active', 404);
        academicYearId = activeYear.id;
      }

      const result = await budgetsService.getBudget(schoolId, academicYearId);
      // Include resolved academicYearId in response
      res.json({ ...result, academicYearId });
    } catch (error) {
      next(error);
    }
  }

  async upsertBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { academicYearId, categories, monthlyDistribution, months } = req.body;

      if (!academicYearId || !categories || categories.length === 0) {
        throw new ApiError('Données manquantes', 400);
      }

      const budget = await budgetsService.upsertBudget(schoolId, {
        academicYearId,
        categories,
        monthlyDistribution: monthlyDistribution || 'UNIFORM',
        months,
      });

      res.status(201).json({ budget });
    } catch (error) {
      next(error);
    }
  }
}

export const budgetsController = new BudgetsController();
