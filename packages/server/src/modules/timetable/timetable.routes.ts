import { Router } from 'express';
import { timetableController } from './timetable.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// Get teacher timetable
router.get(
    '/teacher/:teacherId',
    requirePermission('timetable:read'),
    (req, res, next) => timetableController.getTeacherTimetable(req, res, next)
);

// Get class timetable
router.get(
    '/class/:classId',
    requirePermission('timetable:read'),
    (req, res, next) => timetableController.getClassTimetable(req, res, next)
);

// Create period
router.post(
    '/',
    requirePermission('timetable:create'),
    (req, res, next) => timetableController.createPeriod(req, res, next)
);

// Delete period
router.delete(
    '/:id',
    requirePermission('timetable:delete'),
    (req, res, next) => timetableController.deletePeriod(req, res, next)
);

export default router;
