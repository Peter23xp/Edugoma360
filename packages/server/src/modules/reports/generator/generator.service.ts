import prisma from '../../../lib/prisma';
import { generateReportPDF } from '../../../lib/pdf/reportPdfGenerator';
import { generateReportExcel } from '../../../lib/excel/reportExcelGenerator';
import path from 'path';
import fs from 'fs';

interface GenerateReportBody {
  type: string;
  period: { termId?: string; startDate?: string; endDate?: string };
  filters: { sectionIds?: string[]; classIds?: string[] };
  options: { includeLogo: boolean; includeSignature: boolean; includePageNumbers: boolean };
  format: 'PDF' | 'EXCEL' | 'BOTH';
  name: string;
  saveTemplate: boolean;
}

export class GeneratorService {

  public static async generate(body: GenerateReportBody, schoolId: string, userId: string) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { nom: true, postNom: true, role: true } });
    if (!school || !user) throw new Error('École ou utilisateur introuvable');

    const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const data = await this.collectData(body, schoolId);
    const config = { type: body.type, period: body.period, filters: body.filters, options: body.options, school, generatedBy: user, name: body.name };

    let pdfUrl: string | undefined;
    let excelUrl: string | undefined;
    const slug = `${body.type}_${Date.now()}`;

    if (body.format === 'PDF' || body.format === 'BOTH') {
      const pdfBuf = await generateReportPDF(config, data);
      const filename = `${slug}.pdf`;
      fs.writeFileSync(path.join(uploadsDir, filename), pdfBuf);
      pdfUrl = `/uploads/reports/${filename}`;
    }

    if (body.format === 'EXCEL' || body.format === 'BOTH') {
      const xlsBuf = await generateReportExcel(config, data);
      const filename = `${slug}.xlsx`;
      fs.writeFileSync(path.join(uploadsDir, filename), xlsBuf);
      excelUrl = `/uploads/reports/${filename}`;
    }

    if (body.saveTemplate) {
      await prisma.savedReport.create({
        data: {
          schoolId,
          name: body.name,
          type: body.type,
          filters: JSON.stringify(body.filters),
          options: JSON.stringify(body.options),
          pdfUrl,
          excelUrl,
          generatedById: userId,
        },
      });
    }

    return { pdfUrl, excelUrl, name: body.name };
  }

  public static async getSaved(schoolId: string) {
    return prisma.savedReport.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: { generatedBy: { select: { nom: true, role: true } } },
    });
  }

  public static async deleteSaved(id: string, schoolId: string) {
    return prisma.savedReport.delete({ where: { id, schoolId } });
  }

  private static async collectData(body: GenerateReportBody, schoolId: string) {
    const year = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
      include: { terms: true },
    });

    const termIds = body.period.termId ? [body.period.termId] : (year?.terms.map((t: any) => t.id) ?? []);
    const classIds = body.filters.classIds ?? [];

    const [students, grades, payments, feeTypes, attendances] = await Promise.all([
      prisma.student.findMany({
        where: {
          schoolId, isActive: true,
          ...(classIds.length > 0 ? { enrollments: { some: { classId: { in: classIds } } } } : {}),
        },
        include: {
          enrollments: {
            where: year ? { academicYearId: year.id } : {},
            include: { class: { select: { name: true } } },
            take: 1,
          },
        },
        take: 500,
      }),
      prisma.grade.findMany({
        where: { termId: { in: termIds }, student: { schoolId } },
        include: { subject: { select: { name: true } } },
        take: 5000,
      }),
      prisma.payment.findMany({
        where: { schoolId, ...(year ? { academicYearId: year.id } : {}) },
        select: { amountPaid: true, studentId: true, paymentDate: true },
      }),
      prisma.feeType.findMany({ where: { schoolId, isActive: true }, select: { amount: true, name: true } }),
      prisma.attendance.groupBy({
        by: ['studentId', 'status'],
        where: { class: { schoolId }, ...(termIds.length ? { termId: { in: termIds } } : {}) },
        _count: true,
      }),
    ]);

    return { students, grades, payments, feeTypes, attendances, year };
  }
}
