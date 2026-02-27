import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { sendSms } from '../../lib/sms';

/**
 * Updates teacher statuses based on approved leave requests.
 * - Marks teachers as EN_CONGE if their leave starts today
 * - Marks teachers as ACTIF if their leave ended yesterday
 * Runs daily at 08:00 via initTeacherCron().
 */
export const updateTeacherStatuses = async (): Promise<void> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let updatedToLeave = 0;
    let updatedToActive = 0;

    try {
        // ─── 1. Teachers whose leave starts today → EN_CONGE ────────────────────
        const startingLeaves = await (prisma as any).teacherLeave.findMany({
            where: {
                status: 'APPROVED',
                startDate: { gte: today, lt: tomorrow },
                teacher: { statut: { not: 'EN_CONGE' } }
            },
            include: {
                teacher: {
                    select: { id: true, nom: true, prenom: true, telephone: true }
                }
            }
        });

        for (const leave of startingLeaves) {
            try {
                await prisma.teacher.update({
                    where: { id: leave.teacherId },
                    data: { statut: 'EN_CONGE' }
                });
                console.log(`[CRON] ✓ ${leave.teacher.nom} → EN_CONGE`);
                updatedToLeave++;

                if (leave.teacher.telephone) {
                    const msg = `EduGoma360 - Votre congé a débuté aujourd'hui. Bon repos !`;
                    sendSms(leave.teacher.telephone, msg).catch(err =>
                        console.error(`[CRON] SMS error:`, err)
                    );
                }
            } catch (err) {
                console.error(`[CRON] Erreur EN_CONGE pour teacher ${leave.teacherId}:`, err);
            }
        }

        // ─── 2. Teachers whose leave ended yesterday → ACTIF ──────────────────
        const endingLeaves = await (prisma as any).teacherLeave.findMany({
            where: {
                status: 'APPROVED',
                endDate: { gte: yesterday, lt: today },
                teacher: { statut: 'EN_CONGE' }
            },
            include: {
                teacher: {
                    select: { id: true, nom: true, prenom: true, telephone: true }
                }
            }
        });

        for (const leave of endingLeaves) {
            try {
                await prisma.teacher.update({
                    where: { id: leave.teacherId },
                    data: { statut: 'ACTIF' }
                });
                console.log(`[CRON] ✓ ${leave.teacher.nom} → ACTIF (retour de congé)`);
                updatedToActive++;

                if (leave.teacher.telephone) {
                    const msg = `EduGoma360 - Bienvenue de retour ${leave.teacher.prenom || leave.teacher.nom} ! Votre congé se termine aujourd'hui.`;
                    sendSms(leave.teacher.telephone, msg).catch(err =>
                        console.error(`[CRON] SMS error:`, err)
                    );
                }
            } catch (err) {
                console.error(`[CRON] Erreur ACTIF pour teacher ${leave.teacherId}:`, err);
            }
        }

        // ─── 3. Reminder SMS for leaves ending tomorrow ─────────────────────────
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

        const soonEndingLeaves = await (prisma as any).teacherLeave.findMany({
            where: {
                status: 'APPROVED',
                endDate: { gte: tomorrow, lt: tomorrowEnd }
            },
            include: {
                teacher: {
                    select: { nom: true, prenom: true, telephone: true }
                }
            }
        });

        for (const leave of soonEndingLeaves) {
            if (leave.teacher.telephone) {
                const msg = `EduGoma360 - Rappel : votre congé se termine demain ${leave.teacher.prenom || leave.teacher.nom}. Bon retour !`;
                sendSms(leave.teacher.telephone, msg).catch(err =>
                    console.error(`[CRON] SMS reminder error:`, err)
                );
            }
        }

        console.log(
            `[CRON] ✓ Mise à jour terminée: ${updatedToLeave} → EN_CONGE, ${updatedToActive} → ACTIF`,
            `| ${soonEndingLeaves.length} rappels envoyés`
        );

    } catch (error) {
        console.error('[CRON] Erreur fatale dans updateTeacherStatuses:', error);
        // Never re-throw — CRON errors must not crash the server
    }
};

/**
 * Initialize all teacher-related CRON jobs.
 * Called once at server startup in index.ts.
 */
export const initTeacherCron = (): void => {
    // Daily status update at 08:00
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Mise à jour quotidienne des statuts enseignants...');
        await updateTeacherStatuses();
    });

    // Annual leave balance reset on August 1st at midnight
    cron.schedule('0 0 1 8 *', async () => {
        console.log('[CRON] Réinitialisation des soldes de congés (nouvelle année scolaire)...');
        try {
            const result = await (prisma as any).teacher.updateMany({
                where: { isActive: true },
                data: { congePris: 0, congeGlobal: 20 }
            });
            console.log(`[CRON] ✓ ${result.count} enseignants réinitialisés à 20j de congé.`);
        } catch (error) {
            console.error('[CRON] Erreur réinitialisation congés:', error);
        }
    });

    console.log('[CRON] Teacher module cron jobs initialized. (Daily @ 08:00 | Reset @ Aug 1st)');
};
