import prisma from '../../../lib/prisma';
import { generateConvocationPDF } from '../../../lib/pdf/convocationGenerator';
import { sendEmail } from '../../../lib/email/resend';
import { sendSMS } from '../../../lib/sms/africasTalking';
import path from 'path';
import fs from 'fs';

interface CreateConvocationBody {
  studentId: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  parentQualite: string;
  motif: string;
  details: string;
  dateRendezVous: string;
  heureRendezVous: string;
  lieu: string;
  sendEmailFlag: boolean;
  sendSMSFlag: boolean;
}

const MOTIF_LABELS: Record<string, string> = {
  RESULTATS_INSUFFISANTS: 'Résultats insuffisants',
  ABSENCES_REPETEES: 'Absences répétées',
  PROBLEME_DISCIPLINAIRE: 'Problème disciplinaire',
  RETARD_PAIEMENT: 'Retard de paiement',
  COMPORTEMENT_PREOCCUPANT: 'Comportement préoccupant',
  AUTRE: 'Autre motif',
};

export class ConvocationsService {

  // ── Créer une convocation ───────────────────────────────────────────────────
  public static async create(data: CreateConvocationBody, schoolId: string, createdById: string) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId, schoolId },
      include: {
        enrollments: {
          where: { class: { schoolId } },
          include: { class: { select: { name: true } } },
          orderBy: { enrolledAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!student) throw new Error('Élève introuvable');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new Error('École introuvable');

    // Numérotation automatique: CONV-YYYY-NNN (robuste aux accès concurrents)
    const year = new Date().getFullYear();
    const generateNumero = async (): Promise<string> => {
      const count = await prisma.convocation.count({ where: { schoolId } });
      return `CONV-${year}-${String(count + 1).padStart(3, '0')}`;
    };
    const numero = await generateNumero();

    const className = student.enrollments[0]?.class?.name ?? 'N/A';
    const dateRDV = new Date(data.dateRendezVous);
    const motifLabel = MOTIF_LABELS[data.motif] ?? data.motif;

    // ── Générer le PDF ──────────────────────────────────────────────────────
    const pdfBuffer = await generateConvocationPDF({
      numero,
      dateEmission: new Date(),
      tuteur: { nom: data.parentName, qualite: data.parentQualite },
      eleve: { nom: `${student.nom} ${student.postNom}`, classe: className },
      motif: motifLabel,
      details: data.details,
      dateRendezVous: dateRDV,
      heureRendezVous: data.heureRendezVous,
      lieu: data.lieu,
      school: { nom: school.name, logoUrl: school.logoUrl, adresse: school.adresse },
    });

    // ── Stocker le PDF ──────────────────────────────────────────────────────
    const uploadsDir = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'uploads', 'convocations');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const pdfFilename = `${numero.replace(/-/g, '_')}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);
    fs.writeFileSync(pdfPath, pdfBuffer);
    const pdfUrl = `/uploads/convocations/${pdfFilename}`;

    // ── Sauvegarder en base (retry si collision numéro) ─────────────────────
    let convocation: any;
    let attempts = 0;
    while (attempts < 3) {
      try {
        convocation = await prisma.convocation.create({
          data: {
            schoolId,
            numero: attempts === 0 ? numero : `CONV-${year}-${Date.now()}`,
            studentId: data.studentId,
            parentName: data.parentName,
            parentPhone: data.parentPhone,
            parentEmail: data.parentEmail,
            parentQualite: data.parentQualite,
            motif: data.motif,
            details: data.details,
            dateRendezVous: dateRDV,
            heureRendezVous: data.heureRendezVous,
            lieu: data.lieu,
            pdfUrl,
            createdById,
          },
        });
        break;
      } catch (e: any) {
        if (e.code === 'P2002') { attempts++; continue; }
        throw e;
      }
    }
    if (!convocation) throw new Error('Impossible de créer la convocation après plusieurs tentatives');

    // ── Envoyer email ───────────────────────────────────────────────────────
    if (data.sendEmailFlag && data.parentEmail) {
      try {
        await sendEmail({
          to: data.parentEmail,
          subject: `Convocation ${numero} — ${school.name}`,
          html: buildConvocationEmailHtml(convocation, student, school.name, motifLabel),
          attachments: [{ filename: pdfFilename, content: pdfBuffer, contentType: 'application/pdf' }],
        });
        await prisma.convocation.update({ where: { id: convocation.id }, data: { emailSent: true } });
      } catch (e) {
        console.error('Erreur envoi email convocation:', e);
      }
    }

    // ── Envoyer SMS ─────────────────────────────────────────────────────────
    if (data.sendSMSFlag && data.parentPhone) {
      const cleaned = data.parentPhone.replace(/\s+/g, '');
      try {
        const smsMsg = `EduGoma360: Convocation le ${dateRDV.toLocaleDateString('fr-FR')} à ${data.heureRendezVous}. Motif: ${motifLabel}. Document remis à votre enfant. ${school.name}`;
        await sendSMS({ to: [cleaned], message: smsMsg });
        await prisma.convocation.update({ where: { id: convocation.id }, data: { smsSent: true } });
      } catch (e) {
        console.error('Erreur envoi SMS convocation:', e);
      }
    }

    return { convocation, pdfUrl };
  }

  // ── Lister les convocations ─────────────────────────────────────────────────
  public static async list(schoolId: string, filters: { motif?: string; status?: string; classId?: string; search?: string }) {
    const where: any = { schoolId };
    if (filters.motif) where.motif = filters.motif;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { parentName: { contains: filters.search, mode: 'insensitive' } },
        { student: { nom: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [convocations, total, pending, confirmed, attended, missed] = await Promise.all([
      prisma.convocation.findMany({
        where,
        include: {
          student: {
            select: {
              nom: true, postNom: true, prenom: true,
              enrollments: {
                include: { class: { select: { name: true } } },
                orderBy: { enrolledAt: 'desc' },
                take: 1,
              },
            },
          },
          createdBy: { select: { nom: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.convocation.count({ where: { schoolId } }),
      prisma.convocation.count({ where: { schoolId, status: 'PENDING' } }),
      prisma.convocation.count({ where: { schoolId, status: 'CONFIRMED' } }),
      prisma.convocation.count({ where: { schoolId, status: 'ATTENDED' } }),
      prisma.convocation.count({ where: { schoolId, status: 'MISSED' } }),
    ]);

    return {
      convocations: convocations.map((c) => ({
        ...c,
        className: c.student.enrollments[0]?.class?.name ?? 'N/A',
      })),
      stats: { total, pending, confirmed, attended, missed },
    };
  }

  // ── Mettre à jour le statut ─────────────────────────────────────────────────
  public static async updateStatus(id: string, schoolId: string, body: {
    status: 'CONFIRMED' | 'ATTENDED' | 'MISSED' | 'CANCELLED';
    notes?: string;
    actions?: string[];
  }) {
    const data: any = { status: body.status };
    if (body.status === 'CONFIRMED') data.confirmedAt = new Date();
    if (body.status === 'ATTENDED') data.attendedAt = new Date();
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.actions) data.actions = JSON.stringify(body.actions);

    return prisma.convocation.update({ where: { id, schoolId }, data });
  }

  // ── Rechercher les élèves (pour le formulaire) ──────────────────────────────
  public static async searchStudents(schoolId: string, q: string) {
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: [
          { nom: { contains: q } },
          { postNom: { contains: q } },
          { matricule: { contains: q } },
        ],
      },
      include: {
        enrollments: {
          include: { class: { select: { name: true } } },
          orderBy: { enrolledAt: 'desc' },
          take: 1,
        },
        parentUser: { select: { email: true, phone: true } },
      },
      take: 10,
    });

    return students.map((s) => ({
      id: s.id,
      nom: `${s.nom} ${s.postNom}${s.prenom ? ' ' + s.prenom : ''}`,
      classe: (s as any).enrollments?.[0]?.class?.name ?? 'N/A',
      parents: [
        s.nomPere && { nom: s.nomPere, phone: s.telPere, qualite: 'Père' },
        s.nomMere && { nom: s.nomMere, phone: s.telMere, qualite: 'Mère' },
        s.nomTuteur && { nom: s.nomTuteur, phone: s.telTuteur, qualite: 'Tuteur' },
      ].filter(Boolean),
      parentEmail: (s as any).parentUser?.email ?? null,
    }));
  }

  // ── Envoyer rappels J-3 / J-1 (appelé par le CRON) ─────────────────────────
  public static async sendReminders() {
    const now = new Date();
    const d3 = new Date(now); d3.setDate(d3.getDate() + 3);
    const d1 = new Date(now); d1.setDate(d1.getDate() + 1);
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const d3End = new Date(d3); d3End.setHours(23, 59, 59, 999);
    const d1End = new Date(d1); d1End.setHours(23, 59, 59, 999);
    const d1Start = new Date(d1); d1Start.setHours(0, 0, 0, 0);
    const d3Start = new Date(d3); d3Start.setHours(0, 0, 0, 0);

    const [reminderD3, reminderD1] = await Promise.all([
      prisma.convocation.findMany({
        where: {
          status: 'PENDING',
          reminderD3Sent: false,
          dateRendezVous: { gte: d3Start, lte: d3End },
        },
        include: { school: { select: { name: true } } },
      }),
      prisma.convocation.findMany({
        where: {
          status: 'PENDING',
          reminderD1Sent: false,
          dateRendezVous: { gte: d1Start, lte: d1End },
        },
        include: { school: { select: { name: true } } },
      }),
    ]);

    for (const c of reminderD3) {
      if (c.parentPhone) {
        const msg = `EduGoma360: Rappel - Convocation dans 3 jours le ${c.dateRendezVous.toLocaleDateString('fr-FR')} à ${c.heureRendezVous}. ${c.school.name}`;
        try {
          await sendSMS({ to: [c.parentPhone], message: msg });
          await prisma.convocation.update({ where: { id: c.id }, data: { reminderD3Sent: true } });
        } catch { /* continue */ }
      }
    }

    for (const c of reminderD1) {
      if (c.parentPhone) {
        const msg = `EduGoma360: URGENT - Convocation demain ${c.dateRendezVous.toLocaleDateString('fr-FR')} à ${c.heureRendezVous}. Votre présence est obligatoire. ${c.school.name}`;
        try {
          await sendSMS({ to: [c.parentPhone], message: msg });
          await prisma.convocation.update({ where: { id: c.id }, data: { reminderD1Sent: true } });
        } catch { /* continue */ }
      }
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildConvocationEmailHtml(c: any, student: any, schoolName: string, motifLabel: string): string {
  const numero = escapeHtml(c.numero);
  const parentName = escapeHtml(c.parentName);
  const eleveNom = escapeHtml(`${student.nom} ${student.postNom}`);
  const motif = escapeHtml(motifLabel);
  const date = escapeHtml(new Date(c.dateRendezVous).toLocaleDateString('fr-FR'));
  const heure = escapeHtml(c.heureRendezVous);
  const lieu = escapeHtml(c.lieu);
  const school = escapeHtml(schoolName);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: #1B5E20; color: white; padding: 24px 32px;">
        <h1 style="margin:0; font-size: 22px;">Convocation ${numero}</h1>
        <p style="margin: 6px 0 0; opacity: 0.85;">${school}</p>
      </div>
      <div style="padding: 32px;">
        <p>Cher(e) <strong>${parentName}</strong>,</p>
        <p>Vous êtes convoqué(e) pour :</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:8px; border: 1px solid #eee; font-weight:bold;">Élève</td><td style="padding:8px; border: 1px solid #eee;">${eleveNom}</td></tr>
          <tr><td style="padding:8px; border: 1px solid #eee; font-weight:bold;">Motif</td><td style="padding:8px; border: 1px solid #eee;">${motif}</td></tr>
          <tr><td style="padding:8px; border: 1px solid #eee; font-weight:bold;">Date</td><td style="padding:8px; border: 1px solid #eee;">${date}</td></tr>
          <tr><td style="padding:8px; border: 1px solid #eee; font-weight:bold;">Heure</td><td style="padding:8px; border: 1px solid #eee;">${heure}</td></tr>
          <tr><td style="padding:8px; border: 1px solid #eee; font-weight:bold;">Lieu</td><td style="padding:8px; border: 1px solid #eee;">${lieu}</td></tr>
        </table>
        <p>Votre présence est <strong style="color:#C62828;">OBLIGATOIRE</strong>.</p>
        <p style="color:#555; font-size: 13px;">Le document PDF est en pièce jointe.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888;">${school} — EduGoma 360</div>
    </div>
  `;
}
