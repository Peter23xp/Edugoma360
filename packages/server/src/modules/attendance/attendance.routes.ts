import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

// ── Legacy ────────────────────────────────────────────────────────────────────
router.post('/batch', requirePermission('attendance:create'), (req, res, next) =>
    attendanceController.recordBatch(req, res, next)
);

// ── Daily Roll Call (GET students list + existing statuses) ───────────────────
router.get('/daily', requirePermission('attendance:read'), (req, res, next) =>
    attendanceController.getDailyAttendance(req, res, next)
);

// ── Daily Roll Call (POST full batch save) ────────────────────────────────────
router.post('/daily', requirePermission('attendance:create'), (req, res, next) =>
    attendanceController.saveDailyRollCall(req, res, next)
);

// ── Stats & Reports ───────────────────────────────────────────────────────────
router.get('/today-rate', (req, res, next) =>
    attendanceController.getTodayRate(req, res, next)
);
router.get('/report/:classId/:termId', requirePermission('attendance:reports'), (req, res, next) =>
    attendanceController.getReport(req, res, next)
);

// ── Absence History & Justificatifs (SCR-029 & SCR-030) ───────────────────
router.get('/absences', requirePermission('attendance:read'), (req, res, next) =>
    attendanceController.getAbsenceHistory(req, res, next)
);

router.get('/reports/stats', requirePermission('attendance:read'), (req, res, next) =>
    attendanceController.getReportStats(req, res, next)
);

router.get('/student/:studentId/stats', requirePermission('attendance:read'), (req, res, next) =>
    attendanceController.getStudentStats(req, res, next)
);

router.get('/justifications', requirePermission('attendance:read'), (req, res, next) =>
    attendanceController.getJustifications(req, res, next)
);

router.put('/justifications/:id/approve', requirePermission('attendance:update'), (req, res, next) =>
    attendanceController.approveJustification(req, res, next)
);

router.put('/justifications/:id/reject', requirePermission('attendance:update'), (req, res, next) =>
    attendanceController.rejectJustification(req, res, next)
);

export default router;
