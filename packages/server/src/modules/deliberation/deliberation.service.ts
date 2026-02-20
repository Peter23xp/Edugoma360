import prisma from '../../lib/prisma';
import { suggestDelibDecision } from '@edugoma360/shared/src/utils/gradeCalc';
import { deliberationPdfService } from './deliberation.pdf.service';
import { deliberationBulletinService } from './deliberation.bulletin.service';

interface DecisionDto {
    studentId: string;
    decision: string;
    justification?: string;
}

export class DeliberationService {
    /**
     * Get deliberation data for a class and term
     */
    async getDeliberationData(classId: string, termId: string, schoolId: string) {
        // Verify class belongs to school
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            include: {
                section: true,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Get term
        const term = await prisma.term.findFirst({
            where: {
                id: termId,
            },
            include: {
                academicYear: true,
            },
        });

        if (!term) {
            throw new Error('TERM_NOT_FOUND');
        }

        // Get students with averages
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
            },
            include: {
                student: true,
            },
        });

        const studentIds = enrollments.map((e: any) => e.studentId);

        // Get subjects for this section
        const subjectSections = await prisma.subjectSection.findMany({
            where: {
                sectionId: classData.sectionId,
            },
            include: {
                subject: true,
            },
        });

        const subjects = subjectSections.map((ss: any) => ({
            id: ss.subject.id,
            coefficient: ss.coefficient,
            isEliminatory: ss.subject.isEliminatory,
            elimThreshold: ss.subject.elimThreshold,
        }));

        // Get all grades
        const grades = await prisma.grade.findMany({
            where: {
                studentId: { in: studentIds },
                termId,
            },
        });

        // Calculate averages for each student
        const { calculateStudentSubjectAverage, calculateGeneralAverage, calculateTotalPoints, checkEliminatory } =
            await import('@edugoma360/shared/src/utils/gradeCalc');

        const students = studentIds.map((studentId) => {
            const student = enrollments.find((e: any) => e.studentId === studentId)!.student;

            // Calculate subject averages
            const subjectAverages = subjects.map((subject) => {
                const studentGrades = grades.filter(
                    (g: any) => g.studentId === studentId && g.subjectId === subject.id
                );

                const average = calculateStudentSubjectAverage(
                    studentGrades.map((g: any) => ({
                        evalType: g.evalType,
                        score: g.score,
                        maxScore: g.maxScore,
                    }))
                );

                const hasFailed = checkEliminatory(
                    average,
                    subject.elimThreshold || 5,
                    subject.isEliminatory
                );

                return {
                    average,
                    coefficient: subject.coefficient,
                    hasFailed,
                };
            });

            // Calculate general average
            const generalAverage = calculateGeneralAverage(
                subjectAverages.map((sa) => ({
                    average: sa.average,
                    coefficient: sa.coefficient,
                }))
            );

            // Calculate total points
            const totalCoefficients = subjects.reduce((sum, s) => sum + s.coefficient, 0);
            const totalPoints = calculateTotalPoints(generalAverage, totalCoefficients);

            // Check for eliminatory failures
            const hasEliminatoryFailure = subjectAverages.some((sa) => sa.hasFailed);

            return {
                studentId,
                studentName: `${student.nom} ${student.postNom}`,
                generalAverage,
                totalPoints,
                hasEliminatoryFailure,
            };
        });

        // Sort by rank
        students.sort((a, b) => b.totalPoints - a.totalPoints);

        // Verification checks
        const totalGradesRequired = studentIds.length * subjects.length * 3; // 3 eval types
        const gradesEntered = grades.length;
        const allGradesLocked = grades.every((g: any) => g.isLocked);

        // Check if deliberation exists (means averages validated)
        const existingDelib = await prisma.deliberation.findFirst({
            where: {
                classId,
                termId,
            },
        });

        const verification = {
            allGradesEntered: gradesEntered >= totalGradesRequired * 0.9, // 90% threshold
            gradesEntered,
            totalGradesRequired,
            allGradesLocked,
            averagesValidated: !!existingDelib,
            eliminatoryCount: students.filter((s) => s.hasEliminatoryFailure).length,
        };

        // Get prefet info
        const prefet = await prisma.user.findFirst({
            where: {
                schoolId,
                role: 'PREFET',
                isActive: true,
            },
        });

        return {
            class: classData,
            term,
            academicYear: term.academicYear,
            students,
            verification,
            prefetName: prefet ? `${prefet.nom} ${prefet.prenom || ''}` : 'Préfet',
        };
    }

    /**
     * Validate deliberation and create results
     */
    async validateDeliberation(
        classId: string,
        termId: string,
        decisions: DecisionDto[],
        schoolId: string,
        userId: string
    ) {
        // Verify class belongs to school
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Check if deliberation already exists
        let deliberation = await prisma.deliberation.findFirst({
            where: {
                classId,
                termId,
            },
        });

        if (deliberation && deliberation.status === 'VALIDATED') {
            throw new Error('DELIBERATION_ALREADY_VALIDATED');
        }

        // Get student averages
        const deliberationData = await this.getDeliberationData(classId, termId, schoolId);
        const students = deliberationData.students;

        // Create or update deliberation
        if (!deliberation) {
            deliberation = await prisma.deliberation.create({
                data: {
                    classId,
                    termId,
                    status: 'DRAFT',
                },
            });
        }

        // Create deliberation results
        for (const decision of decisions) {
            const student = students.find((s: any) => s.studentId === decision.studentId);
            if (!student) continue;

            // Check if result already exists
            const existing = await prisma.delibResult.findFirst({
                where: {
                    deliberationId: deliberation.id,
                    studentId: decision.studentId,
                },
            });

            const resultData = {
                generalAverage: student.generalAverage,
                totalPoints: student.totalPoints,
                rank: students.findIndex((s: any) => s.studentId === decision.studentId) + 1,
                decision: decision.decision,
                justification: decision.justification,
            };

            if (existing) {
                await prisma.delibResult.update({
                    where: { id: existing.id },
                    data: resultData,
                });
            } else {
                await prisma.delibResult.create({
                    data: {
                        deliberationId: deliberation.id,
                        studentId: decision.studentId,
                        ...resultData,
                    },
                });
            }
        }

        // Get full deliberation data for PV generation
        const fullDeliberation = await (prisma.deliberation.findFirst as any)({
            where: { id: deliberation.id },
            include: {
                class: {
                    include: {
                        section: true,
                        school: true,
                    },
                },
                term: {
                    include: {
                        academicYear: true,
                    },
                },
                results: {
                    include: {
                        student: true,
                    },
                    orderBy: {
                        rank: 'asc',
                    },
                },
            },
        }) as any;

        if (!fullDeliberation) {
            throw new Error('DELIBERATION_NOT_FOUND');
        }

        // Get prefet info
        const prefet = await prisma.user.findFirst({
            where: {
                schoolId,
                role: 'PREFET',
                isActive: true,
            },
        });

        const prefetName = prefet ? `${prefet.nom} ${prefet.prenom || ''}` : 'Préfet';

        // Count modified decisions
        const modifiedCount = decisions.filter((d) => {
            const student = students.find((s: any) => s.studentId === d.studentId);
            if (!student) return false;
            const suggestion = suggestDelibDecision(
                student.generalAverage,
                student.hasEliminatoryFailure
            );
            return d.decision !== suggestion;
        }).length;

        // Generate PV PDF
        let pvUrl: string | null = null;
        try {
            const pvData = deliberationPdfService.preparePVData(
                fullDeliberation.class.school,
                fullDeliberation.class,
                fullDeliberation.term,
                fullDeliberation.results,
                prefetName,
                modifiedCount
            );
            pvUrl = await deliberationPdfService.generatePV(pvData);
        } catch (error) {
            console.error('Error generating PV:', error);
            // Continue even if PV generation fails
        }

        // Update deliberation with PV URL
        deliberation = await prisma.deliberation.update({
            where: { id: deliberation.id },
            data: {
                status: 'VALIDATED',
                validatedAt: new Date(),
                pvUrl,
            },
        });

        // Trigger bulletin batch generation
        const studentIds = (fullDeliberation.results as any[]).map((r: any) => r.studentId);
        let bulletinBatchJobId: string | null = null;
        try {
            bulletinBatchJobId = await deliberationBulletinService.createBulletinJob(
                deliberation.id,
                studentIds
            );
        } catch (error) {
            console.error('Error creating bulletin job:', error);
            // Continue even if job creation fails
        }

        // TODO: Send SMS to parents
        // This will be implemented when SMS service is ready
        // await this.sendParentNotifications(fullDeliberation.results);

        return {
            deliberationId: deliberation.id,
            pvUrl,
            bulletinBatchJobId,
        };
    }

    /**
     * Get deliberation results
     */
    async getDeliberationResults(deliberationId: string, schoolId: string) {
        const deliberation = await (prisma.deliberation.findFirst as any)({
            where: {
                id: deliberationId,
            },
            include: {
                class: {
                    include: { section: true, school: true },
                },
                term: {
                    include: {
                        academicYear: true,
                    },
                },
                results: {
                    include: {
                        student: true,
                    },
                    orderBy: {
                        rank: 'asc',
                    },
                },
            },
        }) as any;

        if (!deliberation || !deliberation.class) {
            throw new Error('DELIBERATION_NOT_FOUND');
        }

        return deliberation;
    }
}


export const deliberationService = new DeliberationService();
