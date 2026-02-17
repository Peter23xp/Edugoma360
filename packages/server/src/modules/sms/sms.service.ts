import prisma from '../../lib/prisma';
import { sendSms, SMS_TEMPLATES } from '../../lib/sms';

export class SmsService {
    async sendAndLog(schoolId: string, to: string, message: string, language: string = 'fr') {
        const result = await sendSms(to, message);

        await prisma.smsLog.create({
            data: {
                schoolId,
                recipient: to,
                message,
                language,
                status: result.success ? 'SENT' : 'FAILED',
                errorMsg: result.error,
            },
        });

        return result;
    }

    async sendBulkFromTemplate(
        schoolId: string,
        recipients: string[],
        templateKey: string,
        templateData: Record<string, string>,
        language: 'fr' | 'sw' = 'fr',
    ) {
        const results = [];
        for (const phone of recipients) {
            const templates = SMS_TEMPLATES[language] as any;
            const templateFn = templates?.[templateKey];
            if (!templateFn) {
                results.push({ phone, success: false, error: 'Template non trouvé' });
                continue;
            }

            const message = templateFn(...Object.values(templateData));
            const result = await this.sendAndLog(schoolId, phone, message, language);
            results.push({ phone, ...result });
        }
        return results;
    }

    async getLogs(schoolId: string) {
        return prisma.smsLog.findMany({
            where: { schoolId },
            orderBy: { sentAt: 'desc' },
            take: 100,
        });
    }
}

export const smsService = new SmsService();
