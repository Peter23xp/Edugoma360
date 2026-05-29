import prisma from '../../lib/prisma';
import { suggestDelibDecision } from '@edugoma360/shared/utils/gradeCalc';
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

        // Get students with averages (filter by the term's academic year)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
                academicYearId: term.academicYearId,
            },
            include: {
                student: true,
            },
        });

        const studentIds = enrollments.map((e: any) => e.studentId);

        // Matières réellement enseignées dans cette classe (teacherAssignments)
        // Fallback sur toutes les matières de la section si aucune affectation
        const teacherAssignments = await prisma.teacherClassSubject.findMany({
            where: { classId },
            include: { subject: true },
        });

        let subjects: any[];

        if (teacherAssignments.length > 0) {
            // Dédoublonnage par subjectId
            const seen = new Set<string>();
            subjects = teacherAssignments
                .filter((a: any) => { if (seen.has(a.subjectId)) return false; seen.add(a.subjectId); return true; })
                .map((a: any) => ({
                    id: a.subject.id,
                    coefficient: 1, // teacherAssignments n'a pas de coefficient → utiliser 1 par défaut
                    isEliminatory: a.subject.isEliminatory,
                    elimThreshold: a.subject.elimThreshold,
                }));
        } else {
            // Fallback : matières de la section avec leurs coefficients
            const subjectSections = await prisma.subjectSection.findMany({
                where: { sectionId: classData.sectionId },
                include: { subject: true },
            });
            subjects = subjectSections.map((ss: any) => ({
                id: ss.subject.id,
                coefficient: ss.coefficient,
                isEliminatory: ss.subject.isEliminatory,
                elimThreshold: ss.subject.elimThreshold,
            }));
        }

        // Get all grades
        const grades = await prisma.grade.findMany({
            where: {
                studentId: { in: studentIds },
                termId,
            },
        });

        // Calculate averages for each student
        const { calculateStudentSubjectAverage, calculateGeneralAverage, calculateTotalPoints, checkEliminatory } =
            await import('@edugoma360/shared/utils/gradeCalc');

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
                    average ?? 0,
                    subject.elimThreshold || 5,
                    subject.isEliminatory
                );

                return {
                    average,
                    coefficient: subject.coefficient,
                    hasFailed,
                };
            });

            // Calculate total points first (Î£(moyenne_matière à coefficient))
            const totalPoints = calculateTotalPoints(
                subjectAverages.map((sa) => ({
                    average: sa.average,
                    coefficient: sa.coefficient,
                }))
            );

            // Calculate general average (totalPoints / Î£coefficients, arrondi 0.5)
            const totalCoefficients = subjects.reduce((sum, s) => sum + s.coefficient, 0);
            const generalAverage = calculateGeneralAverage(totalPoints, totalCoefficients);

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
        const gradesEntered = grades.length;
        const allGradesLocked = grades.length > 0 && grades.every((g: any) => g.isLocked);
        const lockedCount = grades.filter((g: any) => g.isLocked).length;

        // Notes requises : chaque élève doit avoir au moins 1 note d'examen par matière
        // En RDC (EPSP) le minimum pour calculer une moyenne = 1 EXAM (obligatoire)
        // On vérifie que chaque étudiant a au moins 1 note par matière
        const totalGradesRequired = studentIds.length * subjects.length;

        // Vérifier combien d'élèves ont au moins une note d'examen par matière
        let studentsWithExam = 0;
        for (const studentId of studentIds) {
            const hasAllExams = subjects.every((subject) => {
                return grades.some((g: any) =>
                    g.studentId === studentId &&
                    g.subjectId === subject.id &&
                    ['EXAM_TRIM', 'EXAM_TRIMESTRIEL', 'EXAMEN_TRIMESTRIEL', 'EXAM_SYNTH', 'EXAM_SYNTHESE', 'EXAMEN_SYNTHESE'].includes(g.evalType)
                );
            });
            if (hasAllExams) studentsWithExam++;
        }

        // Notes suffisantes si au moins 80% des élèves ont toutes leurs notes d'examen
        const allGradesEntered = studentIds.length > 0 && (studentsWithExam / studentIds.length) >= 0.8;

        // Vérifier si la délibération a déjà été faite
        const existingDelib = await prisma.deliberation.findFirst({
            where: { classId, termId },
        });

        const verification = {
            allGradesEntered,
            gradesEntered,
            totalGradesRequired,
            studentsWithExam,
            totalStudents: studentIds.length,
            allGradesLocked,
            lockedCount,
            totalGrades: grades.length,
            alreadyValidated: existingDelib?.status === 'VALIDATED',
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

        // ── SCR-024: Debt-based deliberation exclusion (>90 days) ───────
        const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
        const academicYear = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
        
        const excludedStudentIds = new Set<string>();
        
        if (academicYear) {
            for (const studentEntry of students) {
                const enrollment = await prisma.enrollment.findFirst({
                    where: { studentId: studentEntry.studentId, academicYearId: academicYear.id },
                });
                const payments = await prisma.payment.findMany({
                    where: { studentId: studentEntry.studentId, schoolId, academicYearId: academicYear.id },
                    select: { amountPaid: true, paymentDate: true },
                });
                
                const totalDue = feeTypes.reduce((sum, ft) => {
                    if (ft.scope === 'CLASS' && enrollment && !ft.classIds.includes(enrollment.classId)) return sum;
                    return sum + ft.amount;
                }, 0);
                const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
                const debt = totalDue - totalPaid;
                
                if (debt > 0) {
                    const lastPaymentDate = payments.length > 0
                        ? Math.max(...payments.map(p => p.paymentDate.getTime()))
                        : academicYear.startDate.getTime();
                    const daysPastDue = Math.floor((Date.now() - lastPaymentDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysPastDue > 90) {
                        excludedStudentIds.add(studentEntry.studentId);
                        console.log(`[DELIB] Élève ${studentEntry.studentName} exclu de la délibération — solde impayé de ${debt} FC (${daysPastDue} jours)`);
                    }
                }
            }
        }
        // ── End debt exclusion check ─────────────────────────────────────

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

        // Auto-lock all grades for this class/term
        await prisma.grade.updateMany({
            where: {
                studentId: { in: students.map(s => s.studentId) },
                termId,
            },
            data: { isLocked: true },
        });

        // Create deliberation results
        for (const decision of decisions) {
            const student = students.find((s: any) => s.studentId === decision.studentId);
            if (!student) continue;

            // SCR-024: Override decision for debt-excluded students
            const isExcludedForDebt = excludedStudentIds.has(decision.studentId);
            const finalDecision = isExcludedForDebt ? 'EXCLUDED_DEBT' : decision.decision;
            const finalJustification = isExcludedForDebt
                ? 'Exclusion délibération : créance non régularisée (> 90 jours)'
                : decision.justification;

            // Check if result already exists
            const existing = await prisma.delibResult.findFirst({
                where: {
                    deliberationId: deliberation.id,
                    studentId: decision.studentId,
                },
            });

            const resultData = {
                generalAverage: student.generalAverage ?? 0,
                totalPoints: student.totalPoints ?? 0,
                rank: students.findIndex((s: any) => s.studentId === decision.studentId) + 1,
                decision: finalDecision,
                justification: finalJustification,
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
                    orderBy: {
                        rank: 'asc',
                    },
                },
            },
        }) as any;

        // Fetch student details separately (DelibResult has no student relation in schema)
        if (fullDeliberation?.results) {
            const resultStudentIds = (fullDeliberation.results as any[]).map((r: any) => r.studentId);
            const resultStudents = await prisma.student.findMany({
                where: { id: { in: resultStudentIds } },
            });
            const studentMap = new Map(resultStudents.map((s: any) => [s.id, s]));
            fullDeliberation.results = (fullDeliberation.results as any[]).map((r: any) => ({
                ...r,
                student: studentMap.get(r.studentId) || { nom: 'Inconnu', postNom: '' },
            }));
        }

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

        // Generate PV PDF (skip if template not available)
        let pvUrl: string | null = null;
        try {
            console.log('[DELIB] Preparing PV data...');
            const pvData = deliberationPdfService.preparePVData(
                fullDeliberation.class.school,
                fullDeliberation.class,
                fullDeliberation.term,
                fullDeliberation.results,
                prefetName,
                modifiedCount
            );
            console.log('[DELIB] Generating PV PDF...');
            pvUrl = await deliberationPdfService.generatePV(pvData);
            console.log('[DELIB] PV generated:', pvUrl);
        } catch (error: any) {
            console.error('[DELIB] PV generation skipped:', error.message);
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
                    orderBy: {
                        rank: 'asc',
                    },
                },
            },
        }) as any;

        if (!deliberation || !deliberation.class) {
            throw new Error('DELIBERATION_NOT_FOUND');
        }

        // Fetch student details separately
        if (deliberation?.results) {
            const resultStudentIds = (deliberation.results as any[]).map((r: any) => r.studentId);
            const resultStudents = await prisma.student.findMany({
                where: { id: { in: resultStudentIds } },
            });
            const studentMap = new Map(resultStudents.map((s: any) => [s.id, s]));
            deliberation.results = (deliberation.results as any[]).map((r: any) => ({
                ...r,
                student: studentMap.get(r.studentId) || { nom: 'Inconnu', postNom: '' },
            }));
        }

        return deliberation;
    }

    /**
     * List all deliberations for a school with summary stats
     */
    async listDeliberations(schoolId: string, filters: { classId?: string; termId?: string; status?: string }) {
        const deliberations = await (prisma.deliberation.findMany as any)({
            where: {
                class: { schoolId },
                ...(filters.classId ? { classId: filters.classId } : {}),
                ...(filters.termId  ? { termId:  filters.termId  } : {}),
                ...(filters.status  ? { status:  filters.status  } : {}),
            },
            include: {
                class: { include: { section: true } },
                term:  { include: { academicYear: true } },
                results: true,
            },
            orderBy: { validatedAt: 'desc' },
        });

        return deliberations.map((d: any) => {
            const total    = d.results.length;
            const admitted = d.results.filter((r: any) => ['ADMITTED','DISTINCTION','GREAT_DISTINCTION'].includes(r.decision)).length;
            const failed   = d.results.filter((r: any) => r.decision === 'FAILED').length;
            const adjourned= d.results.filter((r: any) => r.decision === 'ADJOURNED').length;
            const avgGeneral = total > 0
                ? Math.round((d.results.reduce((s: number, r: any) => s + (r.generalAverage ?? 0), 0) / total) * 100) / 100
                : null;

            return {
                id:           d.id,
                status:       d.status,
                pvUrl:        d.pvUrl,
                validatedAt:  d.validatedAt,
                createdAt:    d.createdAt,
                class: {
                    id:   d.class.id,
                    name: d.class.name,
                    section: d.class.section?.name,
                },
                term: {
                    id:    d.term.id,
                    label: d.term.label,
                    academicYear: d.term.academicYear?.label,
                },
                stats: { total, admitted, failed, adjourned, avgGeneral,
                    successRate: total > 0 ? Math.round((admitted / total) * 100) : 0 },
            };
        });
    }
}

export const deliberationService = new DeliberationService();
