import prisma from '../../lib/prisma';

class ParentService {
    /**
     * Get all children linked to a parent user, with summary info
     */
    async getChildren(parentUserId: string) {
        const students = await prisma.student.findMany({
            where: { parentUserId, isActive: true },
            include: {
                enrollments: {
                    include: {
                        class: true,
                        academicYear: true,
                    },
                    orderBy: { enrolledAt: 'desc' },
                    take: 1,
                },
                grades: {
                    include: { term: { include: { academicYear: true } } },
                },
                attendances: true,
                payments: true,
            },
        });

        return students.map((student) => {
            const currentEnrollment = student.enrollments[0];

            // Calculate general average from grades in active academic year
            const activeGrades = student.grades.filter(
                (g) => g.term.academicYear.isActive
            );
            let average: number | null = null;
            if (activeGrades.length > 0) {
                const totalWeighted = activeGrades.reduce(
                    (sum, g) => sum + (g.score / g.maxScore) * 20,
                    0
                );
                average = Math.round((totalWeighted / activeGrades.length) * 100) / 100;
            }

            // Attendance rate for active year
            const activeAttendances = student.attendances.filter((a) => {
                const enrollment = student.enrollments.find(
                    (e) => e.academicYearId === currentEnrollment?.academicYearId
                );
                return enrollment != null;
            });
            let attendanceRate: number | null = null;
            if (activeAttendances.length > 0) {
                const present = activeAttendances.filter(
                    (a) => a.status === 'PRESENT' || a.status === 'LATE'
                ).length;
                attendanceRate =
                    Math.round((present / activeAttendances.length) * 10000) / 100;
            }

            // Financial balance: total fees paid vs due
            const totalPaid = student.payments.reduce((s, p) => s + p.amountPaid, 0);
            const totalDue = student.payments.reduce((s, p) => s + p.totalDue, 0);
            const balance = totalDue - totalPaid;

            return {
                id: student.id,
                matricule: student.matricule,
                nom: student.nom,
                postNom: student.postNom,
                prenom: student.prenom,
                photoUrl: student.photoUrl,
                className: currentEnrollment?.class?.name ?? null,
                sectionId: currentEnrollment?.class?.sectionId ?? null,
                academicYear: currentEnrollment?.academicYear?.label ?? null,
                average,
                attendanceRate,
                balance,
            };
        });
    }

