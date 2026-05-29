import prisma from '../../../lib/prisma';

interface CreateAnnouncementBody {
  priority: 'INFO' | 'URGENT' | 'CRITIQUE';
  titre: string;
  message: string;
  audience: string[];
  classIds?: string[];
  startDate: string;
  endDate: string;
  isPinned: boolean;
}

export class AnnouncementsService {

  // Statut calculé à la lecture — pas de CRON nécessaire
  private static computeStatus(startDate: Date, endDate: Date): 'ACTIVE' | 'SCHEDULED' | 'ARCHIVED' {
    const now = new Date();
    if (endDate < now) return 'ARCHIVED';
    if (startDate > now) return 'SCHEDULED';
    return 'ACTIVE';
  }

  public static async list(schoolId: string, filters: { priority?: string; status?: string; audience?: string }) {
    const now = new Date();
    const where: any = { schoolId };

    // Filtre de statut basé sur les dates
    if (filters.status === 'ACTIVE') {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (filters.status === 'SCHEDULED') {
      where.startDate = { gt: now };
    } else if (filters.status === 'ARCHIVED') {
      where.endDate = { lt: now };
    }

    if (filters.priority) where.priority = filters.priority;

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        views: { select: { id: true } },
        createdBy: { select: { nom: true, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { startDate: 'desc' }],
      take: 100,
    });

    const enriched = announcements.map((a) => ({
      ...a,
      audience: JSON.parse(a.audience),
      classIds: JSON.parse(a.classIds),
      status: this.computeStatus(a.startDate, a.endDate),
      viewCount: a.views.length,
    }));

    const all = await prisma.announcement.findMany({ where: { schoolId }, select: { startDate: true, endDate: true } });
    const stats = all.reduce(
      (acc, a) => {
        const s = this.computeStatus(a.startDate, a.endDate);
        acc.total++;
        if (s === 'ACTIVE') acc.active++;
        else if (s === 'SCHEDULED') acc.scheduled++;
        else acc.archived++;
        return acc;
      },
      { total: 0, active: 0, scheduled: 0, archived: 0 },
    );

    return { announcements: enriched, stats };
  }

  // Annonces actives pour le dashboard (les 5 plus récentes/prioritaires)
  public static async getActive(schoolId: string) {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { startDate: 'desc' }],
      take: 5,
      include: { views: { select: { userId: true } } },
    });

    return announcements.map((a) => ({
      ...a,
      audience: JSON.parse(a.audience),
      classIds: JSON.parse(a.classIds),
      status: 'ACTIVE' as const,
      viewCount: a.views.length,
    }));
  }

  public static async create(data: CreateAnnouncementBody, schoolId: string, createdById: string) {
    return prisma.announcement.create({
      data: {
        schoolId,
        priority: data.priority,
        titre: data.titre,
        message: data.message,
        audience: JSON.stringify(data.audience),
        classIds: JSON.stringify(data.classIds ?? []),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isPinned: data.isPinned,
        sendPush: false,
        createdById,
      },
    });
  }

  public static async update(id: string, schoolId: string, data: Partial<CreateAnnouncementBody>) {
    const updateData: any = { ...data };
    if (data.audience) updateData.audience = JSON.stringify(data.audience);
    if (data.classIds) updateData.classIds = JSON.stringify(data.classIds);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    return prisma.announcement.update({ where: { id, schoolId }, data: updateData });
  }

  public static async archive(id: string, schoolId: string) {
    // Archiver = mettre endDate dans le passé
    return prisma.announcement.update({
      where: { id, schoolId },
      data: { endDate: new Date(Date.now() - 1000) },
    });
  }

  public static async recordView(id: string, userId: string) {
    try {
      await prisma.announcementView.create({ data: { announcementId: id, userId } });
    } catch {
      // UniqueConstraint = déjà vu, on ignore
    }
    const count = await prisma.announcementView.count({ where: { announcementId: id } });
    return { viewCount: count };
  }
}
