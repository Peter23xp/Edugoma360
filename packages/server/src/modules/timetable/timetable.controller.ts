import { Request, Response, NextFunction } from 'express';
import { timetableService } from './timetable.service';

export class TimetableController {
    async getTeacherTimetable(req: Request, res: Response, next: NextFunction) {
        try {
            const { teacherId } = req.params;

            const result = await timetableService.getTeacherTimetable(
                teacherId,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getClassTimetable(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId } = req.params;

            const result = await timetableService.getClassTimetable(
                classId,
                req.user!.schoolId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async createPeriod(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId, teacherId, dayOfWeek, periodSlot } = req.body;

            const result = await timetableService.createPeriod(
                {
                    classId,
                    subjectId,
                    teacherId,
                    dayOfWeek,
                    periodSlot,
                },
                req.user!.schoolId
            );

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deletePeriod(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await timetableService.deletePeriod(id, req.user!.schoolId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const timetableController = new TimetableController();
