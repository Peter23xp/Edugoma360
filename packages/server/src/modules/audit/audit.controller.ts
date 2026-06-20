import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

// GET /api/superadmin/audit
export async function listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page     = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit    = Math.min(200, parseInt(req.query.limit as string) || 50);
        const skip     = (page - 1) * limit;
        const search   = (req.query.search as string)?.trim() || '';
        const action   = req.query.action as string | undefined;
        const schoolId = req.query.schoolId as string | undefined;
        const actorId  = req.query.actorId as string | undefined;
        const from     = req.query.from as string | undefined;
        const to       = req.query.to as string | undefined;

        const where: any = {};
        if (action && action !== 'ALL')   where.action   = action;
        if (schoolId) where.schoolId = schoolId;
        if (actorId)  where.actorId  = actorId;
        if (search)   where.summary  = { contains: search };
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to)   where.createdAt.lte = new Date(to);
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
            prisma.auditLog.count({ where }),
        ]);

        res.json({ data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
}

// GET /api/superadmin/audit/recent  (last 20 — for live feed polling)
export async function getRecentLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const since = req.query.since as string | undefined;
        const where: any = since ? { createdAt: { gt: new Date(since) } } : {};
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json({ data: logs });
    } catch (error) { next(error); }
}

// GET /api/superadmin/audit/stats  (action counts for charts)
export async function getAuditStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const since = new Date(Date.now() - days * 86400000);

        const [byAction, byDay, topActors] = await Promise.all([
            prisma.auditLog.groupBy({
                by: ['action'],
                _count: { _all: true },
                where: { createdAt: { gte: since } },
                orderBy: { _count: { action: 'desc' } },
            }),
            prisma.$queryRaw<{ day: string; count: number }[]>`
                SELECT date(createdAt) as day, COUNT(*) as count
                FROM audit_logs
                WHERE createdAt >= ${since.toISOString()}
                GROUP BY day ORDER BY day ASC
            `,
            prisma.auditLog.groupBy({
                by: ['actorId', 'actorName'],
                _count: { _all: true },
                where: { createdAt: { gte: since }, actorId: { not: null } },
                orderBy: { _count: { actorId: 'desc' } },
                take: 5,
            }),
        ]);

        res.json({
            data: {
                byAction: byAction.map(r => ({ action: r.action, count: r._count._all })),
                byDay,
                topActors: topActors.map(r => ({ actorId: r.actorId, actorName: r.actorName, count: r._count._all })),
            },
        });
    } catch (error) { next(error); }
}
