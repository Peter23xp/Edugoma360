import { Request, Response, NextFunction } from 'express';
import { classesService } from './classes.service';

export class ClassesController {
    async getClasses(req: Request, res: Response, next: NextFunction) {
        try {
            const { sectionId, status, search } = req.query;

            const result = await classesService.getClasses({
                schoolId: req.user!.schoolId,
                sectionId: sectionId as string,
                status: status as 'active' | 'archived',
                search: search as string,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getClassById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await classesService.getClassById(id, req.user!.schoolId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async createClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { sectionId, name, maxStudents, room, titulaireId } = req.body;

            const result = await classesService.createClass({
                schoolId: req.user!.schoolId,
                sectionId,
                name,
                maxStudents,
                room,
                titulaireId,
            });

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { maxStudents, isActive, room, titulaireId } = req.body;

            const result = await classesService.updateClass(id, req.user!.schoolId, {
                maxStudents,
                isActive,
                room,
                titulaireId,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async archiveClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await classesService.archiveClass(id, req.user!.schoolId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async assignTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { assignments, titulaireId } = req.body;

            const result = await classesService.assignTeachers(
                id,
                req.user!.schoolId,
                assignments,
                titulaireId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getClassAssignments(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await classesService.getClassAssignments(id, req.user!.schoolId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async generateTimetable(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { preferences } = req.body;

            const result = await classesService.generateTimetable(id, req.user!.schoolId, preferences);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const classesController = new ClassesController();
