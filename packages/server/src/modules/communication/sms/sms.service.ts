import prisma from '../../../lib/prisma';
import { sendSMS, getBalance } from '../../../lib/sms/africasTalking';
import { subDays } from 'date-fns';

interface RecipientInput {
  phone: string;
  variables?: Record<string, any>;
}

interface SendSMSBody {
  recipients: RecipientInput[];
  template: string;
  scheduledAt?: string;
  recipientType?: string;
}

interface PreviewRecipientsQuery {
  type: 'PARENTS' | 'TEACHERS' | 'ALL';
  classes?: string;       // IDs séparés par virgule
  paymentStatus?: string; // IMPAYE,PARTIEL,A_JOUR
  attendance?: string;    // below80,below60
}

export class SMSService {

  public static async getBalance() {
    return await getBalance();
  }

  // ── Preview recipients (résolution réelle des destinataires) ────────────────
  public static async getPreviewRecipients(schoolId: string, query: PreviewRecipientsQuery) {
    const { type, classes, paymentStatus, attendance } = query;
    const classIds = classes ? classes.split(',').filter(Boolean) : [];
    const paymentStatuses = paymentStatus ? paymentStatus.split(',').filter(Boolean) : [];
    const attendanceFilters = attendance ? attendance.split(',').filter(Boolean) : [];

    const recipients: Array<{
      phone: string;
      name: string;
      variables: Record<string, any>;
    }> = [];

    // ── Récupérer l'année académique active ─────────────────────────────────
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });
    if (!academicYear) throw new Error('Aucune année académique active');

    // ── PARENTS ─────────────────────────────────────────────────────────────
    if (type === 'PARENTS' || type === 'ALL') {
      const enrollmentWhere: any = {
        academicYearId: academicYear.id,
        ...(classIds.length > 0 && { classId: { in: classIds } }),
      };

      const students = await prisma.student.findMany({
        where: {
          schoolId,
          isActive: true,
          enrollments: { some: enrollmentWhere },
        },
        include: {
          enrollments: {
            where: enrollmentWhere,
            include: { class: { select: { id: true, name: true } } },
            take: 1,
          },
          payments: {
            where: { academicYearId: academicYear.id },
            select: { amountPaid: true },
          },
          parentUser: {
            select: { email: true, phone: true },
          },
        },
      });

      // Calcul dettes pour filtre paiement
      let feeTotal = 0;
      if (paymentStatuses.length > 0) {
        const feeTypes = await prisma.feeType.findMany({
          where: { schoolId, isActive: true },
          select: { amount: true },
        });
        feeTotal = feeTypes.reduce((sum, f) => sum + f.amount, 0);
      }

      // Calcul présences pour filtre assiduité
      let attendanceMap = new Map<string, number>();
      if (attendanceFilters.length > 0) {
        const cutoff = subDays(new Date(), 30);
        const records = await prisma.attendance.findMany({
          where: {
            class: { schoolId },
            date: { gte: cutoff },
          },
          select: { studentId: true, status: true },
        });
        const countMap = new Map<string, { total: number; present: number }>();
        for (const r of records) {
          const cur = countMap.get(r.studentId) ?? { total: 0, present: 0 };
          cur.total++;
          if (r.status === 'PRESENT') cur.present++;
          countMap.set(r.studentId, cur);
        }
        for (const [sid, c] of countMap.entries()) {
          attendanceMap.set(sid, c.total > 0 ? (c.present / c.total) * 100 : 100);
        }
      }

      for (const student of students) {
        const className = student.enrollments[0]?.class?.name ?? '';
        const totalPaid = student.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const debtAmount = Math.max(0, feeTotal - totalPaid);

        // Filtre statut paiement
        if (paymentStatuses.length > 0) {
          const status = debtAmount <= 0 ? 'A_JOUR' : totalPaid > 0 ? 'PARTIEL' : 'IMPAYE';
          if (!paymentStatuses.includes(status)) continue;
        }

        // Filtre assiduité
        if (attendanceFilters.length > 0) {
          const rate = attendanceMap.get(student.id) ?? 100;
          const passes = attendanceFilters.some((f) =>
            f === 'below60' ? rate < 60 : rate < 80,
          );
          if (!passes) continue;
        }

        const totalPaid2 = student.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const debt = Math.max(0, feeTotal - totalPaid2);

        // Résolution du téléphone (père > mère > tuteur > compte parent)
        const phones = [
          student.telPere,
          student.telMere,
          student.telTuteur,
          student.parentUser?.phone,
        ].filter((p): p is string => !!p);

        for (const phone of phones.slice(0, 1)) {
          const cleaned = phone.replace(/\s+/g, '');
          recipients.push({
            phone: cleaned.startsWith('+') ? cleaned : `+243${cleaned.replace(/^0/, '')}`,
            name: `${student.nom} ${student.postNom}${student.prenom ? ' ' + student.prenom : ''}`,
            variables: {
              nom: `${student.nom} ${student.postNom}`,
              prenom: student.prenom ?? '',
              classe: className,
              montant: debt,
              date: new Date().toLocaleDateString('fr-FR'),
              ecole: '',
            },
          });
        }
      }
    }

    // ── ENSEIGNANTS ─────────────────────────────────────────────────────────
    if (type === 'TEACHERS' || type === 'ALL') {
      const teachers = await prisma.teacher.findMany({
        where: { schoolId, isActive: true, telephone: { not: null } },
        select: {
          nom: true,
          postNom: true,
          prenom: true,
          telephone: true,
        },
      });

      for (const t of teachers) {
        if (!t.telephone) continue;
        const cleaned = t.telephone.replace(/\s+/g, '');
        recipients.push({
          phone: cleaned.startsWith('+') ? cleaned : `+243${cleaned.replace(/^0/, '')}`,
          name: `${t.nom} ${t.postNom}`,
          variables: {
            nom: `${t.nom} ${t.postNom}`,
            prenom: t.prenom ?? '',
            classe: 'N/A',
            montant: 0,
            date: new Date().toLocaleDateString('fr-FR'),
            ecole: '',
          },
        });
      }
    }

    // Validation numéros RDC
    const valid = recipients.filter((r) => /^\+243[89]\d{8}$/.test(r.phone));
    const invalid = recipients.length - valid.length;

    return {
      recipients: valid,
      totalResolved: recipients.length,
      validCount: valid.length,
      invalidCount: invalid,
      estimatedCost: valid.length * 25,
    };
  }

  // ── Envoi campagne ──────────────────────────────────────────────────────────
  public static async sendCampaign(data: SendSMSBody, schoolId: string, createdById: string) {
    const { recipients, template, scheduledAt, recipientType } = data;

    const validRecipients: RecipientInput[] = [];
    const invalidRecipients: RecipientInput[] = [];

    recipients.forEach((r) => {
      const cleaned = r.phone.replace(/\s+/g, '');
      if (/^\+243[89]\d{8}$/.test(cleaned)) {
        validRecipients.push({ ...r, phone: cleaned });
      } else {
        invalidRecipients.push(r);
      }
    });

    const isScheduled = !!scheduledAt && new Date(scheduledAt) > new Date();
    const status = isScheduled ? 'SCHEDULED' : 'QUEUED';

    const campaign = await prisma.sMSCampaign.create({
      data: {
        schoolId,
        template,
        recipientType: recipientType || 'ALL',
        totalRecipients: recipients.length,
        validRecipients: validRecipients.length,
        invalidRecipients: invalidRecipients.length,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById,
      },
    });

    if (!isScheduled && validRecipients.length > 0) {
      this.processCampaign(campaign.id, validRecipients, template).catch((e) => {
        console.error(`Failed to process campaign ${campaign.id}`, e);
      });
    }

    return {
      jobId: campaign.id,
      totalRecipients: recipients.length,
      validRecipients: validRecipients.length,
      invalidRecipients: invalidRecipients.length,
      estimatedCost: validRecipients.length * 25,
      status,
    };
  }

  public static async getCampaignStatus(jobId: string, schoolId: string) {
    const campaign = await prisma.sMSCampaign.findUnique({
      where: { id: jobId, schoolId },
      include: { messages: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    let progress = 0;
    if (campaign.totalRecipients > 0) {
      progress =
        ((campaign.sentSMS + campaign.failedSMS + campaign.invalidRecipients) /
          campaign.totalRecipients) *
        100;
    }

    return {
      jobId: campaign.id,
      status: campaign.status,
      totalSMS: campaign.totalRecipients,
      sentSMS: campaign.sentSMS,
      failedSMS: campaign.failedSMS + campaign.invalidRecipients,
      progress: Math.min(100, progress),
      logs: campaign.messages.map((m) => ({
        phone: m.phone,
        status: m.status,
        errorMessage: m.errorMessage,
        sentAt: m.sentAt,
      })),
    };
  }

  public static async getHistory(schoolId: string) {
    return await prisma.sMSCampaign.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private static async processCampaign(
    campaignId: string,
    recipients: RecipientInput[],
    template: string,
  ) {
    await prisma.sMSCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', startedAt: new Date() },
    });

    let sentCount = 0;
    let failedCount = 0;
    let totalCost = 0;

    // Traitement par batch de 1000 (limite Africa's Talking)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      for (const rec of batch) {
        let finalMessage = template;
        if (rec.variables) {
          for (const [key, value] of Object.entries(rec.variables)) {
            finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), String(value));
          }
        }

        const msg = await prisma.sMSMessage.create({
          data: { campaignId, phone: rec.phone, message: finalMessage, status: 'PENDING' },
        });

        try {
          const res = await sendSMS({ to: [rec.phone], message: finalMessage });

          if (res.success && res.data?.[0]) {
            const rData = res.data[0];
            const isSuccess = rData.status === 'Success';
            await prisma.sMSMessage.update({
              where: { id: msg.id },
              data: {
                status: isSuccess ? 'SENT' : 'FAILED',
                errorMessage: isSuccess ? null : rData.status,
                messageId: rData.messageId,
                cost: isSuccess ? 25 : 0,
                sentAt: isSuccess ? new Date() : null,
              },
            });
            if (isSuccess) { sentCount++; totalCost += 25; }
            else failedCount++;
          } else {
            await prisma.sMSMessage.update({
              where: { id: msg.id },
              data: { status: 'FAILED', errorMessage: res.error || 'Unknown error' },
            });
            failedCount++;
          }
        } catch (e: any) {
          await prisma.sMSMessage.update({
            where: { id: msg.id },
            data: { status: 'FAILED', errorMessage: e.message },
          });
          failedCount++;
        }
      }
    }

    await prisma.sMSCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date(), sentSMS: sentCount, failedSMS: failedCount, cost: totalCost },
    });
  }
}
