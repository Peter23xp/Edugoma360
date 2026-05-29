import { Request, Response } from 'express';
import { ConvocationsService } from './convocations.service';

export class ConvocationsController {

  public static list = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { motif, status, classId, search } = req.query as any;
      const result = await ConvocationsService.list(schoolId, { motif, status, classId, search });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static create = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const createdById = req.user?.userId || '';
      const result = await ConvocationsService.create(req.body, schoolId, createdById);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static updateStatus = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { id } = req.params;
      const result = await ConvocationsService.updateStatus(id, schoolId, req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static searchStudents = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const { q = '' } = req.query as any;
      const results = await ConvocationsService.searchStudents(schoolId, q);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
