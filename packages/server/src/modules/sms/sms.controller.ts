import { Request, Response, NextFunction } from 'express';
import { smsService } from './sms.service';

export class SmsController {
    async sendSms(req: Request, res: Response, next: NextFunction) {
        try {
            const { to, message, language } = req.body;
            const result = await smsService.sendAndLog(req.user!.schoolId, to, message, language);
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async sendBulk(req: Request, res: Response, next: NextFunction) {
        try {
            const { recipients, templateKey, templateData, language } = req.body;
            const results = await smsService.sendBulkFromTemplate(
                req.user!.schoolId, recipients, templateKey, templateData, language,
            );
            res.json({ data: results });
        } catch (error) {
            next(error);
        }
    }

    async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const logs = await smsService.getLogs(req.user!.schoolId);
            res.json({ data: logs });
        } catch (error) {
            next(error);
        }
    }
}

export const smsController = new SmsController();
