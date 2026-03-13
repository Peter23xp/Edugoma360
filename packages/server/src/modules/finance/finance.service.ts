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

        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
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

            if (data.paymentMode === 'ESPECES') {
                const session = await tx.cashSession.findFirst({
                    where: { schoolId, cashierId: userId, status: 'OPEN' }
                });

                if (session) {
                    const newTheoretical = session.theoreticalBalance + amountPaidFC;
                    const newTotalReceived = session.totalReceived + amountPaidFC;

                    await tx.cashSession.update({
                        where: { id: session.id },
                        data: {
                            theoreticalBalance: newTheoretical,
                            totalReceived: newTotalReceived
                        }
                    });

                    await tx.cashMovement.create({
                        data: {
                            sessionId: session.id,
                            type: 'IN',
                            category: 'PAYMENT',
                            amount: amountPaidFC,
                            balance: newTheoretical,
                            reference: receiptNumber,
                            description: `Paiement ${feeType.name} - ${payment.student.nom} ${payment.student.postNom}`
                        }
                    });
                }
            }
            
            return payment;
        });

        return result;
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

    async getFinanceDashboard(schoolId: string, startDate: Date, endDate: Date) {
        const academicYear = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
        if (!academicYear) throw new Error('Aucune année académique active');

        const where: any = { 
            schoolId, 
            paymentDate: { gte: startDate, lte: endDate } 
        };

        const [payments, feeTypes, studentsCount] = await Promise.all([
            prisma.payment.findMany({ 
                where, 
                include: { feePayments: { include: { fee: true } }, student: { include: { enrollments: { include: { class: true } } } } } 
            }),
            prisma.feeType.findMany({ where: { schoolId, isActive: true } }),
            prisma.student.count({ where: { schoolId, isActive: true } }),
        ]);

        const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalPayments = payments.length;
        
        // Calculate recovery rate
        const totalExpected = feeTypes.reduce((sum, ft) => sum + ft.amount, 0) * studentsCount;
        const totalDebts = totalExpected - totalRevenue;
        const recoveryRate = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;

        // Revenue Evolution (by month)
        const evolutionMap = new Map<string, number>();
        payments.forEach(p => {
            const key = p.paymentDate.toISOString().substring(0, 7); // YYYY-MM
            evolutionMap.set(key, (evolutionMap.get(key) || 0) + p.amountPaid);
        });
        const revenueEvolution = Array.from(evolutionMap.entries())
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Revenue by Fee Type
        const feeTypeMap = new Map<string, number>();
        payments.forEach(p => {
            p.feePayments.forEach(fp => {
                const name = fp.fee.name;
                feeTypeMap.set(name, (feeTypeMap.get(name) || 0) + fp.amountPaid);
            });
        });
        const revenueByFeeType = Array.from(feeTypeMap.entries()).map(([type, amount]) => ({ type, amount }));

        // Revenue by Class
        const classMap = new Map<string, number>();
        payments.forEach(p => {
            const className = p.student?.enrollments?.[0]?.class?.name || 'Inconnu';
            classMap.set(className, (classMap.get(className) || 0) + p.amountPaid);
        });
        const revenueByClass = Array.from(classMap.entries())
            .map(([className, amount]) => ({ className, amount }))
            .sort((a, b) => b.amount - a.amount);

        // Payment Methods
        const methodMap = new Map<string, { count: number, amount: number }>();
        payments.forEach(p => {
            const method = p.paymentMethod || 'CASH';
            const current = methodMap.get(method) || { count: 0, amount: 0 };
            methodMap.set(method, { count: current.count + 1, amount: current.amount + p.amountPaid });
        });
        const paymentMethods = Array.from(methodMap.entries()).map(([method, data]) => ({ method, ...data }));

        return {
            kpis: {
                totalRevenue,
                totalDebts,
                recoveryRate: Math.round(recoveryRate),
                avgRevenuePerStudent: studentsCount > 0 ? Math.round(totalRevenue / studentsCount) : 0,
                paymentsCount: totalPayments,
                avgPaymentAmount: totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0
            },
            revenueEvolution,
            revenueByFeeType,
            revenueByClass,
            paymentMethods
        };
    }

    async getStats(schoolId: string) {
        // Redirection to getFinanceDashboard or use current implementation simplified
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return this.getFinanceDashboard(schoolId, startOfYear, now);
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

