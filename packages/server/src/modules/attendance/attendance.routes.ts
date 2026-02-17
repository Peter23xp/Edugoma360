import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.post('/batch', requirePermission('attendance:create'), (req, res, next) => attendanceController.recordBatch(req, res, next));
router.get('/daily', requirePermission('attendance:read'), (req, res, next) => attendanceController.getDailyAttendance(req, res, next));
router.get('/report/:classId/:termId', requirePermission('attendance:reports'), (req, res, next) => attendanceController.getReport(req, res, next));

export default router;
