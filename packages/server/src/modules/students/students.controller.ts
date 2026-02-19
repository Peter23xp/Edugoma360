import { Request, Response, NextFunction } from 'express';
import { studentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto, BatchArchiveDto, ExportQueryDto } from './students.dto';
import prisma from '../../lib/prisma';

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
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    async getImportTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const buffer = await studentsService.getImportTemplate();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="modele-import-eleves.xlsx"');
            res.send(buffer);
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

    async getAcademicHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const history = await studentsService.getAcademicHistory(req.params.id, req.user!.schoolId);
            res.json({ history });
        } catch (error) {
            next(error);
        }
    }

    async generateAttestation(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await studentsService.generateAttestation(req.params.id, req.user!.schoolId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="attestation-${req.params.id}.pdf"`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    async generateStudentCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { format = 'pdf', side = 'both' } = req.query;
            const { id } = req.params;

            // Import the PDF service
            const { getOrGenerateCard } = await import('./students.pdf.service');

            // Generate the card
            const buffer = await getOrGenerateCard(
                id,
                format as 'pdf' | 'png',
                side as 'front' | 'back' | 'both'
            );

            // Get student matricule for filename
            const student = await prisma.student.findUnique({
                where: { id },
                select: { matricule: true },
            });

            const extension = format === 'pdf' ? 'pdf' : 'png';
            const filename = `Carte_${student?.matricule || id}.${extension}`;

            // Set response headers
            res.setHeader(
                'Content-Type',
                format === 'pdf' ? 'application/pdf' : 'image/png'
            );
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
    async getPaymentSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await studentsService.getPaymentSummary(req.params.id, req.user!.schoolId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const studentsController = new StudentsController();
