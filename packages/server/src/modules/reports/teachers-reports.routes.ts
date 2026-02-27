import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { teachersReportsController } from './teachers-reports.controller';

const router = Router();
router.use(authenticate);

// Overview
router.get('/overview', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.getOverview(req, res, next)
);

// Ranking
router.get('/ranking', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.getRanking(req, res, next)
);

// Workload
router.get('/workload', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.getWorkload(req, res, next)
);

// Attendance Heatmap
router.get('/attendance-heatmap', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.getAttendanceHeatmap(req, res, next)
);

// Performance Chart
router.get('/performance-chart', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.getPerformanceChart(req, res, next)
);

// Export
router.get('/export', requirePermission('reports:statistics'), (req, res, next) =>
    teachersReportsController.exportReport(req, res, next)
);

export default router;
