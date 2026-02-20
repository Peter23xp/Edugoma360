import { Request, Response, NextFunction } from 'express';
import { deliberationService } from './deliberation.service';
import { deliberationBulletinService } from './deliberation.bulletin.service';

export class DeliberationController {
    async getDeliberationData(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;

            const result = await deliberationService.getDeliberationData(
                classId,
                termId,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async validateDeliberation(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;
            const { decisions } = req.body;

            const result = await deliberationService.validateDeliberation(
                classId,
                termId,
                decisions,
                req.user!.schoolId,
                (req.user as any)!.id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getDeliberationResults(req: Request, res: Response, next: NextFunction) {
        try {
            const { deliberationId } = req.params;

            const result = await deliberationService.getDeliberationResults(
                deliberationId,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getBulletinJobStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;

            const job = deliberationBulletinService.getJobStatus(jobId);

            if (!job) {
                res.status(404).json({ error: { code: 'JOB_NOT_FOUND', message: 'Job introuvable' } });
                return;
            }

            res.json({
                jobId: job.id,
                status: job.status,
                totalStudents: job.totalStudents,
                processed: job.processed,
                progress: job.totalStudents > 0
                    ? Math.round((job.processed / job.totalStudents) * 100)
                    : 0,
                errors: job.errors,
                createdAt: job.createdAt,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const deliberationController = new DeliberationController();
