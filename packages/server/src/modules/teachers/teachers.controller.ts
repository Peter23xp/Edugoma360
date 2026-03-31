import { Request, Response, NextFunction } from 'express';
import { teachersService } from './teachers.service';
import { createTeacherSchema, updateTeacherSchema } from './teachers.validation';
import { getPublicUrl } from '../../lib/storage';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendSms } from '../../lib/sms';

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
     * Get global teachers statistics
     */
    async getGlobalStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await teachersService.getGlobalStats(req.user!.schoolId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    async getMyClasses(req: Request, res: Response, next: NextFunction) {
        res.json({ data: [] });
    }

    async getMySubjects(req: Request, res: Response, next: NextFunction) {
        res.json({ data: [] });
    }

    /**
     * Import teachers from Excel
     */
    async importTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'Le fichier Excel est requis' });
                return;
            }
            const result = await teachersService.importTeachers(req.user!.schoolId, req.file.path);
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
     * Get teacher academic stats
     */
    async getTeacherStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { termId } = req.query;
            const stats = await teachersService.getTeacherStats(req.params.id, termId as string);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign classes/subjects to a teacher
     */
    async assignClasses(req: Request, res: Response, next: NextFunction) {
        try {
            const { affectations } = req.body;

            if (!affectations || !Array.isArray(affectations)) {
                res.status(400).json({ message: 'affectations[] est requis' });
                return;
            }

            if (affectations.length > 10) {
                res.status(400).json({ message: 'Maximum 10 classes par enseignant' });
                return;
            }

            const teacher = await teachersService.getTeacherById(req.params.id, req.user!.schoolId);

            const activeYear = await prisma.academicYear.findFirst({
                where: { schoolId: req.user!.schoolId, isActive: true }
            });

            if (!activeYear) {
                res.status(400).json({ message: "Aucune année scolaire active" });
                return;
            }

            await prisma.$transaction(async (tx) => {
                await tx.teacherClassSubject.deleteMany({
                    where: { teacherId: teacher.id, academicYearId: activeYear.id }
                });

                await Promise.all(
                    affectations.map((aff: any) =>
                        tx.teacherClassSubject.create({
                            data: {
                                teacherId: teacher.id,
                                classId: aff.classeId,
                                subjectId: aff.matiereId,
                                volumeHoraire: aff.volumeHoraire,
                                academicYearId: activeYear.id
                            }
                        })
                    )
                );
            });

            res.json({ message: `${affectations.length} classes attribuées avec succès` });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset teacher password
     */
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const teacher = await teachersService.getTeacherById(req.params.id, req.user!.schoolId) as any;

            if (!teacher.userId) {
                res.status(400).json({ message: "Aucun compte utilisateur associé à cet enseignant" });
                return;
            }

            // Generate a new password
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
            const newPassword = Array.from({ length: 10 }, () =>
                chars.charAt(Math.floor(Math.random() * chars.length))
            ).join('');

            const passwordHash = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: teacher.userId },
                data: { passwordHash }
            });

            // Notify teacher by SMS
            if (teacher.telephone) {
                const msg = `EduGoma360 - Votre mot de passe a été réinitialisé. Nouveau mdp: ${newPassword}. Connectez-vous et changez-le.`;
                sendSms(teacher.telephone, msg).catch(console.error);
            }

            res.json({ message: "Mot de passe réinitialisé avec succès. Le nouveau mot de passe a été envoyé par SMS." });
        } catch (error) {
            next(error);
        }
    }

    async archiveTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            await teachersService.archiveTeacher(req.params.id, req.user!.schoolId);
            res.json({ message: 'Enseignant archivé avec succès' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download contract PDF
     */
    async getContractPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await teachersService.getContractPdf(req.params.id, req.user!.schoolId);
            res.contentType('application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=CONTRAT-${req.params.id}.pdf`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download timetable PDF
     */
    async getTimetablePdf(req: Request, res: Response, next: NextFunction) {
        try {
            const pdf = await teachersService.getTimetablePdf(req.params.id, req.user!.schoolId);
            res.contentType('application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=HORAIRE-${req.params.id}.pdf`);
            res.send(pdf);
        } catch (error) {
            next(error);
        }
    }

    private parseMultipartBody(body: any) {
        const parsed = { ...body };
        ['matieres', 'certificats', 'affectations'].forEach(field => {
            if (typeof parsed[field] === 'string') {
                try {
                    parsed[field] = JSON.parse(parsed[field]);
                } catch (e) { /* not JSON */ }
            }
        });
        return parsed;
    }

    /**
     * Create teacher with validation and file uploads
     */
    async createTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const body = this.parseMultipartBody(req.body);
            const validatedData = createTeacherSchema.parse(body);

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files?.photo?.[0]) {
                validatedData.photoUrl = getPublicUrl(files.photo[0].filename, 'photo');
            }

            if (files?.certificats && validatedData.certificats) {
                let fileIdx = 0;
                validatedData.certificats.forEach(cert => {
                    if (!cert.fichierUrl && files.certificats[fileIdx]) {
                        cert.fichierUrl = getPublicUrl(files.certificats[fileIdx].filename, 'certificate');
                        fileIdx++;
                    }
                });
            }

            const teacher = await teachersService.createTeacher(req.user!.schoolId, validatedData);
            res.status(201).json({
                teacher,
                message: `✓ Enseignant ajouté ! Matricule : ${teacher.matricule}`
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
            const body = this.parseMultipartBody(req.body);
            const validatedData = updateTeacherSchema.parse(body);

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files?.photo?.[0]) {
                validatedData.photoUrl = getPublicUrl(files.photo[0].filename, 'photo');
            }

            const teacher = await teachersService.updateTeacher(req.params.id, req.user!.schoolId, validatedData);
            res.json({ teacher, message: 'Enseignant modifié avec succès' });
        } catch (error) {
            next(error);
        }
    }

}

export const teachersController = new TeachersController();
