import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

// GET /api/superadmin/notifications
export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId   = req.user?.userId;
        const unread   = req.query.unread === 'true';
        const page     = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit    = Math.min(100, parseInt(req.query.limit as string) || 30);
        const skip     = (page - 1) * limit;

        const where: any = { userId };
        if (unread) where.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        res.json({ data: notifications, meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount } });
    } catch (error) { next(error); }
}

// GET /api/superadmin/notifications/count
export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.userId;
        const count  = await prisma.notification.count({ where: { userId, isRead: false } });
        res.json({ count });
    } catch (error) { next(error); }
}

// PATCH /api/superadmin/notifications/:id/read
export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id }  = req.params;
        const userId  = req.user?.userId;
        await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { next(error); }
}

// PATCH /api/superadmin/notifications/read-all
export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.userId;
        await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { next(error); }
}

// DELETE /api/superadmin/notifications/:id
export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id }  = req.params;
        const userId  = req.user?.userId;
        await prisma.notification.deleteMany({ where: { id, userId } });
        res.json({ success: true });
    } catch (error) { next(error); }
}
