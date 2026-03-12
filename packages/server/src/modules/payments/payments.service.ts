import prisma from '../../lib/prisma';
import fs from 'fs';
import path from 'path';
import { generateReceiptNumber } from '@edugoma360/shared';
import { generatePdf } from '../../lib/pdf';

export class PaymentsService {
  async getStudentFeesDue(studentId: string, schoolId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, schoolId },
      include: {
        enrollments: {
          where: { academicYear: { isActive: true } },
          include: { class: true },
          take: 1
        }
      }
    });

    if (!student) throw new Error('Élève non trouvé');

    const enrollment = student.enrollments[0];
    if (!enrollment) throw new Error('Aucune inscription active');

    const academicYearId = enrollment.academicYearId;

    // Get all applicable fee types
    const feeTypes = await prisma.feeType.findMany({
      where: { schoolId, academicYearId, isActive: true },
    });

    // Here we should filter by scope... (assuming it's done for simplicity or using the same logic as fees.service.ts)
    // Simplify for SCR-022 snippet
    
    // Get past payments
    const payments = await prisma.payment.findMany({
      where: { studentId, schoolId, academicYearId },
      include: { feePayments: true }
    });

    // Maps total paid per fee
    const paidPerFee = new Map<string, number>();
    for (const p of payments) {
      for (const fp of p.feePayments) {
        paidPerFee.set(fp.feeId, (paidPerFee.get(fp.feeId) || 0) + fp.amountPaid);
      }
    }

    const fees = feeTypes.map(ft => {
      const amountPaid = paidPerFee.get(ft.id) || 0;
      const remainingBalance = ft.amount - amountPaid;
      
      let status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE' = 'UNPAID';
      if (remainingBalance <= 0) status = 'PAID';
      else if (amountPaid > 0) status = 'PARTIAL';
      // Basic due date logic
      const dueDate = new Date(); // To refine

      return {
        feeId: ft.id,
        name: ft.name,
        amountDue: ft.amount,
        amountPaid,
        remainingBalance: Math.max(0, remainingBalance),
        dueDate: dueDate.toISOString(),
        status
      };
    });

    const totalDue = fees.reduce((sum, f) => sum + f.amountDue, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
    const totalRemaining = totalDue - totalPaid;

    return { fees, totalDue, totalPaid, totalRemaining };
  }

  async createPayment(schoolId: string, cashierId: string, dto: any) {
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true }
    });
    if (!academicYear) throw new Error('Année académique non trouvée');

    const lastPayment = await prisma.payment.findFirst({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    });

    const year = new Date().getFullYear();
    const lastSeq = lastPayment?.receiptNumber ? parseInt(lastPayment.receiptNumber.split('-').pop() ?? '0', 10) : 0;
    const receiptNumber = generateReceiptNumber('ITG001', year, lastSeq + 1); // Adapt prefix

    let remainingToDistribute = dto.amountPaid;
    let totalDueForSelection = 0;
    const feePaymentsData = [];

    // Prioritize older/required fees first - for simplicity here we just iterate
    for (const feeId of dto.feeIds) {
      if (remainingToDistribute <= 0) break;

      const fee = await prisma.feeType.findUnique({ where: { id: feeId } });
      if (!fee) continue;

      // check how much is already paid
      const pastPayments = await prisma.feePayment.findMany({ where: { payment: { studentId: dto.studentId }, feeId } });
      const alreadyPaid = pastPayments.reduce((sum, fp) => sum + fp.amountPaid, 0);
      const feeRemaining = fee.amount - alreadyPaid;

      if (feeRemaining <= 0) continue;

      const toPay = Math.min(feeRemaining, remainingToDistribute);
      
      feePaymentsData.push({
        feeId,
        amountDue: fee.amount,
        amountPaid: toPay
      });

      remainingToDistribute -= toPay;
      totalDueForSelection += fee.amount;
    }

    const newPayment = await prisma.payment.create({
      data: {
        schoolId,
        academicYearId: academicYear.id,
        receiptNumber,
        studentId: dto.studentId,
        totalDue: totalDueForSelection,
        amountPaid: dto.amountPaid,
        remainingBalance: Math.max(0, totalDueForSelection - dto.amountPaid), // Simplified remaining
        currency: 'FC',
        paymentMethod: dto.paymentMethod,
        transactionRef: dto.transactionRef,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        cashierId,
        observations: dto.observations,
        feePayments: {
          create: feePaymentsData
        }
      },
      include: {
        student: { select: { nom: true, postNom: true, matricule: true } },
        feePayments: { include: { fee: { select: { name: true, amount: true } } } },
        school: true
      }
    });

    return { payment: newPayment, receiptNumber };
  }
}

export const paymentsService = new PaymentsService();
