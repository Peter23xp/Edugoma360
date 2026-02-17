import { Request, Response, NextFunction } from 'express';
import { syncService } from './sync.service';

export class SyncController {
    async pushSync(req: Request, res: Response, next: NextFunction) {
        try {
            const { items } = req.body;
            const result = await syncService.processSyncQueue(
                items, req.user!.userId, req.user!.schoolId,
            );
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async getSyncStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const status = await syncService.getSyncStatus(req.user!.schoolId);
            res.json({ data: status });
        } catch (error) {
            next(error);
        }
    }
}

export const syncController = new SyncController();
