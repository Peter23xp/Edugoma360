import prisma from '../../lib/prisma';
import { ApiError } from '../../middleware/errorHandler.middleware';
import { eachMonthOfInterval, format } from 'date-fns';

export class BudgetsService {

  /** Get budget + real-time tracking for an academic year */
  async getBudget(schoolId: string, academicYearId: string) {
    const [budget, academicYear] = await Promise.all([
      prisma.budget.findUnique({
        where: { schoolId_academicYearId: { schoolId, academicYearId } },
        include: { categories: true, months: true, academicYear: true },
      }),
      prisma.academicYear.findUnique({ where: { id: academicYearId } }),
    ]);

    if (!academicYear) throw new ApiError('Année académique introuvable', 404);

    // ── Real revenue from fee payments ──────────────────────────────────
    const feePayments = await prisma.feePayment.findMany({
      where: {
        payment: { schoolId, academicYearId },
      },
      include: {
        fee: { select: { name: true } },
        payment: { select: { paymentDate: true, amountPaid: true } },
      },
    });

    const realizedByCategory: Record<string, number> = {};
    const realizedByMonth: Record<number, number> = {};
    let totalRealized = 0;

    for (const fp of feePayments) {
      // by category
      const catName = fp.fee.name;
      realizedByCategory[catName] = (realizedByCategory[catName] || 0) + fp.amountPaid;

      // by month
      const month = new Date(fp.payment.paymentDate).getMonth() + 1;
      realizedByMonth[month] = (realizedByMonth[month] || 0) + fp.amountPaid;

      totalRealized += fp.amountPaid;
    }

    if (!budget) {
      return {
        budget: null,
        tracking: {
          totalBudget: 0,
          totalRealized,
          realizationRate: 0,
          byCategory: [],
          byMonth: this.buildMonthGrid(academicYear.startDate, academicYear.endDate, {}, realizedByMonth),
          alerts: [],
        },
      };
    }

    const totalBudget = budget.categories.reduce((s: number, c: { amount: number }) => s + c.amount, 0);
    const realizationRate = totalBudget > 0 ? Math.round((totalRealized / totalBudget) * 100) : 0;

    // Monthly budget amounts
    const monthlyBudgetMap: Record<number, number> = {};
    if (budget.monthlyDistribution === 'CUSTOM') {
      for (const m of budget.months) monthlyBudgetMap[m.month] = m.amount;
    } else {
      const months = eachMonthOfInterval({ start: academicYear.startDate, end: academicYear.endDate });
      const perMonth = months.length > 0 ? Math.round(totalBudget / months.length) : 0;
      for (const m of months) monthlyBudgetMap[m.getMonth() + 1] = perMonth;
    }

    const byCategory = budget.categories.map((cat: { name: string; amount: number }) => {
      const realized = realizedByCategory[cat.name] || 0;
      const variance = realized - cat.amount;
      const rate = cat.amount > 0 ? Math.round((realized / cat.amount) * 100) : 0;
      return { category: cat.name, budgeted: cat.amount, realized, variance, rate };
    });

    const byMonth = this.buildMonthGrid(academicYear.startDate, academicYear.endDate, monthlyBudgetMap, realizedByMonth);

    // ── Alerts ──────────────────────────────────────────────────────────
    const alerts: string[] = [];
    for (const cat of byCategory) {
      if (cat.budgeted > 0 && cat.rate < 70) {
        alerts.push(`⚠️ ${cat.category} : seulement ${cat.rate}% réalisé (objectif 70%)`);
      }
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentMonthBudget = monthlyBudgetMap[currentMonth] || 0;
    const currentMonthRealized = realizedByMonth[currentMonth] || 0;
    if (currentMonthBudget > 0 && (currentMonthRealized / currentMonthBudget) < 0.7) {
      alerts.push(`⚠️ Ce mois-ci : seulement ${Math.round((currentMonthRealized / currentMonthBudget) * 100)}% des revenus prévus encaissés`);
    }

    return { budget, tracking: { totalBudget, totalRealized, realizationRate, byCategory, byMonth, alerts } };
  }

  private buildMonthGrid(
    start: Date,
    end: Date,
    budgetMap: Record<number, number>,
    realizedMap: Record<number, number>,
  ) {
    const months = eachMonthOfInterval({ start, end });
    return months.map(m => ({
      month: format(m, 'MMM yyyy'),
      monthNum: m.getMonth() + 1,
      budgeted: budgetMap[m.getMonth() + 1] || 0,
      realized: realizedMap[m.getMonth() + 1] || 0,
    }));
  }

  /** Create or replace budget */
  async upsertBudget(schoolId: string, data: {
    academicYearId: string;
    categories: { name: string; amount: number }[];
    monthlyDistribution: 'UNIFORM' | 'CUSTOM';
    months?: { month: number; amount: number }[];
  }) {
    const existing = await prisma.budget.findUnique({
      where: { schoolId_academicYearId: { schoolId, academicYearId: data.academicYearId } },
    });

    if (existing) {
      await prisma.budgetCategory.deleteMany({ where: { budgetId: existing.id } });
      await prisma.budgetMonth.deleteMany({ where: { budgetId: existing.id } });
      return prisma.budget.update({
        where: { id: existing.id },
        data: {
          monthlyDistribution: data.monthlyDistribution,
          categories: { create: data.categories },
          months: { create: data.months ?? [] },
        },
        include: { categories: true, months: true },
      });
    }

    return prisma.budget.create({
      data: {
        schoolId,
        academicYearId: data.academicYearId,
        monthlyDistribution: data.monthlyDistribution,
        categories: { create: data.categories },
        months: { create: data.months ?? [] },
      },
      include: { categories: true, months: true },
    });
  }
}

export const budgetsService = new BudgetsService();
