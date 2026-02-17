import prisma from '../../lib/prisma';
import { generateMatricule, getNextSequence } from '@edugoma360/shared';
import type { z } from 'zod';
import type { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './students.dto';

export class StudentsService {
    /**
     * Get paginated students for a school
     */
    async getStudents(schoolId: string, query: z.infer<typeof StudentQueryDto>) {
        const { page, perPage, search, classId, statut, sexe, sortBy, sortOrder } = query;
        const skip = (page - 1) * perPage;

        const where: any = {
            schoolId,
            isActive: true,
        };

        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { postNom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { matricule: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (statut) where.statut = statut;
        if (sexe) where.sexe = sexe;

        if (classId) {
            where.enrollments = {
                some: {
                    classId,
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
                take: perPage,
            }),
            prisma.student.count({ where }),
        ]);

        return {
            data: students,
            meta: {
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage),
                hasMore: skip + perPage < total,
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
}

export const studentsService = new StudentsService();
