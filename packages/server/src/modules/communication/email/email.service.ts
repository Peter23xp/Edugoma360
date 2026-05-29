import prisma from '../../../lib/prisma';
import { sendEmail } from '../../../lib/email/resend';
import path from 'path';
import fs from 'fs';

interface SendEmailBody {
  recipientEmails: string[];
  recipientType: string;
  subject: string;
  htmlContent: string;
  cc?: string;
  scheduledAt?: string;
  attachmentPaths?: string[];
}

export class EmailService {

  public static async sendCampaign(data: SendEmailBody, schoolId: string, createdById: string) {
    const { recipientEmails, recipientType, subject, htmlContent, cc, scheduledAt, attachmentPaths = [] } = data;

    const isScheduled = !!scheduledAt && new Date(scheduledAt) > new Date();

    const campaign = await prisma.emailCampaign.create({
      data: {
        schoolId,
        subject,
        htmlContent,
        recipientType,
        recipientEmails: JSON.stringify(recipientEmails),
        totalRecipients: recipientEmails.length,
        status: isScheduled ? 'SCHEDULED' : 'QUEUED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        attachmentUrls: JSON.stringify(attachmentPaths),
        createdById,
      },
    });

    if (!isScheduled && recipientEmails.length > 0) {
      this.processCampaign(campaign.id, recipientEmails, subject, htmlContent, cc, attachmentPaths).catch((e) => {
        console.error(`Email campaign ${campaign.id} failed:`, e);
      });
    }

    return {
      jobId: campaign.id,
      totalRecipients: recipientEmails.length,
      status: campaign.status,
    };
  }

  public static async getHistory(schoolId: string) {
    return prisma.emailCampaign.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        subject: true,
        recipientType: true,
        totalRecipients: true,
        sentEmails: true,
        failedEmails: true,
        status: true,
        scheduledAt: true,
        completedAt: true,
        createdAt: true,
        createdBy: { select: { nom: true, role: true } },
      },
    });
  }

  private static async processCampaign(
    campaignId: string,
    emails: string[],
    subject: string,
    html: string,
    cc?: string,
    attachmentPaths: string[] = [],
  ) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', startedAt: new Date() },
    });

    // Préparer les pièces jointes
    const attachments = attachmentPaths
      .filter((p) => fs.existsSync(p))
      .map((p) => ({
        filename: path.basename(p),
        content: fs.readFileSync(p),
        contentType: 'application/octet-stream',
      }));

    let sentCount = 0;
    let failedCount = 0;

    // Envoi par batch de 50 (limite Resend free tier)
    const BATCH = 50;
    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      try {
        await sendEmail({
          to: batch,
          subject,
          html,
          cc: cc ? [cc] : undefined,
          attachments,
        });
        sentCount += batch.length;
      } catch {
        failedCount += batch.length;
      }
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: failedCount === emails.length ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        sentEmails: sentCount,
        failedEmails: failedCount,
      },
    });

    // Nettoyage des pièces jointes temporaires
    for (const p of attachmentPaths) {
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    }
  }
}
