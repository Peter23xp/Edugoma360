import { Request, Response, NextFunction } from 'express';
import { statsService } from './stats.service';

export class StatsController {
  async getEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const academicYearId = req.query.academicYearId as string | undefined;

      const result = await statsService.getEnrollment(schoolId, academicYearId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getClassAverages(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const result = await statsService.getClassAverages(schoolId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
