import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service';
import { CreatePaymentDto, FinanceQueryDto } from './finance.dto';

export class FinanceController {
    async createPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreatePaymentDto.parse(req.body);
            const payment = await financeService.createPayment(req.user!.schoolId, req.user!.userId, data);
            res.status(201).json({ data: payment });
        } catch (error) { next(error); }
    }

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const query = FinanceQueryDto.parse(req.query);
            const result = await financeService.getPayments(req.user!.schoolId, query);
            res.json(result);
        } catch (error) { next(error); }
    }

    async getStudentBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const balance = await financeService.getStudentBalance(req.params.studentId, req.user!.schoolId);
            res.json({ data: balance });
        } catch (error) { next(error); }
    }

    async getDebts(req: Request, res: Response, next: NextFunction) {
        try {
            const debts = await financeService.getDebts(req.user!.schoolId);
            res.json({ data: debts });
        } catch (error) { next(error); }
    }

    async getMonthlySummary(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await financeService.getMonthlySummary(schoolId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    async getRecoveryChart(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await financeService.getRecoveryChart(schoolId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }
}

export const financeController = new FinanceController();
