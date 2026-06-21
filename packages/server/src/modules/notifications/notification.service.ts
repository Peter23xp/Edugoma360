import prisma from '../../lib/prisma';
import { sendEmail } from '../../lib/email/resend';

export type NotificationType =
    | 'SUB_EXPIRING_30' | 'SUB_EXPIRING_7' | 'SUB_EXPIRING_1'
    | 'SMS_QUOTA_80' | 'SMS_QUOTA_100'
    | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED'
    | 'NEW_SCHOOL' | 'ANOMALY';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';

interface CreateNotificationInput {
    schoolId?: string;
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    channel: NotificationChannel;
    emailTo?: string;
    smsTo?: string;
}

// ── Core: persist + dispatch ──────────────────────────────────────────────────

export async function createNotification(input: CreateNotificationInput): Promise<void> {
    await prisma.notification.create({
        data: {
            schoolId: input.schoolId,
            userId:   input.userId,
            type:     input.type,
            title:    input.title,
            message:  input.message,
            channel:  input.channel,
            sentAt:   new Date(),
        },
    });

    if (input.channel === 'EMAIL' && input.emailTo) {
        await sendEmail({
            to: input.emailTo,
            subject: input.title,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
                <h2 style="color:#0D47A1">${input.title}</h2>
                <p style="color:#333;line-height:1.6">${input.message}</p>
                <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
                <p style="color:#999;font-size:12px">EduGoma 360 — Système de gestion scolaire</p>
            </div>`,
        }).catch(err => console.error('[NOTIFICATION EMAIL ERROR]', err));
    }

    if (input.channel === 'SMS' && input.smsTo) {
        try {
            const { smsService } = await import('../sms/sms.service');
            await smsService.sendAndLog(
                input.schoolId ?? 'platform',
                input.smsTo,
                `EduGoma360: ${input.message}`,
                'fr',
            );
        } catch (err) {
            console.error('[NOTIFICATION SMS ERROR]', err);
        }
    }
}

// ── Broadcast to all SA admins (IN_APP) ───────────────────────────────────────

export async function notifySAAdmins(
    type: NotificationType,
    title: string,
    message: string,
    schoolId?: string,
): Promise<void> {
    const saAdmins = await prisma.user.findMany({
        where: { isSuperAdmin: true, isActive: true },
        select: { id: true, email: true },
    });

    await Promise.allSettled(
        saAdmins.map(admin =>
            createNotification({
                schoolId,
                userId:  admin.id,
                type,
                title,
                message,
                channel: 'IN_APP',
            })
        )
    );

    // Also email SA admin email if configured
    if (process.env.NOTIFICATION_ADMIN_EMAIL) {
        await createNotification({
            schoolId,
            type,
            title,
            message,
            channel:  'EMAIL',
            emailTo:  process.env.NOTIFICATION_ADMIN_EMAIL,
        }).catch(() => {});
    }
}

// ── Triggered Events ──────────────────────────────────────────────────────────

export async function notifyPaymentSuccess(schoolId: string, planName: string, amount: number, currency: string): Promise<void> {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { users: { where: { role: 'PREFET', isActive: true }, select: { email: true }, take: 1 } },
    });
    if (!school) return;

    const title   = `Paiement confirmé — ${school.name}`;
    const message = `L'école "${school.name}" a effectué un paiement de ${amount} ${currency} pour le plan ${planName}.`;

    await notifySAAdmins('PAYMENT_SUCCESS', title, message, schoolId);

    const prefetEmail = school.users[0]?.email;
    if (prefetEmail) {
        await createNotification({
            schoolId, type: 'PAYMENT_SUCCESS',
            title: 'Paiement confirmé',
            message: `Votre paiement de ${amount} ${currency} pour le plan ${planName} a été confirmé. Votre abonnement est actif.`,
            channel: 'EMAIL', emailTo: prefetEmail,
        });
    }
}

export async function notifyPaymentFailed(schoolId: string, planName: string): Promise<void> {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { users: { where: { role: 'PREFET', isActive: true }, select: { email: true }, take: 1 } },
    });
    if (!school) return;

    await notifySAAdmins('PAYMENT_FAILED', `Paiement échoué — ${school.name}`, `Le paiement pour le plan ${planName} de l'école "${school.name}" a échoué.`, schoolId);

    const prefetEmail = school.users[0]?.email;
    if (prefetEmail) {
        await createNotification({
            schoolId, type: 'PAYMENT_FAILED',
            title: 'Paiement échoué',
            message: `Votre tentative de paiement pour le plan ${planName} a échoué. Veuillez réessayer ou contacter le support.`,
            channel: 'EMAIL', emailTo: prefetEmail,
        });
    }
}

export async function notifyNewSchool(schoolId: string, schoolName: string): Promise<void> {
    await notifySAAdmins('NEW_SCHOOL', 'Nouvelle école inscrite', `Une nouvelle école "${schoolName}" vient de s'inscrire sur la plateforme.`, schoolId);
}
