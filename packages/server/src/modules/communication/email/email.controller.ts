import { Request, Response } from 'express';
import { EmailService } from './email.service';

export class EmailController {

  public static sendCampaign = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const createdById = req.user?.userId || '';

      const { recipientEmails, recipientType, subject, htmlContent, cc, scheduledAt } = req.body;

      if (!recipientEmails || !subject || !htmlContent) {
        return res.status(400).json({ error: 'recipientEmails, subject et htmlContent sont requis' });
      }

      const emails: string[] = typeof recipientEmails === 'string'
        ? JSON.parse(recipientEmails)
        : recipientEmails;

      if (emails.length === 0) {
        return res.status(400).json({ error: 'Aucun destinataire' });
      }

      const attachmentPaths = (req.files as Express.Multer.File[] | undefined)?.map((f) => f.path) ?? [];

      const result = await EmailService.sendCampaign(
        { recipientEmails: emails, recipientType: recipientType || 'ALL', subject, htmlContent, cc, scheduledAt, attachmentPaths },
        schoolId,
        createdById,
      );

      res.status(202).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erreur envoi email' });
    }
  };

  public static getHistory = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const history = await EmailService.getHistory(schoolId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
