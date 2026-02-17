import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
    async generateBulletin(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await reportsService.generateBulletin(
                req.params.studentId, req.params.termId, req.user!.schoolId,
            );
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="bulletin_${req.params.studentId}.pdf"`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    async generatePalmares(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await reportsService.generatePalmares(
                req.params.classId, req.params.termId, req.user!.schoolId,
            );
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="palmares_${req.params.classId}.pdf"`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    async generateReceipt(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await reportsService.generateReceipt(req.params.paymentId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="recu_${req.params.paymentId}.pdf"`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }
}

export const reportsController = new ReportsController();
