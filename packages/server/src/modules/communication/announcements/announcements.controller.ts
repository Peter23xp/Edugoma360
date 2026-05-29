import { Request, Response } from 'express';
import { AnnouncementsService } from './announcements.service';

export class AnnouncementsController {

  public static list = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { priority, status, audience } = req.query as any;
      const result = await AnnouncementsService.list(schoolId, { priority, status, audience });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static getActive = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const result = await AnnouncementsService.getActive(schoolId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static create = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const createdById = req.user?.userId || '';
      const result = await AnnouncementsService.create(req.body, schoolId, createdById);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static update = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { id } = req.params;
      const result = await AnnouncementsService.update(id, schoolId, req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static archive = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { id } = req.params;
      const result = await AnnouncementsService.archive(id, schoolId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static recordView = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId || '';
      const { id } = req.params;
      const result = await AnnouncementsService.recordView(id, userId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
