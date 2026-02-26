﻿import { Request, Response, NextFunction } from 'express';
import { teachersService } from './teachers.service';
import { createTeacherSchema, updateTeacherSchema } from './teachers.validation';

export class TeachersController {
    /**
     * List teachers with pagination and filters
     */
    async getTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            const { search, status, subjectId, section, page, limit } = req.query;

            const result = await teachersService.getTeachers(req.user!.schoolId, {
                search: search as string,
                status: status as string,
                subjectId: subjectId as string,
                section: section as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 25,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single teacher detail
     */
    async getTeacherById(req: Request, res: Response, next: NextFunction) {
        try {
            const teacher = await teachersService.getTeacherById(req.params.id, req.user!.schoolId);
            res.json({ data: teacher });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create teacher with validation
     */
    async createTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate with Zod
            const validatedData = createTeacherSchema.parse(req.body);
            const teacher = await teachersService.createTeacher(req.user!.schoolId, validatedData);
            res.status(201).json({
                teacher,
                message: "Enseignant ajouté avec succès ! Matricule : " + teacher.matricule
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update teacher
     */
    async updateTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            // Partial update
            const validatedData = updateTeacherSchema.parse(req.body);
            const teacher = await teachersService.updateTeacher(req.params.id, req.user!.schoolId, validatedData);
            res.json({
                teacher,
                message: "Enseignant modifié avec succès"
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Archive or delete teacher
     */
    async archiveTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            await teachersService.archiveTeacher(req.params.id, req.user!.schoolId);
            res.json({ message: "Enseignant archivé avec succès" });
        } catch (error) {
            next(error);
        }
    }
}

export const teachersController = new TeachersController();
