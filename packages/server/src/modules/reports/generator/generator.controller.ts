import { Request, Response } from 'express';
import { GeneratorService } from './generator.service';

export class GeneratorController {
  public static generate = async (req: Request, res: Response) => {
    try {
      const schoolId = req.user?.schoolId || '';
      const userId = req.user?.userId || '';
      const result = await GeneratorService.generate(req.body, schoolId, userId);
      res.status(202).json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static getSaved = async (req: Request, res: Response) => {
    try {
      const result = await GeneratorService.getSaved(req.user?.schoolId || '');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public static deleteSaved = async (req: Request, res: Response) => {
    try {
      await GeneratorService.deleteSaved(req.params.id, req.user?.schoolId || '');
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
