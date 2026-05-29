import prisma from '../../lib/prisma';

export class MaintenanceService {
  async getRequests(schoolId: string, query: { status?: string; urgency?: string; roomId?: string }) {
    const where: any = { schoolId };
    if (query.status) where.status = query.status;
    if (query.urgency) where.urgency = query.urgency;
    if (query.roomId) where.roomId = query.roomId;

    const URGENCY_ORDER: Record<string, number> = { URGENT: 0, NORMAL: 1, LOW: 2 };

    const rawRequests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        room: { select: { name: true } },
        reportedBy: { select: { nom: true, postNom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const requests = rawRequests.sort((a, b) =>
      (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: requests.length,
      urgent: requests.filter((r) => r.urgency === 'URGENT' && r.status !== 'RESOLVED' && r.status !== 'CANCELLED').length,
      inProgress: requests.filter((r) => r.status === 'IN_PROGRESS').length,
      resolvedThisMonth: requests.filter((r) => r.status === 'RESOLVED' && r.resolvedAt && r.resolvedAt >= startOfMonth).length,
    };

    return { requests, stats };
  }

  async createRequest(schoolId: string, userId: string, data: {
    titre: string;
    category: string;
    roomId?: string;
    location?: string;
    urgency: string;
    description: string;
    photoUrl?: string;
    estimatedCost?: number;
  }) {
    const request = await prisma.maintenanceRequest.create({
      data: {
        schoolId,
        titre: data.titre,
        category: data.category,
        roomId: data.roomId,
        location: data.location,
        urgency: data.urgency,
        description: data.description,
        photoUrl: data.photoUrl,
        estimatedCost: data.estimatedCost,
        reportedById: userId,
      },
      include: {
        room: { select: { name: true } },
        reportedBy: { select: { nom: true, postNom: true } },
      },
    });

    return request;
  }

  async updateStatus(schoolId: string, id: string, data: {
    status: string;
    technicien?: string;
    startDate?: string;
    endDate?: string;
    actualCost?: number;
    notes?: string;
    progress?: number;
  }) {
    const request = await prisma.maintenanceRequest.findFirst({ where: { id, schoolId } });
    if (!request) throw new Error('Demande non trouvée');

    const updateData: any = {
      status: data.status,
      technicien: data.technicien,
      actualCost: data.actualCost,
      notes: data.notes,
      progress: data.progress,
    };

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      updateData.progress = 100;
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        room: { select: { name: true } },
        reportedBy: { select: { nom: true, postNom: true } },
      },
    });

    // Auto-update room status for urgent unresolved requests
    if (data.status === 'RESOLVED' && updated.roomId) {
      const pendingUrgent = await prisma.maintenanceRequest.count({
        where: {
          roomId: updated.roomId,
          urgency: 'URGENT',
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });
      if (pendingUrgent === 0) {
        await prisma.room.update({
          where: { id: updated.roomId },
          data: { status: 'GOOD' },
        });
      }
    }

    return updated;
  }

  async getRequest(schoolId: string, id: string) {
    const request = await prisma.maintenanceRequest.findFirst({
      where: { id, schoolId },
      include: {
        room: { select: { name: true, type: true } },
        reportedBy: { select: { nom: true, postNom: true } },
      },
    });
    if (!request) throw new Error('Demande non trouvée');
    return request;
  }

  async checkOverdueRequests(schoolId: string) {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const overdueUrgent = await prisma.maintenanceRequest.findMany({
      where: {
        schoolId,
        status: 'PENDING',
        urgency: 'URGENT',
        createdAt: { lt: twoDaysAgo },
      },
      include: { room: { select: { id: true, name: true } } },
    });

    // Auto-mark rooms as DEGRADED for overdue urgent requests
    for (const req of overdueUrgent) {
      if (req.roomId) {
        await prisma.room.update({
          where: { id: req.roomId },
          data: { status: 'DEGRADED' },
        });
      }
    }

    const overdueNormal = await prisma.maintenanceRequest.findMany({
      where: {
        schoolId,
        status: 'PENDING',
        urgency: 'NORMAL',
        createdAt: { lt: sevenDaysAgo },
      },
    });

    return { overdueUrgent: overdueUrgent.length, overdueNormal: overdueNormal.length };
  }

  async getCostSummary(schoolId: string, year: number, month?: number) {
    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    const endDate = month
      ? new Date(year, month, 0)
      : new Date(year, 11, 31);

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        schoolId,
        status: 'RESOLVED',
        resolvedAt: { gte: startDate, lte: endDate },
      },
      select: { actualCost: true, estimatedCost: true, category: true },
    });

    const totalActual = requests.reduce((s, r) => s + (r.actualCost || 0), 0);
    const totalEstimated = requests.reduce((s, r) => s + (r.estimatedCost || 0), 0);

    const byCategory: Record<string, number> = {};
    for (const r of requests) {
      byCategory[r.category] = (byCategory[r.category] || 0) + (r.actualCost || 0);
    }

    return { totalActual, totalEstimated, byCategory, count: requests.length };
  }
}

export const maintenanceService = new MaintenanceService();
