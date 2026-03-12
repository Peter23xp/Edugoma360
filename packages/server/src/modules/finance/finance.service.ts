import prisma from '../../lib/prisma';
import { generateReceiptNumber } from '@edugoma360/shared';
import type { z } from 'zod';
import type { CreatePaymentDto, FinanceQueryDto } from './finance.dto';

export class FinanceService {
    async createPayment(schoolId: string, userId: string, data: z.infer<typeof CreatePaymentDto>) {
        const feeType = await prisma.feeType.findUnique({ where: { id: data.feeTypeId } });
        if (!feeType) throw new Error('Type de frais non trouvé');

        const academicYear = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
        if (!academicYear) throw new Error('Aucune année académique active');

        const lastPayment = await prisma.payment.findFirst({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
            select: { receiptNumber: true },
        });

        const year = new Date().getFullYear();
        const lastSeq = lastPayment?.receiptNumber ? parseInt(lastPayment.receiptNumber.split('-').pop() ?? '0', 10) : 0;
        const receiptNumber = generateReceiptNumber('ITG001', year, lastSeq + 1);

        let amountPaidFC = data.amountPaid;
        if (data.currency === 'USD' && data.exchangeRate) {
            amountPaidFC = Math.round(data.amountPaid * data.exchangeRate);
        }

        return prisma.payment.create({
            data: {
                receiptNumber, studentId: data.studentId, schoolId,
                academicYearId: academicYear.id, totalDue: feeType.amount, amountPaid: amountPaidFC,
                remainingBalance: feeType.amount - amountPaidFC,
                currency: data.currency, exchangeRate: data.exchangeRate, paymentMethod: data.paymentMode,
                transactionRef: data.reference, paymentDate: data.paidAt ? new Date(data.paidAt) : new Date(),
                cashierId: userId,
                feePayments: {
                    create: [{
                        feeId: data.feeTypeId,
                        amountDue: feeType.amount,
                        amountPaid: amountPaidFC
                    }]
                }
            },
            include: {
                student: { select: { nom: true, postNom: true, prenom: true, matricule: true } },
                feePayments: { include: { fee: { select: { name: true, amount: true } } } },
            },
        });
    }

    async getPayments(schoolId: string, query: z.infer<typeof FinanceQueryDto>) {
        const { page, perPage, studentId, feeTypeId, from, to, paymentMode } = query;
        const skip = (page - 1) * perPage;
        const where: any = { schoolId };
        if (studentId) where.studentId = studentId;
        if (feeTypeId) where.feePayments = { some: { feeId: feeTypeId } };
        if (paymentMode) where.paymentMethod = paymentMode;
        if (from || to) {
            where.paymentDate = {};
            if (from) where.paymentDate.gte = new Date(from);
            if (to) where.paymentDate.lte = new Date(to);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where, skip, take: perPage,
                include: { student: { select: { nom: true, postNom: true, matricule: true } }, feePayments: { include: { fee: { select: { name: true } } } } },
                orderBy: { paymentDate: 'desc' },
            }),
            prisma.payment.count({ where }),
        ]);

        return { data: payments, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage), hasMore: skip + perPage < total } };
    }

    async getStudentBalance(studentId: string, schoolId: string) {
        const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
        const payments = await prisma.payment.findMany({ where: { studentId, schoolId, academicYear: { isActive: true } } });
        const totalDue = feeTypes.reduce((sum, ft) => sum + ft.amount, 0);
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return { studentId, totalDue, totalPaid, balance: totalDue - totalPaid, payments };
    }

    async getDebts(schoolId: string) {
        const students = await prisma.student.findMany({
            where: { schoolId, isActive: true },
            include: {
                payments: { where: { academicYear: { isActive: true } } },
                enrollments: { where: { academicYear: { isActive: true } }, include: { class: true }, take: 1 },
            },
        });

        const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
        const totalDue = feeTypes.reduce((sum, ft) => sum + ft.amount, 0);

        return students
            .map((s) => {
                const totalPaid = s.payments.reduce((sum, p) => sum + p.amountPaid, 0);
                const balance = totalDue - totalPaid;
                return {
                    studentId: s.id, nom: s.nom, postNom: s.postNom, matricule: s.matricule,
                    className: s.enrollments[0]?.class.name ?? 'N/A', totalDue, totalPaid, balance,
                };
            })
            .filter((s) => s.balance > 0)
            .sort((a, b) => b.balance - a.balance);
    }

    async getMonthlySummary(schoolId: string) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const academicYear = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
        if (!academicYear) return { expected: 0, collected: 0, currency: 'FC' };

        const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
        const activeStudents = await prisma.student.count({ where: { schoolId, isActive: true } });
        const expected = feeTypes.reduce((sum, ft) => sum + ft.amount, 0) * activeStudents;

        const payments = await prisma.payment.findMany({
            where: { schoolId, academicYearId: academicYear.id, paymentDate: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
        });

        const collected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return { expected, collected, currency: 'FC' };
    }

    async getRecoveryChart(schoolId: string) {
        const now = new Date();
        const months: any[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const label = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date);

            const payments = await prisma.payment.findMany({
                where: { schoolId, paymentDate: { gte: firstDay, lte: lastDay } },
            });

            const collected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

            const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
            const activeStudents = await prisma.student.count({ where: { schoolId, isActive: true } });
            const yearlyExpected = feeTypes.reduce((sum, ft) => sum + ft.amount, 0) * activeStudents;
            const expected = Math.round(yearlyExpected / 12);

            months.push({ label, expected, collected });
        }

        return { months };
    }

    async getStats(schoolId: string) {
        const academicYear = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
        if (!academicYear) return { totalRevenue: 0, totalExpected: 0, totalDebt: 0, monthlyPayments: 0, debtStudents: 0, currency: 'FC' };

        const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
        const activeStudents = await prisma.student.count({ where: { schoolId, isActive: true } });
        const totalExpected = feeTypes.reduce((sum, ft) => sum + ft.amount, 0) * activeStudents;

        const payments = await prisma.payment.findMany({
            where: { schoolId, academicYearId: academicYear.id },
        });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalDebt = totalExpected - totalRevenue;

        // Monthly payments count
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyPayments = await prisma.payment.count({
            where: { schoolId, createdAt: { gte: firstDayOfMonth } },
        });

        // Count students with outstanding debts
        const totalDuePerStudent = feeTypes.reduce((sum, ft) => sum + ft.amount, 0);
        const students = await prisma.student.findMany({
            where: { schoolId, isActive: true },
            include: { payments: { where: { academicYearId: academicYear.id } } },
        });
        const debtStudents = students.filter(s => {
            const paid = s.payments.reduce((sum, p) => sum + p.amountPaid, 0);
            return paid < totalDuePerStudent;
        }).length;

        return { totalRevenue, totalExpected, totalDebt, monthlyPayments, debtStudents, currency: 'FC' };
    }

    async getMonthlyRevenue(schoolId: string) {
        const now = new Date();
        const months: any[] = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(date);

            const payments = await prisma.payment.findMany({
                where: { schoolId, paymentDate: { gte: firstDay, lte: lastDay } },
            });

            const revenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
            months.push({ month: label, revenue });
        }

        return months;
    }
}

export const financeService = new FinanceService();

