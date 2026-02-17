import { Request, Response, NextFunction } from 'express';
import { teachersService } from './teachers.service';

export class TeachersController {
    async getTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            const teachers = await teachersService.getTeachers(req.user!.schoolId);
            res.json({ data: teachers });
        } catch (error) {
            next(error);
        }
    }

    async createTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const teacher = await teachersService.createTeacher(req.user!.schoolId, req.body);
            res.status(201).json({ data: teacher });
        } catch (error) {
            next(error);
        }
    }

    async updateTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const teacher = await teachersService.updateTeacher(req.params.id, req.body);
            res.json({ data: teacher });
        } catch (error) {
            next(error);
        }
    }

    async assignSubject(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId } = req.body;
            const assignment = await teachersService.assignSubjectToTeacher(
                req.params.id, classId, subjectId,
            );
            res.status(201).json({ data: assignment });
        } catch (error) {
            next(error);
        }
    }

    async removeAssignment(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, subjectId } = req.body;
            await teachersService.removeAssignment(req.params.id, classId, subjectId);
            res.json({ data: { message: 'Affectation supprimée avec succès' } });
        } catch (error) {
            next(error);
        }
    }
}

export const teachersController = new TeachersController();
