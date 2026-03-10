import prisma from '../../lib/prisma';
import { generateMatricule, getProvinceCode, getCityCode } from '@edugoma360/shared';
import type { z } from 'zod';
import type { CreateStudentDto, UpdateStudentDto, StudentQueryDto, BatchArchiveDto, ExportQueryDto } from './students.dto';
import { generateImportTemplate, importStudentsFromExcel } from './students.import.service';
import { sendSms, SMS_TEMPLATES } from '../../lib/sms';

export class StudentsService {
    /**
     * Get paginated students for a school with advanced filters
     */
    async getStudents(schoolId: string, query: z.infer<typeof StudentQueryDto>) {
        // Merge legacy + new param names
        const page = query.page ?? 1;
        const limit = query.limit ?? query.perPage ?? 25;
        const search = query.q ?? query.search;
        const status = query.status ?? query.statut;
        const section = query.section ?? query.sectionId;
        const { classId, sortBy = 'nom', sortOrder = 'asc' } = query;

        const skip = (page - 1) * limit;

        const where: any = {
            schoolId,
        };

        // By default, filter out archived unless explicitly requested
        if (status === 'ARCHIVE') {
            where.statut = 'ARCHIVE';
        } else if (status) {
            where.statut = status;
            where.isActive = true;
        } else {
            // Default: only active (non-archived)
            where.isActive = true;
        }

        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { postNom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { matricule: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (query.sexe) where.sexe = query.sexe;

        // Filter by class
        if (classId) {
            where.enrollments = {
                some: {
                    classId,
                    academicYear: { isActive: true },
                },
            };
        }

        // Filter by section
        if (section) {
            where.enrollments = {
                some: {
                    ...(where.enrollments?.some || {}),
                    class: {
                        section: { code: section },
                    },
                    academicYear: { isActive: true },
                },
            };
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                include: {
                    enrollments: {
                        where: { academicYear: { isActive: true } },
                        include: {
                            class: { include: { section: true } },
                            academicYear: true,
                        },
                        take: 1,
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.student.count({ where }),
        ]);

        // Map students for API response with class info
        const data = students.map((s) => {
            const currentEnrollment = s.enrollments[0];
            return {
                ...s,
                className: currentEnrollment?.class?.name ?? null,
                classId: currentEnrollment?.classId ?? null,
                sectionName: currentEnrollment?.class?.section?.name ?? null,
                sectionCode: currentEnrollment?.class?.section?.code ?? null,
            };
        });

        const pages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            pages,
            limit,
            // Legacy format support
            meta: {
                total,
                page,
                perPage: limit,
                totalPages: pages,
                hasMore: skip + limit < total,
            },
        };
    }

    /**
     * Get a single student by ID
     */
    async getStudentById(id: string, schoolId: string) {
        const student = await prisma.student.findFirst({
            where: { id, schoolId },
            include: {
                enrollments: {
                    include: {
                        class: { include: { section: true } },
                        academicYear: true,
                    },
                    orderBy: { enrolledAt: 'desc' },
                },
                payments: {
                    orderBy: { paidAt: 'desc' },
                    take: 10,
                },
                attendances: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
                disciplineRecords: {
                    orderBy: { date: 'desc' },
                },
            },
        });

        if (!student) {
            throw new Error('Élève non trouvé');
        }

        return student;
    }

    /**
     * Create a new student with auto-generated matricule
     */
    async createStudent(schoolId: string, data: z.infer<typeof CreateStudentDto>) {
        // Get the school code for matricule generation
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true, ville: true, province: true, code: true },
        });

        if (!school) throw new Error('École non trouvée');

        // Get the last matricule sequence
        const lastStudent = await prisma.student.findFirst({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
            select: { matricule: true },
        });

        const nextSeq = lastStudent ? parseInt(lastStudent.matricule.split('-').pop() || '0', 10) + 1 : 1;
        const schoolCode = school.code || 'ISG001';

        const provinceCode = getProvinceCode(school.province);
        const cityCode = getCityCode(school.ville);

        const matricule = generateMatricule(provinceCode, cityCode, schoolCode, nextSeq);

        const { classId, academicYearId, ecoleOrigine, resultatTenasosp, ...studentData } = data;

