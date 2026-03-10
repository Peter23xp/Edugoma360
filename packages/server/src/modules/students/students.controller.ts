import { Request, Response, NextFunction } from 'express';
import { studentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto, BatchArchiveDto, ExportQueryDto } from './students.dto';
import prisma from '../../lib/prisma';
import { getPublicUrl } from '../../lib/storage';

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
            if (req.file) {
                data.photoUrl = getPublicUrl(req.file.filename, req.file.fieldname);
            }
            const student = await studentsService.createStudent(req.user!.schoolId, data);
            res.status(201).json({ data: student });
        } catch (error) {
            next(error);
        }
    }

    async updateStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const data = UpdateStudentDto.parse(req.body);
            if (req.file) {
                data.photoUrl = getPublicUrl(req.file.filename, req.file.fieldname);
            }
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
            const { id } = req.params;

            const student = await prisma.student.findFirst({
                where: { id, schoolId: req.user!.schoolId },
                include: {
                    school: true,
                    enrollments: {
                        include: { class: true, academicYear: true },
                        where: { academicYear: { isActive: true } },
                        take: 1,
                    },
                },
            });

            if (!student) {
                res.status(404).json({ error: { message: 'Élève introuvable' } });
                return;
            }

            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

            // ID Card size: 85.6mm × 54mm @ 72dpi → ~243 × 153 pt
            const cardW = 243;
            const cardH = 153;

            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([cardW, cardH]);

            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const enrollment = student.enrollments[0];
            const fullName = `${student.nom} ${student.postNom} ${student.prenom || ''}`.trim();
            const schoolName = student.school?.name || 'EduGoma 360';

            // Background
            page.drawRectangle({ x: 0, y: 0, width: cardW, height: cardH, color: rgb(0.04, 0.22, 0.47) });
            page.drawRectangle({ x: 0, y: 110, width: cardW, height: 43, color: rgb(0.02, 0.12, 0.30) });

            // School name header
            page.drawText(schoolName.toUpperCase(), {
                x: 8, y: 128, size: 7, font: fontBold, color: rgb(1, 1, 1),
                maxWidth: cardW - 16,
            });
            page.drawText('CARTE D\'ÉLÈVE', {
                x: 8, y: 115, size: 9, font: fontBold, color: rgb(0.9, 0.8, 0.1),
            });

            // Photo placeholder area
            page.drawRectangle({ x: 8, y: 35, width: 55, height: 70, color: rgb(1, 1, 1), opacity: 0.15 });
            page.drawText('PHOTO', { x: 20, y: 67, size: 8, font: fontReg, color: rgb(1, 1, 1) });

            // Student info
            const infoX = 70;
            let y = 97;
            const gap = 14;

            page.drawText(fullName.toUpperCase(), {
                x: infoX, y, size: 8, font: fontBold, color: rgb(1, 1, 1), maxWidth: 165,
            });
            y -= gap;

            const infoItems = [
                { label: 'Matricule', value: student.matricule },
                { label: 'Classe', value: enrollment?.class.name || 'N/A' },
                { label: 'Année', value: enrollment?.academicYear.label || 'N/A' },
                { label: 'Naissance', value: new Date(student.dateNaissance).toLocaleDateString('fr-FR') },
            ];
            for (const item of infoItems) {
                page.drawText(`${item.label}: `, { x: infoX, y, size: 6.5, font: fontBold, color: rgb(0.7, 0.85, 1) });
                page.drawText(item.value, { x: infoX + 40, y, size: 6.5, font: fontReg, color: rgb(1, 1, 1) });
                y -= gap;
            }

            // Bottom strip
            page.drawRectangle({ x: 0, y: 0, width: cardW, height: 22, color: rgb(0.9, 0.8, 0.1) });
            page.drawText('EduGoma 360 — Goma, RDC', {
                x: 8, y: 7, size: 6, font: fontReg, color: rgb(0.04, 0.22, 0.47),
            });

            const pdfBytes = await pdfDoc.save();
            const buffer = Buffer.from(pdfBytes);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Carte_${student.matricule}.pdf"`);
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
