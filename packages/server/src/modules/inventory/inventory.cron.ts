import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { sendSms } from '../../lib/sms';
import { libraryService } from './library.service';
import { maintenanceService } from './maintenance.service';

export function initInventoryCron() {
  // Daily at 7:00 AM — mark overdue loans and check maintenance
  cron.schedule('0 7 * * *', async () => {
    try {
      const schools = await prisma.school.findMany({ where: { isActive: true }, select: { id: true } });

      for (const school of schools) {
        // Mark overdue book loans
        const overdueCount = await libraryService.markOverdueLoans(school.id);
        if (overdueCount > 0) {
          console.log(`[CRON] ${school.id}: ${overdueCount} loan(s) marked OVERDUE`);
        }

        // Check overdue maintenance requests
        const maintenance = await maintenanceService.checkOverdueRequests(school.id);
        if (maintenance.overdueUrgent > 0) {
          console.log(`[CRON] ${school.id}: ${maintenance.overdueUrgent} URGENT maintenance overdue (>48h)`);
          // SMS notification to Préfet would go here
          await sendMaintenanceAlert(school.id, maintenance.overdueUrgent);
        }
      }
    } catch (error) {
      console.error('[CRON] Inventory check failed:', error);
    }
  });

  // Weekly Sundays at 8:00 AM — send library reminders for loans due within 7 days
  cron.schedule('0 8 * * 0', async () => {
    try {
      const schools = await prisma.school.findMany({ where: { isActive: true }, select: { id: true } });
      const inSevenDays = new Date();
      inSevenDays.setDate(inSevenDays.getDate() + 7);

      for (const school of schools) {
        const loansDueSoon = await prisma.bookLoan.findMany({
          where: {
            book: { schoolId: school.id },
            status: 'ACTIVE',
            expectedReturn: { lte: inSevenDays },
          },
          include: {
            book: { select: { titre: true } },
            student: {
              select: { nom: true, postNom: true, telPere: true, telMere: true, telTuteur: true },
            },
          },
        });

        for (const loan of loansDueSoon) {
          const phone = loan.student.telPere || loan.student.telMere || loan.student.telTuteur;
          if (phone) {
            await sendSmsReminder(school.id, phone, loan.student.nom, loan.book.titre, loan.expectedReturn);
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Library reminders failed:', error);
    }
  });
}

async function sendMaintenanceAlert(schoolId: string, count: number) {
  try {
    const prefets = await prisma.user.findMany({
      where: { schoolId, role: 'PREFET', isActive: true },
      select: { phone: true, nom: true },
    });

    for (const prefet of prefets) {
      if (prefet.phone) {
        const message = `🔴 Alerte maintenance: ${count} demande(s) urgente(s) non résolue(s) depuis plus de 48h. Action requise.`;
        const result = await sendSms(prefet.phone, message);
        await prisma.smsLog.create({
          data: {
            schoolId,
            recipient: prefet.phone,
            message,
            status: result.success ? 'SENT' : 'FAILED',
            errorMsg: result.error,
          },
        });
      }
    }
  } catch (error) {
    console.error('[SMS] Maintenance alert failed:', error);
  }
}

async function sendSmsReminder(schoolId: string, phone: string, studentName: string, bookTitle: string, dueDate: Date) {
  try {
    const formattedDate = dueDate.toLocaleDateString('fr-FR');
    const message = `Rappel bibliothèque: Le livre "${bookTitle}" prêté à ${studentName} doit être retourné avant le ${formattedDate}. Merci.`;
    const result = await sendSms(phone, message);
    await prisma.smsLog.create({
      data: {
        schoolId,
        recipient: phone,
        message,
        status: result.success ? 'SENT' : 'FAILED',
        errorMsg: result.error,
      },
    });
  } catch (error) {
    console.error('[SMS] Library reminder failed:', error);
  }
}
