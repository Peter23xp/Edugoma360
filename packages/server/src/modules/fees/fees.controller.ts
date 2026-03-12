import { Request, Response, NextFunction } from 'express';
import { feesService } from './fees.service';

export class FeesController {
  async getFees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feesService.getFees(req.user!.schoolId, {
        academicYearId: req.query.academicYearId as string,
        scope: req.query.scope as string,
        type: req.query.type as string,
      });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createFee(req: Request, res: Response, next: NextFunction) {
    try {
      const fee = await feesService.createFee(req.user!.schoolId, req.body);
      res.status(201).json({ data: fee });
    } catch (error) {
      next(error);
    }
  }

  async updateFee(req: Request, res: Response, next: NextFunction) {
    try {
      const fee = await feesService.updateFee(req.params.id, req.user!.schoolId, req.body);
      res.json({ data: fee });
    } catch (error) {
      next(error);
    }
  }

  async deleteFee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feesService.deleteFee(req.params.id, req.user!.schoolId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async archiveFee(req: Request, res: Response, next: NextFunction) {
    try {
      const fee = await feesService.archiveFee(req.params.id, req.user!.schoolId);
      res.json({ data: fee });
    } catch (error) {
      next(error);
    }
  }

  async createFromTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateName } = req.body;
      if (!templateName) {
        res.status(400).json({ message: 'templateName est requis' });
        return;
      }
      const result = await feesService.createFromTemplate(req.user!.schoolId, templateName);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async calculateStudentFees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feesService.calculateStudentFees(req.params.studentId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const feesController = new FeesController();
