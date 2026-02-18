import prisma from '../../lib/prisma';
import { generateMatricule, getNextSequence } from '@edugoma360/shared';
import type { z } from 'zod';
import type { CreateStudentDto, UpdateStudentDto, StudentQueryDto, BatchArchiveDto, ExportQueryDto } from './students.dto';

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
            select: { name: true, ville: true, province: true },
        });

        if (!school) throw new Error('École non trouvée');

        // Get the last matricule sequence
        const lastStudent = await prisma.student.findFirst({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
            select: { matricule: true },
        });

        const nextSeq = getNextSequence(lastStudent?.matricule ?? null);
        const schoolCode = 'ITG001'; // TODO: make configurable
        const matricule = generateMatricule(schoolCode, nextSeq);

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
        const ExcelJS = (await import('exceljs')).default;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'EduGoma 360';
        const sheet = workbook.addWorksheet('Modèle Import');

        sheet.columns = [
            { header: 'matricule', key: 'matricule', width: 15 },
            { header: 'nom', key: 'nom', width: 18 },
            { header: 'postNom', key: 'postNom', width: 18 },
            { header: 'prenom', key: 'prenom', width: 18 },
            { header: 'sexe', key: 'sexe', width: 8 },
            { header: 'dateNaissance', key: 'dateNaissance', width: 15 },
            { header: 'lieuNaissance', key: 'lieuNaissance', width: 18 },
            { header: 'classe', key: 'classe', width: 12 },
            { header: 'statut', key: 'statut', width: 12 },
            { header: 'nomPere', key: 'nomPere', width: 18 },
            { header: 'telPere', key: 'telPere', width: 15 },
            { header: 'nomMere', key: 'nomMere', width: 18 },
            { header: 'telMere', key: 'telMere', width: 15 },
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

        // Add example row
        sheet.addRow({
            matricule: 'NK-0001',
            nom: 'AMISI',
            postNom: 'KALOMBO',
            prenom: 'Jean-Baptiste',
            sexe: 'M',
            dateNaissance: '2010-05-15',
            lieuNaissance: 'Goma',
            classe: '4ScA',
            statut: 'NOUVEAU',
            nomPere: 'AMISI Pierre',
            telPere: '+243991234567',
            nomMere: 'BAHATI Marie',
            telMere: '+243992345678',
        });

        return workbook.xlsx.writeBuffer();
    }

    /**
     * Import students from Excel buffer
     */
    async importStudents(buffer: Buffer, schoolId: string) {
        const ExcelJS = (await import('exceljs')).default;
        const { z } = await import('zod');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const sheet = workbook.worksheets[0];

        if (!sheet) {
            throw new Error('Fichier Excel invalide : aucune feuille trouvée');
        }

        const rowSchema = z.object({
            matricule: z.string().optional(),
            nom: z.string().min(2),
            postNom: z.string().min(2),
            prenom: z.string().optional(),
            sexe: z.enum(['M', 'F']),
            dateNaissance: z.string(),
            lieuNaissance: z.string().min(2),
            statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE']).default('NOUVEAU'),
        });

        const imported: string[] = [];
        const skipped: string[] = [];
        const errors: Array<{ line: number; message: string }> = [];

        // Get active academic year
        const activeYear = await prisma.academicYear.findFirst({
            where: { schoolId, isActive: true },
        });
        if (!activeYear) {
            throw new Error('Aucune année académique active');
        }

        // Process rows (skip header)
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const values = row.values as any[];
            // ExcelJS rows are 1-indexed, values[0] is empty
            const rowData = {
                matricule: String(values[1] ?? ''),
                nom: String(values[2] ?? ''),
                postNom: String(values[3] ?? ''),
                prenom: String(values[4] ?? ''),
                sexe: String(values[5] ?? ''),
                dateNaissance: String(values[6] ?? ''),
                lieuNaissance: String(values[7] ?? ''),
                statut: String(values[9] ?? 'NOUVEAU'),
            };

            const parsed = rowSchema.safeParse(rowData);
            if (!parsed.success) {
                errors.push({
                    line: rowNumber,
                    message: parsed.error.errors.map((e) => e.message).join(', '),
                });
            }
        });

        // Batch create valid students (simplified — in production, use upsert)
        let processedRows = 0;
        const rowsToProcess: any[] = [];

        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;

            const values = row.values as any[];
            const rowData = {
                nom: String(values[2] ?? ''),
                postNom: String(values[3] ?? ''),
                prenom: String(values[4] ?? '') || undefined,
                sexe: String(values[5] ?? 'M'),
                dateNaissance: String(values[6] ?? ''),
                lieuNaissance: String(values[7] ?? ''),
                statut: String(values[9] ?? 'NOUVEAU'),
                matricule: String(values[1] ?? ''),
            };
            rowsToProcess.push(rowData);
        });

        // We'll return the counts for now; actual insertion done in controller transaction 
        return {
            imported: rowsToProcess.length - errors.length,
            skipped: errors.length,
            errors,
            rows: rowsToProcess,
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

        // TODO: Generate PDF using Puppeteer or PDFKit
        // For now, return a placeholder
        const pdfContent = Buffer.from(`
            ATTESTATION D'INSCRIPTION SCOLAIRE
            
            École: ${school?.name}
            
            Je soussigné(e), Préfet de l'${school?.name}, certifie que
            ${student.nom} ${student.postNom} ${student.prenom || ''},
            matricule ${student.matricule}, est régulièrement inscrit(e)
            en ${student.enrollments[0]?.class.name || 'N/A'}
            pour l'année scolaire ${student.enrollments[0]?.academicYear.label || 'N/A'}.
            
            Fait à Goma, le ${new Date().toLocaleDateString('fr-FR')}
        `);

        return pdfContent;
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

        // TODO: Generate ID card PDF (85.6mm × 54mm)
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
}

export const studentsService = new StudentsService();
