import { Router } from 'express';
import { superAdminGuard } from '../superadmin/superadmin.guard';
import {
    listNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from './notification.controller';

const router = Router();
router.use(superAdminGuard);

router.get('/',              listNotifications);
router.get('/count',         getUnreadCount);
router.patch('/read-all',    markAllAsRead);
router.patch('/:id/read',    markAsRead);
router.delete('/:id',        deleteNotification);

export default router;
