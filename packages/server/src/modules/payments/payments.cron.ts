
import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { debtsService } from './debts.service';

/**
 * Daily CRON job for automatic debt reminders at 09:00.
 */
export const initPaymentsCron = (): void => {
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON-PAYMENTS] Début de l\'envois des rappels automatiques (09:00)...');
        
        try {
            // Logic: Scan all active schools
            const schools = await prisma.school.findMany({ where: { isActive: true }, select: { id: true } });
            
            for (const school of schools) {
                // Fetch all debts for this school
                const { data: debts } = await debtsService.getDebts(school.id, { limit: 1000 });
                
                // 1. Rappel AMICAL à 7 jours de retard
                const leger = debts.filter((d: any) => d.daysPastDue === 7).map((d: any) => d.student.id);
                if (leger.length > 0) {
                    await debtsService.sendReminders(school.id, { studentIds: leger, channel: 'SMS', template: 'AMICAL' });
                    console.log(`[CRON-PAYMENTS] ${leger.length} rappels amicaux envoyés pour l'école ${school.id}`);
                }

                // 2. Rappel FERME à 30 jours de retard
                const moyen = debts.filter((d: any) => d.daysPastDue === 30).map((d: any) => d.student.id);
                if (moyen.length > 0) {
                    await debtsService.sendReminders(school.id, { studentIds: moyen, channel: 'SMS', template: 'FERME' });
                    console.log(`[CRON-PAYMENTS] ${moyen.length} rappels fermes envoyés pour l'école ${school.id}`);
                }

                // 3. Dernier rappel SOMMATION à 90 jours de retard
                const eleve = debts.filter((d: any) => d.daysPastDue === 90).map((d: any) => d.student.id);
                if (eleve.length > 0) {
                    await debtsService.sendReminders(school.id, { studentIds: eleve, channel: 'SMS', template: 'SOMMATION' });
                    console.log(`[CRON-PAYMENTS] ${eleve.length} sommations envoyées pour l'école ${school.id}`);
                }
            }
        } catch (error) {
            console.error('[CRON-PAYMENTS] Erreur fatale dans le job de rappels:', error);
        }
    });

    console.log('[CRON-PAYMENTS] Payments CRON job initialized. (Daily @ 09:00)');
};
