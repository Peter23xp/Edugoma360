import { PrismaClient, CashSession, CashMovement } from '@prisma/client';
import { ApiError } from '../../middleware/errorHandler.middleware';

const prisma = new PrismaClient();

export class CashSessionsService {
  async openSession(data: {
    schoolId: string;
    cashierId: string;
    date: Date;
    openingBalance: number;
    observations?: string;
  }) {
    const existingSession = await prisma.cashSession.findFirst({
      where: {
        schoolId: data.schoolId,
        cashierId: data.cashierId,
        status: 'OPEN'
      }
    });

    if (existingSession) {
      throw new ApiError('Une session de caisse est déjà ouverte pour ce jour', 400);
    }

    const session = await prisma.cashSession.create({
      data: {
        schoolId: data.schoolId,
        cashierId: data.cashierId,
        date: data.date,
        openingBalance: data.openingBalance,
        totalReceived: 0,
        totalSpent: 0,
        theoreticalBalance: data.openingBalance,
        status: 'OPEN',
        movements: {
          create: {
            type: 'IN',
            category: 'OPENING',
            amount: data.openingBalance,
            balance: data.openingBalance,
            description: data.observations || 'Ouverture de caisse'
          }
        }
      },
      include: { movements: true }
    });

    return session;
  }

  async getCurrentSession(schoolId: string, cashierId: string) {
    const session = await prisma.cashSession.findFirst({
      where: { schoolId, cashierId, status: 'OPEN' },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!session) {
      throw new ApiError('Aucune session de caisse ouverte', 404);
    }
    return session;
  }

  async recordExpense(sessionId: string, data: {
    type: string;
    amount: number;
    beneficiary: string;
    motif: string;
    receiptFile?: string;
    cashierId: string;
  }) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.status !== 'OPEN') {
      throw new ApiError('Session introuvable ou fermée', 404);
    }
    
    if (session.cashierId !== data.cashierId) {
       throw new ApiError("Non autorisé", 403);
    }

    const moveReference = `DEP-${Math.floor(Date.now() / 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const newTheoretical = session.theoreticalBalance - data.amount;
      const newTotalSpent = session.totalSpent + data.amount;

      await tx.cashSession.update({
        where: { id: sessionId },
        data: {
          theoreticalBalance: newTheoretical,
          totalSpent: newTotalSpent
        }
      });

      const movement = await tx.cashMovement.create({
        data: {
          sessionId,
          type: 'OUT',
          category: 'EXPENSE',
          amount: data.amount,
          balance: newTheoretical,
          reference: moveReference,
          description: `${data.motif} (Bénéficiaire: ${data.beneficiary})`,
          receiptUrl: data.receiptFile
        }
      });

      return movement;
    });

    return result;
  }

  async closeSession(sessionId: string, data: {
    actualBalance: number;
    denominations: Record<string, number>;
    discrepancyReason?: string;
    discrepancyDetails?: string;
    cashierId: string;
  }) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { movements: true }
    });

    if (!session || session.status !== 'OPEN') {
      throw new ApiError('Session introuvable ou déjà fermée', 404);
    }

    if (session.cashierId !== data.cashierId) {
       throw new ApiError("Non autorisé", 403);
    }

    const discrepancy = data.actualBalance - session.theoreticalBalance;
    const requiresValidation = Math.abs(discrepancy) > 1000;

    const newStatus = requiresValidation ? 'CLOSED' : 'VALIDATED'; // Pour l'instant

    const result = await prisma.$transaction(async (tx) => {
      let finalBalance = session.theoreticalBalance;

      if (discrepancy !== 0) {
        await tx.cashMovement.create({
          data: {
            sessionId,
            type: discrepancy > 0 ? 'IN' : 'OUT',
            category: 'CLOSING',
            amount: Math.abs(discrepancy),
            balance: data.actualBalance,
            description: `Régularisation d'écart (${data.discrepancyReason}): ${data.discrepancyDetails}`
          }
        });
        finalBalance = data.actualBalance;
      }

      const updatedSession = await tx.cashSession.update({
        where: { id: sessionId },
        data: {
          actualBalance: data.actualBalance,
          discrepancy: discrepancy,
          status: newStatus,
          closedAt: new Date()
        }
      });

      return { session: updatedSession, discrepancy, requiresValidation };
    });

    return result;
  }
}

export const cashSessionsService = new CashSessionsService();
