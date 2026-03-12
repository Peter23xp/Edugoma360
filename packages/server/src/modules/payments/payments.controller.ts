import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';
import { CreatePaymentDto } from './payments.dto';

export class PaymentsController {
  async getStudentFeesDue(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
      const data = await paymentsService.getStudentFeesDue(req.params.studentId, schoolId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
      const data = await paymentsService.getPayments(schoolId, req.query as any);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      const cashierId = req.user?.id;
      if (!schoolId || !cashierId) return res.status(401).json({ error: 'Non autorisé' });

      const dto = CreatePaymentDto.parse(req.body);
      const { payment, receiptNumber } = await paymentsService.createPayment(schoolId, cashierId, dto);

      res.status(201).json({ 
        success: true, 
        payment, 
        receiptNumber,
        receiptUrl: `/api/payments/${payment.id}/receipt`
      });
    } catch (e) {
      next(e);
    }
  }
}

export const paymentsController = new PaymentsController();
