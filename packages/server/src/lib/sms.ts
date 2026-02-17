import { env } from '../config/env';

// Africa's Talking SMS wrapper

interface SmsResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an SMS via Africa's Talking
 */
export async function sendSms(
    to: string,
    message: string,
): Promise<SmsResult> {
    if (!env.AT_API_KEY || !env.AT_USERNAME) {
        console.warn('[SMS] Africa\'s Talking not configured. Message not sent.');
        return { success: false, error: 'SMS not configured' };
    }

    try {
        // Dynamic import to avoid issues if package is not installed
        const AfricasTalking = (await import('africastalking')).default;
        const at = AfricasTalking({
            apiKey: env.AT_API_KEY,
            username: env.AT_USERNAME,
        });

        const sms = at.SMS;
        const result = await sms.send({
            to: [to],
            message,
            from: env.AT_SENDER_ID,
        });

        const recipient = result.SMSMessageData?.Recipients?.[0];
        if (recipient?.statusCode === 101) {
            return { success: true, messageId: recipient.messageId };
        }

        return {
            success: false,
            error: recipient?.status ?? 'Unknown error',
        };
    } catch (error) {
        const message_err = error instanceof Error ? error.message : 'Unknown error';
        console.error('[SMS] Error sending SMS:', message_err);
        return { success: false, error: message_err };
    }
}

/**
 * Send bulk SMS to multiple recipients
 */
export async function sendBulkSms(
    recipients: Array<{ phone: string; message: string }>,
): Promise<SmsResult[]> {
    const results: SmsResult[] = [];
    for (const { phone, message } of recipients) {
        const result = await sendSms(phone, message);
        results.push(result);
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return results;
}

// ── SMS Templates ─────────────────────────────────────────────────────────────

export const SMS_TEMPLATES = {
    // French templates
    fr: {
        paymentConfirmation: (studentName: string, amount: string, receipt: string) =>
            `EduGoma360: Paiement de ${amount} reçu pour ${studentName}. Reçu N°${receipt}. Merci.`,

        absenceNotice: (studentName: string, date: string, period: string) =>
            `EduGoma360: ${studentName} a été marqué(e) absent(e) le ${date} (${period}). Contactez l'école pour plus d'infos.`,

        gradeNotification: (studentName: string, term: string) =>
            `EduGoma360: Les notes du ${term} de ${studentName} sont disponibles. Consultez le portail parents ou contactez l'école.`,

        convocation: (parentName: string, date: string, motif: string) =>
            `EduGoma360: Cher parent ${parentName}, vous êtes convoqué(e) le ${date}. Motif: ${motif}. Merci de confirmer votre présence.`,

        reminder: (studentName: string, amount: string) =>
            `EduGoma360: Rappel - Frais scolaires en retard pour ${studentName}. Solde: ${amount}. Merci de régulariser.`,
    },

    // Swahili templates
    sw: {
        paymentConfirmation: (studentName: string, amount: string, receipt: string) =>
            `EduGoma360: Malipo ya ${amount} yamepokewa kwa ${studentName}. Risiti N°${receipt}. Asante.`,

        absenceNotice: (studentName: string, date: string, period: string) =>
            `EduGoma360: ${studentName} hakuwepo shuleni tarehe ${date} (${period}). Wasiliana na shule kwa habari zaidi.`,

        gradeNotification: (studentName: string, term: string) =>
            `EduGoma360: Alama za ${term} za ${studentName} ziko tayari. Angalia kwenye portali ya wazazi.`,

        convocation: (parentName: string, date: string, motif: string) =>
            `EduGoma360: Mzazi ${parentName}, umealikwa tarehe ${date}. Sababu: ${motif}. Tafadhali thibitisha uwepo wako.`,

        reminder: (studentName: string, amount: string) =>
            `EduGoma360: Kumbusho - Ada ya shule ya ${studentName} haijalipiwa. Salio: ${amount}. Tafadhali lipa.`,
    },
} as const;