    /**
     * Verify that a student belongs to the given parent user.
     * Throws an error if ownership cannot be confirmed.
     */
    async verifyParentOwnership(parentUserId: string, studentId: string) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, parentUserId, isActive: true },
        });

        if (!student) {
            const error: any = new Error(
                'Accès refusé. Cet élève ne fait pas partie de vos enfants.'
            );
            error.statusCode = 403;
            throw error;
        }

        return student;
    }

    /**
     * Get grades for a student, grouped by subject, with averages and deliberation result
     */
    async getGrades(parentUserId: string, studentId: string, termId?: string) {
        await this.verifyParentOwnership(parentUserId, studentId);

        // Resolve termId: default to active term
        let resolvedTermId = termId;
        if (!resolvedTermId) {
            const activeTerm = await prisma.term.findFirst({
                where: {
                    isActive: true,
                    academicYear: { isActive: true },
                },
            });
            if (activeTerm) {
                resolvedTermId = activeTerm.id;
            }
        }

        if (!resolvedTermId) {
            return { grades: [], term: null, delibResult: null };
        }

        // Get term info
        const term = await prisma.term.findUnique({
            where: { id: resolvedTermId },
            select: { id: true, label: true, number: true },
        });

        // Get grades grouped by subject
        const grades = await prisma.grade.findMany({
            where: { studentId, termId: resolvedTermId },
            include: {
                subject: {
                    select: { id: true, name: true, abbreviation: true, maxScore: true },
                },
            },
            orderBy: [{ subject: { name: 'asc' } }, { evalType: 'asc' }],
        });

        // Group grades by subject
        const subjectMap = new Map<
            string,
            {
                subject: { id: string; name: string; abbreviation: string; maxScore: number };
                evaluations: { evalType: string; score: number; maxScore: number; observation: string | null }[];
                average: number | null;
            }
        >();

        for (const grade of grades) {
            const key = grade.subjectId;
            if (!subjectMap.has(key)) {
                subjectMap.set(key, {
                    subject: grade.subject,
                    evaluations: [],
                    average: null,
                });
            }
            subjectMap.get(key)!.evaluations.push({
                evalType: grade.evalType,
                score: grade.score,
                maxScore: grade.maxScore,
                observation: grade.observation,
            });
        }

        // Calculate per-subject average
        for (const entry of subjectMap.values()) {
            if (entry.evaluations.length > 0) {
                const total = entry.evaluations.reduce(
                    (sum, e) => sum + (e.score / e.maxScore) * entry.subject.maxScore,
                    0
                );
                entry.average =
                    Math.round((total / entry.evaluations.length) * 100) / 100;
            }
        }

        // Get deliberation result (rank + decision)
        const delibResult = await prisma.delibResult.findFirst({
            where: {
                studentId,
                deliberation: { termId: resolvedTermId },
            },
            select: {
                generalAverage: true,
                totalPoints: true,
                rank: true,
                decision: true,
            },
        });

        return {
            term,
            grades: Array.from(subjectMap.values()),
            delibResult,
        };
    }

    /**
     * Get attendance stats and absence list for a student
     */
    async getAttendance(parentUserId: string, studentId: string, termId?: string) {
        await this.verifyParentOwnership(parentUserId, studentId);

        // Resolve termId
        let resolvedTermId = termId;
        if (!resolvedTermId) {
            const activeTerm = await prisma.term.findFirst({
                where: {
                    isActive: true,
                    academicYear: { isActive: true },
                },
            });
            if (activeTerm) {
                resolvedTermId = activeTerm.id;
            }
        }

        if (!resolvedTermId) {
            return { term: null, stats: null, absences: [] };
        }

        // Get term info
        const term = await prisma.term.findUnique({
            where: { id: resolvedTermId },
            select: { id: true, label: true, number: true },
        });

        // Get all attendance records for this student/term
        const records = await prisma.attendance.findMany({
            where: { studentId, termId: resolvedTermId },
            include: {
                justifications: {
                    select: {
                        id: true,
                        reason: true,
                        status: true,
                        reviewedAt: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        // Calculate stats
        const total = records.length;
        const present = records.filter((r) => r.status === 'PRESENT').length;
        const absent = records.filter((r) => r.status === 'ABSENT').length;
        const late = records.filter((r) => r.status === 'LATE').length;
        const attendanceRate =
            total > 0 ? Math.round((present / total) * 10000) / 100 : null;

        const stats = {
            total,
            present,
            absent,
            late,
            attendanceRate,
        };

        // Build absence list (only ABSENT and LATE records)
        const absences = records
            .filter((r) => r.status === 'ABSENT' || r.status === 'LATE')
            .map((r) => ({
                id: r.id,
                date: r.date.toISOString().split('T')[0],
                period: r.period,
                status: r.status,
                justification: r.justifications[0]
                    ? {
                          id: r.justifications[0].id,
                          reason: r.justifications[0].reason,
                          status: r.justifications[0].status,
                      }
                    : null,
            }));

        return { term, stats, absences };
    }

    /**
     * Get payment history and unpaid fees for a student
     */
    async getPayments(parentUserId: string, studentId: string) {
        await this.verifyParentOwnership(parentUserId, studentId);

        // Get student school info
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                schoolId: true,
                enrollments: {
                    include: { academicYear: true },
                    orderBy: { enrolledAt: 'desc' },
                    take: 1,
                },
            },
        });

        const activeAcademicYearId = student?.enrollments[0]?.academicYearId;

        // Get all payments for this student
        const payments = await prisma.payment.findMany({
            where: { studentId },
            include: {
                feePayments: {
                    include: {
                        fee: { select: { id: true, name: true, amount: true } },
                    },
                },
            },
            orderBy: { paymentDate: 'desc' },
        });

        // Get active fee types for the school/year to determine unpaid
        const feeTypes = student && activeAcademicYearId
            ? await prisma.feeType.findMany({
                  where: {
                      schoolId: student.schoolId,
                      academicYearId: activeAcademicYearId,
                      isActive: true,
                  },
                  select: { id: true, name: true, amount: true, type: true },
              })
            : [];

        // Calculate paid amounts per fee type
        const paidPerFee = new Map<string, number>();
        for (const payment of payments) {
            for (const fp of payment.feePayments) {
                const current = paidPerFee.get(fp.feeId) ?? 0;
                paidPerFee.set(fp.feeId, current + fp.amountPaid);
            }
        }

        // Determine unpaid fees
        const unpaidFees = feeTypes
            .map((fee) => {
                const paid = paidPerFee.get(fee.id) ?? 0;
                const remaining = fee.amount - paid;
                return {
                    feeId: fee.id,
                    name: fee.name,
                    type: fee.type,
                    totalAmount: fee.amount,
                    amountPaid: paid,
                    remaining,
                };
            })
            .filter((f) => f.remaining > 0);

        // Format payment history
        const paymentHistory = payments.map((p) => ({
            id: p.id,
            receiptNumber: p.receiptNumber,
            paymentDate: p.paymentDate.toISOString().split('T')[0],
            amountPaid: p.amountPaid,
            totalDue: p.totalDue,
            paymentMethod: p.paymentMethod,
            currency: p.currency,
            fees: p.feePayments.map((fp) => ({
                name: fp.fee.name,
                amountDue: fp.amountDue,
                amountPaid: fp.amountPaid,
            })),
        }));

        // Summary
        const totalDue = feeTypes.reduce((s, f) => s + f.amount, 0);
        const totalPaid = Array.from(paidPerFee.values()).reduce((s, v) => s + v, 0);

        return {
            summary: {
                totalDue,
                totalPaid,
                balance: totalDue - totalPaid,
                currency: payments[0]?.currency ?? 'FC',
            },
            payments: paymentHistory,
            unpaidFees,
        };
    }
}

export const parentService = new ParentService();
