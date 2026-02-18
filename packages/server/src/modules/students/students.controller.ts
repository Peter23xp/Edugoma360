import { Request, Response, NextFunction } from 'express';
import { studentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto, BatchArchiveDto, ExportQueryDto } from './students.dto';

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

    async batchArchive(req: Request, res: Response, next: NextFunction) {
        try {
            const data = BatchArchiveDto.parse(req.body);
            const result = await studentsService.batchArchive(req.user!.schoolId, data);
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async exportStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const query = ExportQueryDto.parse(req.query);
            const buffer = await studentsService.exportStudents(req.user!.schoolId, query);

            const today = new Date().toISOString().split('T')[0];
            const filename = `eleves-${today}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(Buffer.from(buffer as ArrayBuffer));
        } catch (error) {
            next(error);
        }
    }

    async getImportTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const buffer = await studentsService.getImportTemplate();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="modele-import-eleves.xlsx"');
            res.send(Buffer.from(buffer as ArrayBuffer));
        } catch (error) {
            next(error);
        }
    }

    async importStudents(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: { message: 'Aucun fichier fourni' } });
            }

            const result = await studentsService.importStudents(req.file.buffer, req.user!.schoolId);
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const studentsController = new StudentsController();