        return prisma.$transaction(async (tx) => {
            const student = await tx.student.create({
                data: {
                    ...studentData,
                    schoolId,
                    matricule,
                    dateNaissance: new Date(data.dateNaissance),
                },
            });

            // Create enrollment
            await tx.enrollment.create({
                data: {
                    studentId: student.id,
                    classId,
                    academicYearId,
                    ecoleOrigine,
                    resultatTenasosp,
                },
            });

            return student;
        }).then(async (student) => {
            // Send welcome SMS (non-blocking)
            const phone = student.telPere || student.telMere || student.telTuteur;
            if (phone) {
                const message = SMS_TEMPLATES.fr.welcome(`${student.prenom || ''} ${student.nom}`, student.matricule, school.name);
                sendSms(phone, message).catch(err => console.error('Failed to send welcome SMS:', err));
            }
            return student;
        });
    }

    /**
     * Update a student
     */
    async updateStudent(id: string, schoolId: string, data: z.infer<typeof UpdateStudentDto>) {
        const existing = await prisma.student.findFirst({
            where: { id, schoolId },
        });

        if (!existing) throw new Error('Élève non trouvé');

        return prisma.student.update({
            where: { id },
            data: {
                ...data,
                dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
            },
        });
    }

    /**
     * Archive a student (soft delete)
     */
    async archiveStudent(id: string, schoolId: string) {
        return prisma.student.update({
            where: { id },
            data: { statut: 'ARCHIVE', isActive: false },
        });
    }

    /**
     * Batch archive multiple students
     */
    async batchArchive(schoolId: string, data: z.infer<typeof BatchArchiveDto>) {
        const result = await prisma.student.updateMany({
            where: {
                id: { in: data.ids },
                schoolId,
            },
            data: {
                statut: 'ARCHIVE',
                isActive: false,
            },
        });

        return { archived: result.count };
    }

    /**
     * Export students to Excel
     */
    async exportStudents(schoolId: string, query: z.infer<typeof ExportQueryDto>) {
        const ExcelJS = (await import('exceljs')).default;

        // Build filters
        const where: any = { schoolId, isActive: true };

        if (query.ids) {
            const idList = query.ids.split(',').map((id) => id.trim());
            where.id = { in: idList };
        }
        if (query.status) where.statut = query.status;
        if (query.q) {
            where.OR = [
                { nom: { contains: query.q, mode: 'insensitive' } },
                { postNom: { contains: query.q, mode: 'insensitive' } },
                { prenom: { contains: query.q, mode: 'insensitive' } },
                { matricule: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        if (query.classId) {
            where.enrollments = {
                some: {
                    classId: query.classId,
                    academicYear: { isActive: true },
                },
            };
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                enrollments: {
                    where: { academicYear: { isActive: true } },
                    include: { class: { include: { section: true } } },
                    take: 1,
                },
            },
            orderBy: { nom: 'asc' },
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EduGoma 360';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Élèves');

        // Header row
        sheet.columns = [
            { header: 'Matricule', key: 'matricule', width: 15 },
            { header: 'Nom', key: 'nom', width: 18 },
            { header: 'Post-Nom', key: 'postNom', width: 18 },
            { header: 'Prénom', key: 'prenom', width: 18 },
            { header: 'Sexe', key: 'sexe', width: 8 },
            { header: 'Date Naissance', key: 'dateNaissance', width: 15 },
            { header: 'Lieu Naissance', key: 'lieuNaissance', width: 18 },
            { header: 'Classe', key: 'classe', width: 12 },
            { header: 'Section', key: 'section', width: 15 },
            { header: 'Statut', key: 'statut', width: 12 },
            { header: 'Nom Père', key: 'nomPere', width: 18 },
            { header: 'Tél. Père', key: 'telPere', width: 15 },
            { header: 'Nom Mère', key: 'nomMere', width: 18 },
            { header: 'Tél. Mère', key: 'telMere', width: 15 },
        ];

        // Style header
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, size: 11 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1B5E20' },
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Data rows
        for (const s of students) {
            const enrollment = s.enrollments[0];
            sheet.addRow({
                matricule: s.matricule,
                nom: s.nom,
                postNom: s.postNom,
                prenom: s.prenom ?? '',
                sexe: s.sexe,
                dateNaissance: new Date(s.dateNaissance).toLocaleDateString('fr-CD'),
                lieuNaissance: s.lieuNaissance,
                classe: enrollment?.class?.name ?? '',
                section: enrollment?.class?.section?.name ?? '',
                statut: s.statut,
                nomPere: s.nomPere ?? '',
                telPere: s.telPere ?? '',
                nomMere: s.nomMere ?? '',
                telMere: s.telMere ?? '',
            });
        }

        return workbook.xlsx.writeBuffer();
    }

    /**
     * Generate import template Excel file
     */
    async getImportTemplate() {
        return generateImportTemplate();
    }

    /**
     * Import students from Excel buffer
     */
    async importStudents(buffer: Buffer, schoolId: string) {
        const result = await importStudentsFromExcel(buffer, schoolId);
        return {
            success: result.imported,
            failed: result.errors.length,
            skipped: result.skipped,
            errors: result.errors,
            students: result.students
        };
    }

    async getAcademicHistory(studentId: string, schoolId: string) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId },
            include: {
                enrollments: {
                    include: {
                        class: true,
                        academicYear: true,
                    },
                    orderBy: {
                        enrolledAt: 'desc',
                    },
                },
            },
        });

        if (!student) {
            throw new Error('Élève introuvable');
        }

        // Build academic history from enrollments
        const history = student.enrollments.map((enrollment) => ({
            year: enrollment.academicYear.label,
            class: enrollment.class.name,
            decision: 'En cours', // TODO: Get from deliberation results
            average: null, // TODO: Calculate from grades
            isTenasosp: !!enrollment.resultatTenasosp,
        }));

        return history;
    }

    async generateAttestation(studentId: string, schoolId: string) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId },
            include: {
                enrollments: {
                    include: {
                        class: true,
                        academicYear: true,
                    },
                    where: { academicYear: { isActive: true } },
                },
            },
        });

        if (!student) throw new Error('Élève introuvable');

        const school = await prisma.school.findUnique({ where: { id: schoolId } });

        // Generate real PDF with pdf-lib
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const enrollment = student.enrollments[0];
        const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const fullName = `${student.nom} ${student.postNom} ${student.prenom || ''}`.trim();

        // ── Header ──────────────────────────────────────────────────────────
        page.drawText('RÉPUBLIQUE DÉMOCRATIQUE DU CONGO', {
            x: 50, y: 800, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.5),
        });
        page.drawText('Ministère de l\'Enseignement Primaire, Secondaire et Technique', {
            x: 50, y: 782, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3),
        });
        page.drawText(school?.name || 'École', {
            x: 50, y: 760, size: 14, font: fontBold, color: rgb(0.05, 0.3, 0.05),
        });

        // ── Separator ─────────────────────────────────────────────────────
        page.drawLine({ start: { x: 50, y: 748 }, end: { x: 545, y: 748 }, thickness: 2, color: rgb(0.1, 0.1, 0.5) });

        // ── Title ─────────────────────────────────────────────────────────
        page.drawText('ATTESTATION D\'INSCRIPTION SCOLAIRE', {
            x: 120, y: 710, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.5),
        });
        page.drawLine({ start: { x: 120, y: 702 }, end: { x: 475, y: 702 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });

        // ── Body ──────────────────────────────────────────────────────────
        const lineH = 24;
        let y = 650;

        const lines = [
            `Je soussigné(e), Préfet de l'établissement ${school?.name || ''},`,
            `certifie que l'élève :`,
        ];

        for (const line of lines) {
            page.drawText(line, { x: 70, y, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
            y -= lineH;
        }

        y -= 10;
        // Student info block
        const infoLines = [
            { label: 'Nom complet :', value: fullName.toUpperCase() },
            { label: 'Matricule :', value: student.matricule },
            { label: 'Date de naissance :', value: new Date(student.dateNaissance).toLocaleDateString('fr-FR') },
            { label: 'Classe :', value: enrollment?.class.name || 'N/A' },
            { label: 'Année scolaire :', value: enrollment?.academicYear.label || 'N/A' },
        ];

        for (const info of infoLines) {
            page.drawText(info.label, { x: 90, y, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
            page.drawText(info.value, { x: 230, y, size: 12, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
            y -= lineH;
        }

        y -= 10;
        page.drawText(`est régulièrement inscrit(e) dans notre établissement pour l'année scolaire`, {
            x: 70, y, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2),
        });
        y -= lineH;
        page.drawText(`${enrollment?.academicYear.label || 'en cours'}.`, {
            x: 70, y, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2),
        });

        y -= 40;
        page.drawText(`La présente attestation est délivrée à la demande de l'intéressé(e) pour`, {
            x: 70, y, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2),
        });
        y -= lineH;
        page.drawText(`servir et valoir ce que de droit.`, {
            x: 70, y, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2),
        });

        // ── Date & Signature ─────────────────────────────────────────────
        y -= 60;
        page.drawText(`Fait à Goma, le ${today}`, {
            x: 350, y, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2),
        });
        y -= lineH * 4;
        page.drawText('Le Préfet', {
            x: 400, y, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2),
        });

        // ── Footer ────────────────────────────────────────────────────────
        page.drawLine({ start: { x: 50, y: 60 }, end: { x: 545, y: 60 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
        page.drawText(`Document généré par EduGoma 360 — ${today}`, {
            x: 160, y: 45, size: 8, font: fontRegular, color: rgb(0.6, 0.6, 0.6),
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }


    async generateStudentCard(studentId: string, schoolId: string) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId },
            include: {
                enrollments: {
                    include: {
                        class: true,
                        academicYear: true,
                    },
                    where: {
                        academicYear: {
                            isActive: true,
                        },
                    },
                },
            },
        });

        if (!student) {
            throw new Error('Élève introuvable');
        }

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
        });

        // TODO: Generate ID card PDF (85.6mm à 54mm)
        // For now, return a placeholder
        const pdfContent = Buffer.from(`
            CARTE D'ÉLÈVE
            
            ${school?.name}
            
            Nom: ${student.nom} ${student.postNom} ${student.prenom || ''}
            Matricule: ${student.matricule}
            Classe: ${student.enrollments[0]?.class.name || 'N/A'}
            Année: ${student.enrollments[0]?.academicYear.label || 'N/A'}
        `);

        return pdfContent;
    }

    async getPaymentSummary(studentId: string, schoolId: string) {
        const payments = await prisma.payment.findMany({
            where: { studentId, schoolId }
        });

        const expected = payments.reduce((sum, p) => sum + p.amountDue, 0);
        const paid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

        return {
            expected,
            paid,
            remaining: expected - paid
        };
    }
}

export const studentsService = new StudentsService();
