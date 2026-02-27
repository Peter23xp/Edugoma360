import { Request, Response, NextFunction } from 'express';
import { teachersReportsService } from './teachers-reports.service';

export class TeachersReportsController {
    /**
     * Overview metrics
     */
    async getOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const { termId, sectionId } = req.query;
            const result = await teachersReportsService.getOverview(req.user!.schoolId, {
                termId: termId as string,
                sectionId: sectionId as string
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Teacher ranking
     */
    async getRanking(req: Request, res: Response, next: NextFunction) {
        try {
            const { termId, sortBy } = req.query;
            if (!termId) {
                return res.status(400).json({ error: { message: "Trimestre requis" } });
            }
            const result = await teachersReportsService.getRanking(req.user!.schoolId, {
                termId: termId as string,
                sortBy: sortBy as string || 'performance'
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Workload distribution
     */
    async getWorkload(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await teachersReportsService.getWorkloadData(req.user!.schoolId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Attendance heatmap
     */
    async getAttendanceHeatmap(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate as string) : new Date();

            const result = await teachersReportsService.getAttendanceHeatmap(req.user!.schoolId, start, end);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Performance chart
     */
    async getPerformanceChart(req: Request, res: Response, next: NextFunction) {
        try {
            const { teacherIds } = req.query;
            const ids = teacherIds ? (teacherIds as string).split(',') : [];
            const result = await teachersReportsService.getPerformanceChart(req.user!.schoolId, ids);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export report
     */
    async exportReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { format, termId } = req.query;
            const result = await teachersReportsService.export(req.user!.schoolId, {
                format: format as string,
                termId: termId as string
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const teachersReportsController = new TeachersReportsController();
