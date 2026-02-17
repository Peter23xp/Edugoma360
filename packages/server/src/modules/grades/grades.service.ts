import prisma from '../../lib/prisma';
import { calculateSubjectAverage, calculateGeneralAverage, calculateRanking, getDelibDecision, checkEliminatory } from '@edugoma360/shared';
import type { z } from 'zod';
import type { CreateGradeDto, BatchGradeDto, GradeQueryDto } from './grades.dto';

export class GradesService {
    /**
     * Create or update a single grade (upsert)
     */
    async createOrUpdateGrade(data: z.infer<typeof CreateGradeDto>, userId: string) {
        // Validate score against subject maxScore
        const subject = await prisma.subject.findUnique({
            where: { id: data.subjectId },
        });

        if (!subject) throw new Error('Matière non trouvée');
        if (data.score > subject.maxScore) {
            throw new Error(`La note ne peut pas dépasser ${subject.maxScore}`);
        }

        // Check if grade is locked
        const existingGrade = await prisma.grade.findUnique({
            where: {
                studentId_subjectId_termId_evalType: {
                    studentId: data.studentId,
                    subjectId: data.subjectId,
                    termId: data.termId,
                    evalType: data.evalType,
                },
            },
        });

        if (existingGrade?.isLocked) {
            throw new Error('Cette note est verrouillée et ne peut plus être modifiée');
        }

        return prisma.grade.upsert({
            where: {
                studentId_subjectId_termId_evalType: {
                    studentId: data.studentId,
                    subjectId: data.subjectId,
                    termId: data.termId,
                    evalType: data.evalType,
                },
            },
            update: {
                score: data.score,
                maxScore: data.maxScore,
                observation: data.observation,
                syncStatus: 'SYNCED',
            },
            create: {
                studentId: data.studentId,
                subjectId: data.subjectId,
                termId: data.termId,
                evalType: data.evalType,
                score: data.score,
                maxScore: data.maxScore,
                observation: data.observation,
                createdById: userId,
                syncStatus: 'SYNCED',
            },
        });
    }

    /**
     * Batch save grades (optimized transaction)
     */
    async batchSaveGrades(data: z.infer<typeof BatchGradeDto>, userId: string) {
        return prisma.$transaction(
            data.grades.map((grade) =>
                prisma.grade.upsert({
                    where: {
                        studentId_subjectId_termId_evalType: {
                            studentId: grade.studentId,
                            subjectId: grade.subjectId,
                            termId: grade.termId,
                            evalType: grade.evalType,
                        },
                    },
                    update: {
                        score: grade.score,
                        maxScore: grade.maxScore,
                        observation: grade.observation,
                        syncStatus: 'SYNCED',
                    },
                    create: {
                        studentId: grade.studentId,
                        subjectId: grade.subjectId,
                        termId: grade.termId,
                        evalType: grade.evalType,
                        score: grade.score,
                        maxScore: grade.maxScore,
                        observation: grade.observation,
                        createdById: userId,
                        syncStatus: 'SYNCED',
                    },
                }),
            ),
        );
    }

    /**
     * Get grades for a class/subject/term
     */
    async getGrades(query: z.infer<typeof GradeQueryDto>) {
        const where: any = {};
        if (query.subjectId) where.subjectId = query.subjectId;
        if (query.termId) where.termId = query.termId;
        if (query.evalType) where.evalType = query.evalType;
        if (query.studentId) where.studentId = query.studentId;

        if (query.classId) {
            where.student = {
                enrollments: {
                    some: {
                        classId: query.classId,
                        academicYear: { isActive: true },
                    },
                },
            };
        }

        return prisma.grade.findMany({
            where,
            include: {
                student: { select: { id: true, nom: true, postNom: true, prenom: true, matricule: true } },
                subject: { select: { id: true, name: true, abbreviation: true, maxScore: true } },
                term: { select: { id: true, label: true, number: true } },
            },
            orderBy: [{ student: { nom: 'asc' } }, { subject: { displayOrder: 'asc' } }],
        });
    }

