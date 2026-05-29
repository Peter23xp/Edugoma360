import { Request, Response } from 'express';
import { SMSService } from './sms.service';

export class SMSController {
  
  public static getPreviewRecipients = async (req: Request, res: Response) => {
    try {
      const schoolId = (req as any).user?.schoolId || 'default-school-id';
      const { type = 'PARENTS', classes, paymentStatus, attendance } = req.query as any;
      const result = await SMSService.getPreviewRecipients(schoolId, { type, classes, paymentStatus, attendance });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get recipients' });
    }
  };

  public static getBalance = async (req: Request, res: Response) => {
    try {
      const balance = await SMSService.getBalance();
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get balance' });
    }
  };

  public static sendCampaign = async (req: Request, res: Response) => {
    try {
      // Assuming req.user contains schoolId and userId from authentication middleware
      const schoolId = (req as any).user?.schoolId || 'default-school-id';
      const createdById = (req as any).user?.userId || 'default-user-id';

      // Ensure req.body has necessary fields
      const { recipients, template, scheduledAt, recipientType } = req.body;

      if (!recipients || !template) {
        return res.status(400).json({ error: 'Recipients and template are required' });
      }

      const result = await SMSService.sendCampaign(
        { recipients, template, scheduledAt, recipientType }, 
        schoolId, 
        createdById
      );
      
      res.status(202).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to send campaign' });
    }
  };

  public static getCampaignStatus = async (req: Request, res: Response) => {
    try {
      const schoolId = (req as any).user?.schoolId || 'default-school-id';
      const { jobId } = req.params;

      const result = await SMSService.getCampaignStatus(jobId, schoolId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Campaign not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to get campaign status' });
    }
  };

  public static getHistory = async (req: Request, res: Response) => {
    try {
      const schoolId = (req as any).user?.schoolId || 'default-school-id';
      
      const history = await SMSService.getHistory(schoolId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get history' });
    }
  };
}
