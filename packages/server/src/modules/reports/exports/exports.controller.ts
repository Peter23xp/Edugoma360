import { Request, Response } from 'express';
import { ExportsService } from './exports.service';

export class ExportsController {
  public static quickExport = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const userId = req.user?.userId || '';
      const result = await ExportsService.quickExport(req.body, schoolId, userId);
      res.status(202).json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static getHistory = async (req: Request, res: Response) => {
    try {
      const result = await ExportsService.getHistory(req.user?.schoolId || '');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static getSchedules = async (req: Request, res: Response) => {
    try {
      const result = await ExportsService.getSchedules(req.user?.schoolId || '');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static createSchedule = async (req: Request, res: Response) => {
    try {
      const result = await ExportsService.createSchedule(req.body, req.user?.schoolId || '', req.user?.userId || '');
      res.status(201).json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static deleteSchedule = async (req: Request, res: Response) => {
    try {
      await ExportsService.deleteSchedule(req.params.id, req.user?.schoolId || '');
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
