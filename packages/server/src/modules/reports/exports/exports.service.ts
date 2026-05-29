import prisma from '../../../lib/prisma';
import { generateReportExcel } from '../../../lib/excel/reportExcelGenerator';
import { generateReportPDF } from '../../../lib/pdf/reportPdfGenerator';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

const PRIMARY = 'FF1B5E20';

interface QuickExportBody {
  type: string;
  filters?: { sectionId?: string; classId?: string; status?: string };
  columns?: string[];
  format: 'EXCEL' | 'CSV' | 'PDF' | 'ZIP';
  filename: string;
}

export class ExportsService {

  public static async quickExport(body: QuickExportBody, schoolId: string, userId: string) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'exports');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { nom: true, postNom: true, role: true } });
    if (!school || !user) throw new Error('Données manquantes');

    let fileUrl = '';
    let fileSize = 0;

    switch (body.type) {
      case 'STUDENTS': {
        const buf = await this.exportStudents(schoolId, body.filters ?? {}, body.columns ?? [], body.format, school);
        const fname = `${body.filename || 'eleves'}.xlsx`;
        const p = path.join(uploadsDir, fname);
        fs.writeFileSync(p, buf);
        fileSize = fs.statSync(p).size;
        fileUrl = `/uploads/exports/${fname}`;
        break;
      }
      case 'FINANCE': {
        const buf = await this.exportFinance(schoolId, school);
        const fname = `${body.filename || 'finance'}.xlsx`;
        const p = path.join(uploadsDir, fname);
        fs.writeFileSync(p, buf);
        fileSize = fs.statSync(p).size;
        fileUrl = `/uploads/exports/${fname}`;
        break;
      }
      case 'TEACHERS': {
        const buf = await this.exportTeachers(schoolId, school);
        const fname = `${body.filename || 'enseignants'}.xlsx`;
        const p = path.join(uploadsDir, fname);
        fs.writeFileSync(p, buf);
        fileSize = fs.statSync(p).size;
        fileUrl = `/uploads/exports/${fname}`;
        break;
      }
      case 'PRESENCE': {
        const data = await this.collectPresenceData(schoolId);
        const buf = await generateReportPDF({ type: 'PRESENCE', name: 'Rapport Présences', school, generatedBy: user, options: { includeLogo: true, includeSignature: false, includePageNumbers: true } }, data);
        const fname = `${body.filename || 'presences'}.pdf`;
        const p = path.join(uploadsDir, fname);
        fs.writeFileSync(p, buf);
        fileSize = fs.statSync(p).size;
        fileUrl = `/uploads/exports/${fname}`;
        break;
      }
      default:
        throw new Error(`Type d'export non supporté: ${body.type}`);
    }

    // Enregistrer dans l'historique
    await prisma.exportHistory.create({
      data: {
        schoolId,
        type: body.type,
        filename: path.basename(fileUrl),
        format: body.format,
        fileSize,
        fileUrl,
        filters: JSON.stringify(body.filters ?? {}),
        generatedById: userId,
      },
    });

    return { fileUrl };
  }

  public static async getHistory(schoolId: string) {
    return prisma.exportHistory.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { generatedBy: { select: { nom: true, role: true } } },
    });
  }

  public static async getSchedules(schoolId: string) {
    return prisma.exportSchedule.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { nom: true } } },
    });
  }

  public static async createSchedule(body: any, schoolId: string, userId: string) {
    const next = this.calcNextRun(body.frequency, body.dayOfMonth, body.dayOfWeek, body.time);
    return prisma.exportSchedule.create({
      data: {
        schoolId,
        type: body.type,
        frequency: body.frequency,
        dayOfMonth: body.dayOfMonth,
        dayOfWeek: body.dayOfWeek,
        time: body.time,
        format: body.format,
        recipients: JSON.stringify(body.recipients ?? []),
        nextRunAt: next,
        createdById: userId,
      },
    });
  }

  public static async deleteSchedule(id: string, schoolId: string) {
    return prisma.exportSchedule.delete({ where: { id, schoolId } });
  }

  // ── Helpers export ──────────────────────────────────────────────────────────
  private static async exportStudents(schoolId: string, filters: any, columns: string[], format: string, school: any): Promise<Buffer> {
    const students = await prisma.student.findMany({
      where: { schoolId, isActive: true, ...(filters.classId ? { enrollments: { some: { classId: filters.classId } } } : {}) },
      include: { enrollments: { include: { class: { include: { section: true } } }, take: 1 } },
      orderBy: [{ nom: 'asc' }],
      take: 2000,
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Élèves');
    ws.mergeCells('A1:J1');
    const t = ws.getCell('A1');
    t.value = `${school.nomCourt ?? school.name} — LISTE DES ÉLÈVES`;
    t.font = { bold: true, size: 14, color: { argb: PRIMARY } };
    t.alignment = { horizontal: 'center' };
    ws.addRow([]);
    const hdr = ws.addRow(['#', 'Matricule', 'Nom', 'Postnom', 'Prénom', 'Sexe', 'Classe', 'Section', 'Tel. Tuteur', 'Statut']);
    hdr.eachCell(cell => { cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }; });
    ws.columns = [5, 14, 20, 20, 15, 8, 12, 15, 16, 10].map(w => ({ width: w }));

    students.forEach((s: any, i: number) => {
      const enr = s.enrollments?.[0];
      ws.addRow([i + 1, s.matricule, s.nom, s.postNom, s.prenom ?? '', s.sexe, enr?.class?.name ?? '—', enr?.class?.section?.name ?? '—', s.telPere ?? s.telMere ?? '—', s.isActive ? 'Actif' : 'Inactif']);
    });

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  private static async exportFinance(schoolId: string, school: any): Promise<Buffer> {
    const year = await prisma.academicYear.findFirst({ where: { schoolId, isActive: true } });
    const [students, payments, feeTypes] = await Promise.all([
      prisma.student.findMany({ where: { schoolId, isActive: true }, include: { enrollments: { include: { class: { select: { name: true } } }, take: 1 } }, take: 2000 }),
      year ? prisma.payment.findMany({ where: { schoolId, academicYearId: year.id }, select: { studentId: true, amountPaid: true } }) : Promise.resolve([]),
      prisma.feeType.findMany({ where: { schoolId, isActive: true }, select: { amount: true } }),
    ]);
    const data = { students, payments, feeTypes, grades: [], attendances: [] };
    return generateReportExcel({ type: 'FINANCE', name: 'Bilan Finance', school, generatedBy: { nom: '', role: '' }, options: {} }, data);
  }

  private static async exportTeachers(schoolId: string, school: any): Promise<Buffer> {
    const teachers = await prisma.teacher.findMany({
      where: { schoolId, isActive: true },
      include: { assignments: { include: { subject: { select: { name: true } }, class: { select: { name: true } } } } },
    });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Enseignants');
    ws.mergeCells('A1:G1');
    const t = ws.getCell('A1');
    t.value = `${school.nomCourt ?? school.name} — LISTE DES ENSEIGNANTS`;
    t.font = { bold: true, size: 14, color: { argb: PRIMARY } };
    t.alignment = { horizontal: 'center' };
    ws.addRow([]);
    const hdr = ws.addRow(['#', 'Matricule', 'Nom complet', 'Téléphone', 'Email', 'Matières', 'Statut']);
    hdr.eachCell(cell => { cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }; });
    ws.columns = [5, 14, 25, 16, 25, 30, 10].map(w => ({ width: w }));
    teachers.forEach((t: any, i: number) => {
      const subjects = [...new Set(t.assignments.map((a: any) => a.subject.name))].join(', ');
      ws.addRow([i + 1, t.matricule, `${t.nom} ${t.postNom}`, t.telephone ?? '—', t.email ?? '—', subjects || '—', t.statut]);
    });
    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  private static async collectPresenceData(schoolId: string) {
    const [students, attendances] = await Promise.all([
      prisma.student.findMany({ where: { schoolId, isActive: true }, include: { enrollments: { include: { class: { select: { name: true } } }, take: 1 } }, take: 500 }),
      prisma.attendance.groupBy({ by: ['studentId', 'status'], where: { class: { schoolId } }, _count: true }),
    ]);
    return { students, attendances, grades: [], payments: [], feeTypes: [] };
  }

  private static calcNextRun(frequency: string, dayOfMonth?: number, dayOfWeek?: number, time = '08:00'): Date {
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (frequency === 'MONTHLY') {
      next.setDate(dayOfMonth ?? 1);
      if (next <= now) next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'WEEKLY') {
      const target = dayOfWeek ?? 1;
      const diff = (target - next.getDay() + 7) % 7 || 7;
      next.setDate(next.getDate() + diff);
    } else {
      next.setMonth(next.getMonth() + 3);
    }
    return next;
  }
}