    /**
     * Calculate averages for a class and term
     */
    async calculateAverages(classId: string, termId: string) {
        // Get all enrolled students
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
                academicYear: { isActive: true },
            },
            include: {
                student: true,
                class: { include: { section: true } },
            },
        });

        // Get all subjects for this class's section
        const subjectSections = await prisma.subjectSection.findMany({
            where: {
                sectionId: enrollments[0]?.class.sectionId,
            },
            include: {
                subject: true,
            },
        });

        // Get all grades for this class and term
        const grades = await prisma.grade.findMany({
            where: {
                termId,
                studentId: { in: enrollments.map((e) => e.studentId) },
            },
            include: { subject: true },
        });

        // Calculate per-student
        const studentResults = enrollments.map((enrollment) => {
            const studentGrades = grades.filter((g) => g.studentId === enrollment.studentId);

            const subjectAverages = subjectSections.map((ss) => {
                const subjectGrades = studentGrades
                    .filter((g) => g.subjectId === ss.subjectId)
                    .map((g) => ({
                        evalType: g.evalType as any,
                        score: g.score,
                        maxScore: g.maxScore,
                    }));

                const average = calculateSubjectAverage(subjectGrades);
                const isEliminated = checkEliminatory(
                    average,
                    ss.subject.elimThreshold,
                    ss.subject.isEliminatory,
                );

                return {
                    subjectId: ss.subjectId,
                    subjectName: ss.subject.name,
                    coefficient: ss.coefficient,
                    average,
                    maxScore: ss.subject.maxScore,
                    totalPoints: average * ss.coefficient,
                    isEliminatory: ss.subject.isEliminatory,
                    isEliminated,
                    scores: subjectGrades,
                };
            });

            const general = calculateGeneralAverage(subjectAverages);
            const hasEliminatoryFailure = subjectAverages.some((sa) => sa.isEliminated);

            return {
                studentId: enrollment.studentId,
                studentName: `${enrollment.student.nom} ${enrollment.student.postNom}`,
                generalAverage: general.average,
                totalPoints: general.totalPoints,
                totalCoefficients: general.totalCoefficients,
                hasEliminatoryFailure,
                subjectAverages,
                rank: 0,
            };
        });

        // Calculate ranking
        const ranked = calculateRanking(
            studentResults.map((s) => ({
                studentId: s.studentId,
                generalAverage: s.generalAverage,
                totalPoints: s.totalPoints,
            })),
        );

        // Merge rankings
        return studentResults.map((sr) => {
            const rankInfo = ranked.find((r) => r.studentId === sr.studentId);
            const decision = getDelibDecision(sr.generalAverage, sr.hasEliminatoryFailure);
            return {
                ...sr,
                rank: rankInfo?.rank ?? 0,
                suggestedDecision: decision,
            };
        }).sort((a, b) => a.rank - b.rank);
    }

    /**
     * Lock grades after deliberation
     */
    async lockGrades(classId: string, termId: string) {
        const enrollments = await prisma.enrollment.findMany({
            where: { classId, academicYear: { isActive: true } },
            select: { studentId: true },
        });

        await prisma.grade.updateMany({
            where: {
                termId,
                studentId: { in: enrollments.map((e) => e.studentId) },
            },
            data: { isLocked: true },
        });

        return { message: 'Notes verrouillées avec succès' };
    }

    /**
     * Handle sync of offline grades
     */
    async batchSyncOfflineGrades(
        grades: Array<z.infer<typeof CreateGradeDto> & { syncStatus: string }>,
        userId: string,
    ) {
        const results = [];
        for (const grade of grades) {
            try {
                const saved = await this.createOrUpdateGrade(grade, userId);
                results.push({ success: true, gradeId: saved.id });
            } catch (error) {
                results.push({
                    success: false,
                    studentId: grade.studentId,
                    error: error instanceof Error ? error.message : 'Erreur inconnue',
                });
            }
        }
        return results;
    }
}

export const gradesService = new GradesService();
