import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { bulletinsController } from './bulletins.controller';

const router = Router();

// All bulletin routes require authentication
router.use(authenticate);

/**
 * POST /api/bulletin/batch
 * Trigger batch bulletin generation for an entire class
 * Body: { classId: string, termId: string }
 * ⚠️ Must be declared BEFORE /:studentId/:termId to avoid Express routing conflicts
 */
router.post(
    '/batch',
    requirePermission('reports:bulletins'),
    (req, res, next) => bulletinsController.createBatchJob(req, res, next),
);

/**
 * GET /api/bulletin/batch/:jobId
 * Poll the status of a bulletin batch generation job
 * ⚠️ Must be declared BEFORE /:studentId/:termId to avoid 'batch' being matched as studentId
 */
router.get(
    '/batch/:jobId',
    requirePermission('reports:bulletins'),
    (req, res, next) => bulletinsController.getBatchJobStatus(req, res, next),
);

/**
 * GET /api/bulletin/:studentId/:termId
 * Generate and stream a single student bulletin PDF
 */
router.get(
    '/:studentId/:termId',
    requirePermission('reports:bulletins'),
    (req, res, next) => bulletinsController.generateBulletin(req, res, next),
);

export default router;
