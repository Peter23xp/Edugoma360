import prisma from '../../lib/prisma';
import { FEE_TEMPLATES } from '@edugoma360/shared';

export class FeesService {
  /**
   * Get all fees for a school + academic year, with stats
   */
  async getFees(schoolId: string, filters: {
    academicYearId?: string;
    scope?: string;
    type?: string;
  }) {
    let academicYearId = filters.academicYearId;

    if (!academicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      });
      academicYearId = activeYear?.id;
    }

    const where: any = { schoolId, isActive: true, deletedAt: null };
    if (academicYearId) where.academicYearId = academicYearId;
    if (filters.scope) where.scope = filters.scope;
    if (filters.type) where.type = filters.type;

    const fees = await prisma.feeType.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    // Calculate stats
    const total = fees.length;
    let totalAnnualAmount = 0;
    const byType: Record<string, number> = {};

    for (const fee of fees) {
      const freq = fee.frequency || 'ANNUAL';
      let annualAmount = fee.amount;

      switch (freq) {
        case 'MONTHLY':
          annualAmount = fee.amount * 9;
          break;
        case 'TRIMESTRAL':
          annualAmount = fee.amount * 3;
          break;
      }

      totalAnnualAmount += annualAmount;
      byType[fee.type || 'AUTRE'] = (byType[fee.type || 'AUTRE'] || 0) + 1;
    }

    // Parse JSON fields for client
    const feesWithParsed = fees.map((f: any) => ({
      ...f,
      sectionIds: safeJsonParse(f.sectionIds),
      classIds: safeJsonParse(f.classIds),
      months: safeJsonParse(f.months),
    }));

    return {
      fees: feesWithParsed,
      stats: {
        total,
        totalAmount: totalAnnualAmount,
        byType,
      },
    };
  }

  /**
   * Create a new fee
   */
  async createFee(schoolId: string, data: any) {
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });
    if (!academicYear) throw new Error('Aucune année académique active');

    return prisma.feeType.create({
      data: {
        schoolId,
        academicYearId: academicYear.id,
        type: data.type || 'AUTRE',
        name: data.label || data.name,
        amount: data.amount,
        scope: data.scope || 'SCHOOL',
        sectionIds: JSON.stringify(data.sectionIds || []),
        classIds: JSON.stringify(data.classIds || []),
        frequency: data.frequency || 'ANNUAL',
        months: JSON.stringify(data.months || []),
        isRequired: data.required ?? true,
        observations: data.observations || null,
        isActive: true,
      },
    });
  }

  /**
   * Update an existing fee
   */
  async updateFee(id: string, schoolId: string, data: any) {
    const fee = await prisma.feeType.findFirst({ where: { id, schoolId } });
    if (!fee) throw new Error('Frais non trouvé');

    // Check if payments exist for this fee
    const paymentCount = await prisma.feePayment.count({ where: { feeId: id } });
    if (paymentCount > 0) {
      throw new Error(
        `Impossible de modifier ce frais : ${paymentCount} paiement(s) déjà enregistré(s). Archivez ce frais et créez-en un nouveau.`
      );
    }

    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.label !== undefined || data.name !== undefined) updateData.name = data.label || data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.sectionIds !== undefined) updateData.sectionIds = JSON.stringify(data.sectionIds);
    if (data.classIds !== undefined) updateData.classIds = JSON.stringify(data.classIds);
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.months !== undefined) updateData.months = JSON.stringify(data.months);
    if (data.required !== undefined) updateData.isRequired = data.required;
    if (data.observations !== undefined) updateData.observations = data.observations;

    const updated = await prisma.feeType.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      sectionIds: safeJsonParse(updated.sectionIds),
      classIds: safeJsonParse(updated.classIds),
      months: safeJsonParse(updated.months),
    };
  }

  /**
   * Archive (soft-delete) a fee
   */
  async archiveFee(id: string, schoolId: string) {
    const fee = await prisma.feeType.findFirst({ where: { id, schoolId } });
    if (!fee) throw new Error('Frais non trouvé');

    return prisma.feeType.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  /**
   * Delete a fee (only if no payments exist)
   */
  async deleteFee(id: string, schoolId: string) {
    const fee = await prisma.feeType.findFirst({ where: { id, schoolId } });
    if (!fee) throw new Error('Frais non trouvé');

    const paymentCount = await prisma.feePayment.count({ where: { feeId: id } });
    if (paymentCount > 0) {
      throw new Error(
        'Impossible de supprimer ce frais : des paiements y sont liés. Utilisez l\'archivage.'
      );
    }

    await prisma.feeType.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Create fees from a template
   */
  async createFromTemplate(schoolId: string, templateName: string) {
    const template = FEE_TEMPLATES.find((t) => t.name === templateName);
    if (!template) throw new Error(`Template "${templateName}" non trouvé`);

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });
    if (!academicYear) throw new Error('Aucune année académique active');

    // Default months for monthly fees: Sept(9) to June(6)
    const monthlyMonths = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

    const created = [];
    for (const fee of template.fees) {
      const months = fee.frequency === 'MONTHLY'
        ? monthlyMonths
        : fee.frequency === 'TRIMESTRAL'
          ? [12, 3, 6]
          : [];

      const record = await prisma.feeType.create({
        data: {
          schoolId,
          academicYearId: academicYear.id,
          type: fee.type,
          name: fee.label,
          amount: fee.amount,
          scope: fee.scope || 'SCHOOL',
          sectionIds: '[]',
          classIds: '[]',
          frequency: fee.frequency,
          months: JSON.stringify(months),
          isRequired: fee.required,
          isActive: true,
        },
      });
      created.push(record);
    }

    return { fees: created, count: created.length };
  }

  /**
   * Calculate all applicable fees for a student
   */
  async calculateStudentFees(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { class: { include: { section: true } } },
          where: { academicYear: { isActive: true } },
          take: 1,
        },
      },
    });

    if (!student) throw new Error('Élève non trouvé');
    const enrollment = student.enrollments[0];
    if (!enrollment) throw new Error("Aucune inscription pour l'année en cours");

    const classId = enrollment.classId;
    const sectionId = enrollment.class.sectionId;

    const allFees = await prisma.feeType.findMany({
      where: {
        schoolId: student.schoolId,
        academicYearId: enrollment.academicYearId,
        isActive: true,
        deletedAt: null,
      },
    });

    // Filter fees applicable to this student
    const applicableFees = allFees.filter((fee: any) => {
      const scope = fee.scope || 'SCHOOL';
      if (scope === 'SCHOOL') return true;
      if (scope === 'SECTION') {
        const ids = safeJsonParse(fee.sectionIds);
        return ids.includes(sectionId);
      }
      if (scope === 'CLASS') {
        const ids = safeJsonParse(fee.classIds);
        return ids.includes(classId);
      }
      return false;
    });

    // Calculate total
    let totalAnnual = 0;
    for (const fee of applicableFees) {
      const freq = fee.frequency || 'ANNUAL';
      switch (freq) {
        case 'MONTHLY':
          totalAnnual += fee.amount * 9;
          break;
        case 'TRIMESTRAL':
          totalAnnual += fee.amount * 3;
          break;
        default:
          totalAnnual += fee.amount;
          break;
      }
    }

    return {
      fees: applicableFees.map((f: any) => ({
        ...f,
        sectionIds: safeJsonParse(f.sectionIds),
        classIds: safeJsonParse(f.classIds),
        months: safeJsonParse(f.months),
      })),
      totalAnnual,
    };
  }
}

function safeJsonParse(value: string | null | undefined): any[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export const feesService = new FeesService();
