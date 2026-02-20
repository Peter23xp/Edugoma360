import { Request, Response, NextFunction } from 'express';
import { gradesService } from './grades.service';

export class GradesController {
    async getGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId, termId, evalType, studentId } = req.query;

            const result = await gradesService.getGrades(
                {
                    classId: classId as string,
                    subjectId: subjectId as string,
                    termId: termId as string,
                    evalType: evalType as string,
                    studentId: studentId as string,
                },
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async upsertGrade(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId, subjectId, termId, evalType, score, observation } = req.body;

            const result = await gradesService.upsertGrade(
                {
                    studentId,
                    subjectId,
                    termId,
                    evalType,
                    score,
                    observation,
                },
                req.user!.schoolId,
                req.user!.id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async batchUpsertGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { grades, subjectId, termId, evalType } = req.body;

            const result = await gradesService.batchUpsertGrades(
                grades,
                subjectId,
                termId,
                evalType,
                req.user!.schoolId,
                req.user!.id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async lockGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId, termId, evalType } = req.body;

            const result = await gradesService.lockGrades(
                classId,
                subjectId,
                termId,
                evalType,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async unlockGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId, termId, evalType } = req.body;

            const result = await gradesService.unlockGrades(
                classId,
                subjectId,
                termId,
                evalType,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async batchSync(req: Request, res: Response, next: NextFunction) {
        try {
            const { queue, deviceId } = req.body;

            const result = await gradesService.batchSync(
                queue,
                req.user!.schoolId,
                deviceId,
                req.user!.id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getClassMatrix(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId } = req.params;
            const { termId, evalType } = req.query;

            const result = await gradesService.getClassMatrix(
                classId,
                termId as string,
                evalType as string,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAverages(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.query;

            if (!classId || !termId) {
                return res.status(400).json({ message: 'classId and termId are required' });
            }

            const result = await gradesService.getAverages(
                classId as string,
                termId as string,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async calculateAverages(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.body;

            const result = await gradesService.calculateAverages(
                classId,
                termId,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async validateAverages(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.body;

            const result = await gradesService.validateAverages(
                classId,
                termId,
                req.user!.schoolId,
                req.user!.id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const gradesController = new GradesController();
