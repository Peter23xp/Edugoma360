import cron from 'node-cron';
import prisma from '../prisma';
import { createNotification, notifySAAdmins } from '../../modules/notifications/notification.service';

// Run daily at 9:00 AM (Lubumbashi timezone)
export function startSubscriptionAlertsCron(): void {
    cron.schedule('0 9 * * *', runSubscriptionAlerts, { timezone: 'Africa/Lubumbashi' });
    cron.schedule('0 10 * * *', runSmsQuotaAlerts, { timezone: 'Africa/Lubumbashi' });
    console.log('[CRON] Subscription & SMS alert jobs scheduled (9h and 10h Lubumbashi)');
}

async function runSubscriptionAlerts(): Promise<void> {
    console.log('[CRON] Running subscription expiry alerts...');
    const now = new Date();

    const thresholds = [
        { days: 30, type: 'SUB_EXPIRING_30' as const, label: '30 jours' },
        { days: 7,  type: 'SUB_EXPIRING_7'  as const, label: '7 jours'  },
        { days: 1,  type: 'SUB_EXPIRING_1'  as const, label: '1 jour'   },
    ];

    for (const { days, type, label } of thresholds) {
        const from = new Date(now.getTime() + days * 86400000);
        const to   = new Date(from.getTime() + 86400000); // +1 day window

        const expiring = await prisma.subscription.findMany({
            where: {
                status: { in: ['ACTIVE', 'TRIAL'] },
                endDate: { gte: from, lt: to },
            },
            include: {
                school: {
                    select: {
                        id: true, name: true,
                        users: { where: { role: 'PREFET', isActive: true }, select: { email: true, phone: true }, take: 1 },
                    },
                },
            },
        });

        for (const sub of expiring) {
            const school = sub.school;
            const expireDate = new Date(sub.endDate).toLocaleDateString('fr-FR');

            await notifySAAdmins(
                type,
                `Abonnement expirant dans ${label} — ${school.name}`,
                `L'abonnement de "${school.name}" expire le ${expireDate}. Statut actuel : ${sub.status}.`,
                school.id,
            ).catch(console.error);

            const prefet = school.users[0];
            if (prefet?.email) {
                await createNotification({
                    schoolId: school.id,
                    type,
                    title: `Abonnement EduGoma 360 — expire dans ${label}`,
                    message: `Votre abonnement EduGoma 360 expire le ${expireDate}. Renouvelez dès maintenant pour ne pas interrompre votre accès.`,
                    channel: 'EMAIL',
                    emailTo: prefet.email,
                }).catch(console.error);
            }
        }
    }

    console.log('[CRON] Subscription expiry alerts done.');
}

async function runSmsQuotaAlerts(): Promise<void> {
    console.log('[CRON] Running SMS quota alerts...');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const schools = await prisma.school.findMany({
        where: { isActive: true },
        select: {
            id: true, name: true,
            plan: { select: { maxSmsPerMonth: true } },
            users: { where: { role: 'PREFET', isActive: true }, select: { email: true }, take: 1 },
        },
    });

    for (const school of schools) {
        const quota = school.plan?.maxSmsPerMonth ?? 0;
        if (quota <= 0) continue;

        const sent = await prisma.smsLog.count({
            where: { schoolId: school.id, sentAt: { gte: startOfMonth } },
        });

        const pct = (sent / quota) * 100;
        if (pct < 80) continue;

        const type = pct >= 100 ? 'SMS_QUOTA_100' as const : 'SMS_QUOTA_80' as const;
        const label = pct >= 100 ? 'dépassé' : `à ${Math.round(pct)}%`;

        await notifySAAdmins(
            type,
            `Quota SMS ${label} — ${school.name}`,
            `L'école "${school.name}" a utilisé ${sent}/${quota} SMS ce mois (${Math.round(pct)}%).`,
            school.id,
        ).catch(console.error);

        if (pct >= 90 && school.users[0]?.email) {
            await createNotification({
                schoolId: school.id,
                type,
                title: `Quota SMS ${label}`,
                message: `Vous avez utilisé ${sent} SMS sur ${quota} ce mois. ${pct >= 100 ? 'Vous ne pouvez plus envoyer de SMS.' : 'Vous approchez de votre limite mensuelle.'}`,
                channel: 'EMAIL',
                emailTo: school.users[0].email,
            }).catch(console.error);
        }
    }

    console.log('[CRON] SMS quota alerts done.');
}
