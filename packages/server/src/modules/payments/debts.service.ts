
import prisma from '../../lib/prisma';
import { smsService } from '../sms/sms.service';
import { subDays, startOfDay, endOfDay, addMonths } from 'date-fns';

export class DebtsService {
  async getDebts(schoolId: string, query: { classId?: string; level?: string; minAmount?: number; page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true }
    });
    if (!academicYear) throw new Error('Aucune année académique active');

    // 1. Get FeeTypes
    const feeTypes = await prisma.feeType.findMany({
      where: { schoolId, isActive: true },
    });

    const searchFilter = query.search ? {
      OR: [
        { nom: { contains: query.search, mode: 'insensitive' as any } },
        { postNom: { contains: query.search, mode: 'insensitive' as any } },
        { prenom: { contains: query.search, mode: 'insensitive' as any } },
        { matricule: { contains: query.search, mode: 'insensitive' as any } },
      ]
    } : {};

    // 2. Get students with their payments and enrollments
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        ...searchFilter,
        ...(query.classId ? { enrollments: { some: { classId: query.classId, academicYearId: academicYear.id } } } : {})
      },
      include: {
        payments: {
          where: { academicYearId: academicYear.id },
          include: { feePayments: true }
        },
        enrollments: {
          where: { academicYearId: academicYear.id },
          include: { class: { select: { name: true } } },
          take: 1
        }
      }
    });

    const now = new Date();
    
    // Logic for "Due Fees"
    const debts = students.map(student => {
      let totalDue = 0;
      let oldestUnpaidDate: Date | null = null;
      
      // For each fee type, check if it's due
      // Simple logic: if MONTHLY and month is before or same as current, it's due.
      // If ANNUAL, it's due.
      const studentClassId = student.enrollments[0]?.classId;
      
      feeTypes.forEach(ft => {
        // Basic scope check (simplified)
        if (ft.scope === 'CLASS' && !ft.classIds.includes(studentClassId)) return;
        
        let isDue = false;
        let dueDate = academicYear.startDate;
        
        if (ft.frequency === 'MONTHLY') {
            // Check if current month or past month
            // This is simplified. Real logic would match ft.months with actual dates.
            isDue = true; // Assume for now all are due to keep it simple or implement month check
            // TODO: Refine month check
        } else {
            isDue = true;
        }

        if (isDue) {
          totalDue += ft.amount;
        }
      });

      const totalPaid = student.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      const debtAmount = totalDue - totalPaid;

      if (debtAmount <= 0) return null;
      if (query.minAmount && debtAmount < query.minAmount) return null;

      // Calculate days past due
      // Use last payment date as a proxy or first unpaid fee date
      const lastPaymentDate = student.payments.length > 0 
        ? Math.max(...student.payments.map(p => p.paymentDate.getTime()))
        : academicYear.startDate.getTime();
      
      const daysPastDue = Math.floor((now.getTime() - lastPaymentDate) / (1000 * 60 * 60 * 24));

      let level = 'LEGER';
      if (daysPastDue > 90) level = 'ELEVE';
      else if (daysPastDue > 30) level = 'MOYEN';

      if (query.level && level !== query.level) return null;

      const blockedServices = [];
      if (daysPastDue > 60) blockedServices.push('BULLETIN');
      if (daysPastDue > 90) blockedServices.push('DELIBERATION');

      return {
        student: {
          id: student.id,
          nom: student.nom,
          postNom: student.postNom,
          prenom: student.prenom,
          matricule: student.matricule,
          className: student.enrollments[0]?.class?.name || 'N/A'
        },
        totalDebt: debtAmount,
        daysPastDue,
        level,
        lastPaymentDate: new Date(lastPaymentDate),
        blockedServices
      };
    }).filter(Boolean);

    // Sort by debt amount and days past due
    debts.sort((a: any, b: any) => b.totalDebt - a.totalDebt || b.daysPastDue - a.daysPastDue);

    const totalStats = {
      totalDebt: debts.reduce((sum: number, d: any) => sum + d.totalDebt, 0),
      over90Days: debts.filter((d: any) => d.daysPastDue > 90).reduce((sum: number, d: any) => sum + d.totalDebt, 0),
      studentsCount: debts.length
    };

    return {
      data: debts.slice(skip, skip + limit),
      total: debts.length,
      stats: totalStats
    };
  }

  async sendReminders(schoolId: string, body: { studentIds: string[], channel: string, template: string }) {
    const students = await prisma.student.findMany({
      where: { id: { in: body.studentIds }, schoolId },
      include: {
        payments: { orderBy: { paymentDate: 'desc' }, take: 1 }
      }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const telEcole = school?.telephone || '+243...';

    let sentCount = 0;
    let failedCount = 0;

    for (const student of students) {
      // Get debt for this student (re-calculate or use cached?)
      // For now, assume we passed the amount in some way or re-calc simple
      const debtInfo = await this.getStudentDebt(student.id, schoolId);
      
      const templateData = {
        NOM: `${student.nom} ${student.postNom}`,
        MATRICULE: student.matricule,
        MONTANT: debtInfo.debt.toString(),
        DATE: debtInfo.lastDate.toLocaleDateString(),
        TEL_ECOLE: telEcole
      };

      let message = '';
      if (body.template === 'AMICAL') {
        message = `EduGoma360: Cher parent, nous vous rappelons que le solde impayé pour ${templateData.NOM} (${templateData.MATRICULE}) s'élève à ${templateData.MONTANT} FC depuis le ${templateData.DATE}. Merci de régulariser. Contact: ${templateData.TEL_ECOLE}`;
      } else if (body.template === 'FERME') {
        message = `EduGoma360: URGENT - Le solde impayé de ${templateData.MONTANT} FC pour ${templateData.NOM} doit être régularisé sous 7 jours. Passé ce délai, le bulletin sera bloqué. Contact: ${templateData.TEL_ECOLE}`;
      } else {
        message = `EduGoma360: DERNIÈRE SOMMATION - Le solde de ${templateData.MONTANT} FC pour ${templateData.NOM} doit être payé sous 3 jours. Au-delà, exclusion de la délibération. Contact: ${templateData.TEL_ECOLE}`;
      }

      if (body.channel === 'SMS' || body.channel === 'BOTH') {
        const phone = student.telPere || student.telMere || student.telTuteur;
        if (phone) {
          const res = await smsService.sendAndLog(schoolId, phone, message);
          if (res.success) sentCount++; else failedCount++;
        } else {
          failedCount++;
        }
      }
      
      // Email simulation
      if (body.channel === 'EMAIL' || body.channel === 'BOTH') {
          // sendEmail logic here
          if (body.channel === 'EMAIL') sentCount++;
      }
    }

    return { sent: sentCount, failed: failedCount, cost: sentCount * 50 };
  }

  private async getStudentDebt(studentId: string, schoolId: string) {
    // Simplified debt calc for single student
    const feeTypes = await prisma.feeType.findMany({ where: { schoolId, isActive: true } });
    const payments = await prisma.payment.findMany({ where: { studentId, schoolId } });
    const totalDue = feeTypes.reduce((sum, ft) => sum + ft.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const lastDate = payments.length > 0 ? payments[0].paymentDate : new Date();
    return { debt: totalDue - totalPaid, lastDate };
  }

  async createPaymentPlan(schoolId: string, studentId: string, body: { totalAmount: number, installments: number, startDate: string }) {
    const startDate = new Date(body.startDate);
    const amountPerInstallment = Math.round(body.totalAmount / body.installments);

    const plan = await (prisma as any).paymentPlan.create({
      data: {
        schoolId,
        studentId,
        totalAmount: body.totalAmount,
        installments: body.installments,
        startDate,
        status: 'ACTIVE',
        schedule: {
          create: Array.from({ length: body.installments }).map((_, i) => ({
            dueDate: addMonths(startDate, i),
            amount: i === body.installments - 1 ? body.totalAmount - (amountPerInstallment * (body.installments - 1)) : amountPerInstallment,
            status: 'PENDING'
          }))
        }
      },
      include: { schedule: true }
    });

    return { plan, schedule: plan.schedule };
  }
}

export const debtsService = new DebtsService();
