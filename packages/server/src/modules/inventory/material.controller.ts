import { Request, Response, NextFunction } from 'express';
import { materialService } from './material.service';

class MaterialController {
  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const { category, status, search } = req.query;
      const data = await materialService.getItems(schoolId, {
        category: category as string,
        status: status as string,
        search: search as string,
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const item = await materialService.createItem(schoolId, req.body);
      res.status(201).json({ item });
    } catch (e) {
      next(e);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const item = await materialService.updateItem(schoolId, req.params.id, req.body);
      res.json({ item });
    } catch (e) {
      next(e);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      await materialService.deleteItem(schoolId, req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }

  async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      const userId = req.user?.id;
      if (!schoolId || !userId) return res.status(401).json({ error: 'Non autorisé' });

      const item = await materialService.createMovement(schoolId, req.params.id, userId, req.body);
      res.json({ item });
    } catch (e) {
      next(e);
    }
  }

  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });

      const movements = await materialService.getMovements(schoolId, req.params.id);
      res.json({ movements });
    } catch (e) {
      next(e);
    }
  }
}

export const materialController = new MaterialController();
