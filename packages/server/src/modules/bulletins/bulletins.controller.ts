import { Request, Response, NextFunction } from 'express';
import { bulletinsService } from './bulletins.service';

export class BulletinsController {
    /**
     * GET /api/bulletin/:studentId/:termId
     * Generate and stream a single student bulletin PDF
     */
    async generateBulletin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, termId } = req.params;
            const schoolId = req.user!.schoolId;

            const pdf = await bulletinsService.generateBulletin(studentId, termId, schoolId);

            // Need to get student matricule for the filename
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="Bulletin_${studentId}_T${termId}.pdf"`,
            );
            res.setHeader('Content-Length', pdf.length);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/bulletin/batch
     * Trigger bulletin generation for an entire class (returns jobId)
     */
    async createBatchJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { classId, termId } = req.body as { classId: string; termId: string };

            if (!classId || !termId) {
                res.status(400).json({
                    error: { code: 'VALIDATION_ERROR', message: 'classId et termId sont requis' },
                });
                return;
            }

            const schoolId = req.user!.schoolId;
            const jobId = await bulletinsService.createBatchJob(classId, termId, schoolId);

            res.json({ jobId, message: 'Génération des bulletins en cours' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/bulletin/batch/:jobId
     * Poll the status of a batch generation job
     */
    getBatchJobStatus(req: Request, res: Response, next: NextFunction): void {
        try {
            const { jobId } = req.params;

            const job = bulletinsService.getBatchJobStatus(jobId);

            if (!job) {
                res.status(404).json({
                    error: { code: 'JOB_NOT_FOUND', message: 'Job introuvable' },
                });
                return;
            }

            res.json({
                jobId: job.id,
                status: job.status,
                total: job.totalStudents,
                processed: job.processed,
                progress: job.totalStudents > 0
                    ? Math.round((job.processed / job.totalStudents) * 100)
                    : 0,
                results: job.results,
                createdAt: job.createdAt,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const bulletinsController = new BulletinsController();
