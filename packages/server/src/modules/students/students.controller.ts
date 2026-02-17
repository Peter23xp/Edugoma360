import { Request, Response, NextFunction } from 'express';
import { studentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './students.dto';

export class StudentsController {
    async getStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const query = StudentQueryDto.parse(req.query);
            const result = await studentsService.getStudents(req.user!.schoolId, query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getStudentById(req: Request, res: Response, next: NextFunction) {
        try {
            const student = await studentsService.getStudentById(req.params.id, req.user!.schoolId);
            res.json({ data: student });
        } catch (error) {
            next(error);
        }
    }

    async createStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateStudentDto.parse(req.body);
            const student = await studentsService.createStudent(req.user!.schoolId, data);
            res.status(201).json({ data: student });
        } catch (error) {
            next(error);
        }
    }

    async updateStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const data = UpdateStudentDto.parse(req.body);
            const student = await studentsService.updateStudent(req.params.id, req.user!.schoolId, data);
            res.json({ data: student });
        } catch (error) {
            next(error);
        }
    }

    async archiveStudent(req: Request, res: Response, next: NextFunction) {
        try {
            await studentsService.archiveStudent(req.params.id, req.user!.schoolId);
            res.json({ data: { message: 'Élève archivé avec succès' } });
        } catch (error) {
            next(error);
        }
    }
}

export const studentsController = new StudentsController();
