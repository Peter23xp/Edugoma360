import prisma from '../../lib/prisma';

interface GetGradesFilters {
    classId?: string;
    subjectId?: string;
    termId?: string;
    evalType?: string;
    studentId?: string;
}

interface CreateGradeDto {
    studentId: string;
    subjectId: string;
    termId: string;
    evalType: string;
    score: number;
    observation?: string;
}

interface BatchGradeDto {
    studentId: string;
    score: number;
    observation?: string;
}

interface SyncQueueItem {
    id: string;
    type: 'grade_create' | 'grade_update';
    data: CreateGradeDto;
    timestamp: number;
}

export class GradesService {
    /**
     * Get grades with filters
     */
    async getGrades(filters: GetGradesFilters, schoolId: string) {
        const where: any = {};

        // Verify access through school
        if (filters.studentId) {
            where.student = {
                schoolId,
            };
        }

        if (filters.subjectId) {
            where.subjectId = filters.subjectId;
        }

        if (filters.termId) {
            where.termId = filters.termId;
        }

        if (filters.evalType) {
            where.evalType = filters.evalType;
        }

        // If classId provided, get students from that class
        if (filters.classId) {
            const enrollments = await prisma.enrollment.findMany({
                where: {
                    classId: filters.classId,
                },
                select: {
                    studentId: true,
                },
            });

            where.studentId = {
                in: enrollments.map((e: any) => e.studentId),
            };
        }

        const grades = await prisma.grade.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        matricule: true,
                        nom: true,
                        postNom: true,
                        prenom: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        abbreviation: true,
                        maxScore: true,
                    },
                },
                term: {
                    select: {
                        id: true,
                        label: true,
                    },
                },
            },
            orderBy: {
                student: {
                    nom: 'asc',
                },
            },
        });

        return { grades };
    }

    /**
     * Create or update grade
     */
    async upsertGrade(data: CreateGradeDto, schoolId: string, teacherId?: string) {
        // Verify student belongs to school
        const student = await prisma.student.findFirst({
            where: {
                id: data.studentId,
                schoolId,
            },
        });

        if (!student) {
            throw new Error('STUDENT_NOT_FOUND');
        }

        // Verify subject belongs to school
        const subject = await prisma.subject.findFirst({
            where: {
                id: data.subjectId,
                schoolId,
            },
        });

        if (!subject) {
            throw new Error('SUBJECT_NOT_FOUND');
        }

        // Verify term exists
        const term = await prisma.term.findFirst({
            where: {
                id: data.termId,
            },
        });

        if (!term) {
            throw new Error('TERM_NOT_FOUND');
        }

        // Validate score
        if (data.score < 0 || data.score > subject.maxScore) {
            throw new Error(`INVALID_SCORE: La note doit être entre 0 et ${subject.maxScore}`);
        }

        // Check if grade already exists
        const existing = await prisma.grade.findFirst({
            where: {
                studentId: data.studentId,
                subjectId: data.subjectId,
                termId: data.termId,
                evalType: data.evalType,
            },
        });

        let grade;

        if (existing) {
            // Check if locked
            if (existing.isLocked) {
                throw new Error('GRADE_LOCKED: Cette note est verrouillée');
            }

            // Update existing grade
            grade = await prisma.grade.update({
                where: { id: existing.id },
                data: {
                    score: data.score,
                    observation: data.observation,
                },
                include: {
                    student: true,
                    subject: true,
                    term: true,
                },
            });
        } else {
            // Create new grade - need createdById
            if (!teacherId) {
                throw new Error('TEACHER_ID_REQUIRED');
            }

            grade = await prisma.grade.create({
                data: {
                    studentId: data.studentId,
                    subjectId: data.subjectId,
                    termId: data.termId,
                    evalType: data.evalType,
                    score: data.score,
                    maxScore: subject.maxScore,
                    observation: data.observation,
                    isLocked: false,
                    createdById: teacherId,
                },
                include: {
                    student: true,
                    subject: true,
                    term: true,
                },
            });
        }

        return { grade };
    }

    /**
     * Batch create/update grades
     */
    async batchUpsertGrades(
        grades: BatchGradeDto[],
        subjectId: string,
        termId: string,
        evalType: string,
        schoolId: string,
        teacherId: string
    ) {
        const results = {
            saved: 0,
            errors: [] as Array<{ studentId: string; error: string }>,
        };

        for (const gradeData of grades) {
            try {
                await this.upsertGrade(
                    {
                        studentId: gradeData.studentId,
                        subjectId,
                        termId,
                        evalType,
                        score: gradeData.score,
                        observation: gradeData.observation,
                    },
                    schoolId,
                    teacherId
                );
                results.saved++;
            } catch (error: any) {
                results.errors.push({
                    studentId: gradeData.studentId,
                    error: error.message,
                });
            }
        }

        return results;
    }

    /**
     * Lock grades for a class/subject/term/evalType
     */
    async lockGrades(
        classId: string,
        subjectId: string,
        termId: string,
        evalType: string,
        schoolId: string
    ) {
        // Get all students in the class
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
            },
            select: {
                studentId: true,
            },
        });

        const studentIds = enrollments.map((e: any) => e.studentId);

        // Lock all grades
        const result = await prisma.grade.updateMany({
            where: {
                studentId: { in: studentIds },
                subjectId,
                termId,
                evalType,
                student: {
                    schoolId,
                },
            },
            data: {
                isLocked: true,
            },
        });

        return { locked: result.count };
    }

    /**
     * Unlock grades (Préfet only)
     */
    async unlockGrades(
        classId: string,
        subjectId: string,
        termId: string,
        evalType: string,
        schoolId: string
    ) {
        // Get all students in the class
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
            },
            select: {
                studentId: true,
            },
        });

        const studentIds = enrollments.map((e: any) => e.studentId);

        // Unlock all grades
        const result = await prisma.grade.updateMany({
            where: {
                studentId: { in: studentIds },
                subjectId,
                termId,
                evalType,
                student: {
                    schoolId,
                },
            },
            data: {
                isLocked: false,
            },
        });

        return { unlocked: result.count };
    }

    /**
     * Batch sync from offline queue
     */
    async batchSync(queue: SyncQueueItem[], schoolId: string, deviceId: string, teacherId: string) {
        const results = {
            processed: 0,
            conflicts: [] as Array<{ id: string; reason: string }>,
        };

        for (const item of queue) {
            try {
                await this.upsertGrade(item.data, schoolId, teacherId);
                results.processed++;
            } catch (error: any) {
                results.conflicts.push({
                    id: item.id,
                    reason: error.message,
                });
            }
        }

        return results;
    }
    /**
     * Get grades matrix for a class
     */
    async getClassMatrix(classId: string, termId: string, evalType: string, schoolId: string) {
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

        // Get all students in the class
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        matricule: true,
                        nom: true,
                        postNom: true,
                        prenom: true,
                    },
                },
            },
            orderBy: {
                student: {
                    nom: 'asc',
                },
            },
        });

        const students = enrollments.map((e: any) => e.student);

        // Get all subjects for the class section
        const subjectSections = await prisma.subjectSection.findMany({
            where: {
                sectionId: classData.sectionId,
            },
            include: {
                subject: true,
            },
            orderBy: {
                subject: {
                    displayOrder: 'asc',
                },
            },
        });

        const subjects = subjectSections.map((ss: any) => ss.subject);

        // Get all grades for this class/term/evalType
        const grades = await prisma.grade.findMany({
            where: {
                studentId: {
                    in: students.map((s: any) => s.id),
                },
                subjectId: {
                    in: subjects.map((s: any) => s.id),
                },
                termId,
                evalType,
            },
        });

        // Build grades matrix
        const gradesMatrix: Record<string, Record<string, number | null>> = {};
        students.forEach((student: any) => {
            gradesMatrix[student.id] = {};
            subjects.forEach((subject: any) => {
                const grade = grades.find(
                    (g: any) => g.studentId === student.id && g.subjectId === subject.id
                );
                gradesMatrix[student.id][subject.id] = grade ? grade.score : null;
            });
        });

        // Calculate averages and ranks
        const averages: Record<string, number | null> = {};
        const studentAverages: Array<{ studentId: string; average: number }> = [];

        students.forEach((student: any) => {
            const studentGrades = subjects
                .map((subject: any) => gradesMatrix[student.id][subject.id])
                .filter((g: any) => g !== null);

            if (studentGrades.length === subjects.length) {
                // All grades present
                const sum = studentGrades.reduce((acc: number, g: any) => acc + g, 0);
                const avg = sum / studentGrades.length;
                averages[student.id] = avg;
                studentAverages.push({ studentId: student.id, average: avg });
            } else {
                averages[student.id] = null;
            }
        });

        // Calculate ranks
        studentAverages.sort((a, b) => b.average - a.average);
        const ranks: Record<string, number | null> = {};
        studentAverages.forEach((sa, index) => {
            ranks[sa.studentId] = index + 1;
        });

        // Find missing grades
        const missing: Array<{
            subjectId: string;
            subjectName: string;
            teacherId: string | null;
            teacherName: string | null;
            count: number;
        }> = [];

        for (const subject of subjects) {
            const missingCount = students.filter(
                (student: any) => gradesMatrix[student.id][subject.id] === null
            ).length;

            if (missingCount > 0) {
                // Find teacher for this subject in this class
                const assignment = await prisma.teacherClassSubject.findFirst({
                    where: {
                        classId,
                        subjectId: subject.id,
                    },
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                            },
                        },
                    },
                });

                missing.push({
                    subjectId: subject.id,
                    subjectName: subject.name,
                    teacherId: assignment?.teacher.id || null,
                    teacherName: assignment
                        ? `${assignment.teacher.nom} ${assignment.teacher.prenom || ''}`
                        : null,
                    count: missingCount,
                });
            }
        }

        return {
            matrix: {
                students,
                subjects,
                grades: gradesMatrix,
                averages,
                ranks,
            },
            missing,
        };
    }

    /**
     * Calculate averages for a class and term
     */
    async calculateAverages(classId: string, termId: string, schoolId: string) {
        // Import calculation functions
        const {
            calculateStudentSubjectAverage,
            calculateGeneralAverage,
            calculateTotalPoints,
            calculateRanking,
            checkEliminatory,
        } = await import('@edugoma360/shared/src/utils/gradeCalc');

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

        // Get students in class
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
            name: ss.subject.name,
            abbreviation: ss.subject.abbreviation,
            coefficient: ss.coefficient,
            maxScore: ss.subject.maxScore,
            isEliminatory: ss.subject.isEliminatory,
            elimThreshold: ss.subject.elimThreshold,
        }));

        // Get all grades for this class and term
        const grades = await prisma.grade.findMany({
            where: {
                studentId: { in: studentIds },
                termId,
            },
            include: {
                subject: true,
            },
        });

        // Calculate averages for each student
        const studentAverages = studentIds.map((studentId) => {
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
                    subjectId: subject.id,
                    subjectName: subject.name,
                    average,
                    hasFailed,
                };
            });

            // Calculate general average
            const generalAverage = calculateGeneralAverage(
                subjectAverages.map((sa) => ({
                    average: sa.average,
                    coefficient: subjects.find((s) => s.id === sa.subjectId)!.coefficient,
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
                subjectAverages,
                generalAverage,
                totalPoints,
                rank: 0 as number, // Will be calculated after
                hasEliminatoryFailure,
            };
        }) as unknown as Array<{
            studentId: string;
            studentName: string;
            subjectAverages: any[];
            generalAverage: number;
            totalPoints: number;
            rank: number;
            hasEliminatoryFailure: boolean;
        }>;

        // Calculate rankings — cast input as any to handle shared-dist vs shared-src signature difference
        const rankings = calculateRanking(
            studentAverages.map((sa) => ({
                id: sa.studentId,
                totalPoints: sa.totalPoints,
            })) as any
        ) as Record<string, number>;

        // Assign ranks
        studentAverages.forEach((sa) => {
            sa.rank = (rankings as Record<string, number>)[sa.studentId] ?? 0;
        });

        // Sort by rank
        studentAverages.sort((a, b) => a.rank - b.rank);

        return {
            averages: studentAverages,
            subjects: subjects.map((s) => ({
                id: s.id,
                name: s.name,
                abbreviation: s.abbreviation,
            })),
            isValidated: false, // Check if deliberation exists
        };
    }

    /**
     * Get calculated averages
     */
    async getAverages(classId: string, termId: string, schoolId: string) {
        // Check if deliberation exists (means averages are validated)
        const deliberation = await prisma.deliberation.findFirst({
            where: {
                classId,
                termId,
            },
        });

        const isValidated = !!deliberation;

        // Calculate averages
        const result = await this.calculateAverages(classId, termId, schoolId);

        return {
            ...result,
            isValidated,
        };
    }

    /**
     * Validate averages and create deliberation
     */
    async validateAverages(classId: string, termId: string, schoolId: string, userId: string) {
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
        const existing = await prisma.deliberation.findFirst({
            where: {
                classId,
                termId,
            },
        });

        if (existing) {
            throw new Error('AVERAGES_ALREADY_VALIDATED');
        }

        // Create deliberation (validatedAt will be set when status changes to VALIDATED)
        const deliberation = await prisma.deliberation.create({
            data: {
                classId,
                termId,
                status: 'DRAFT',
            },
        });

        // Lock all grades for this class and term
        await prisma.grade.updateMany({
            where: {
                student: {
                    enrollments: {
                        some: {
                            classId,
                        },
                    },
                },
                termId,
            },
            data: {
                isLocked: true,
            },
        });

        return {
            deliberationId: deliberation.id,
        };
    }
}

export const gradesService = new GradesService();
