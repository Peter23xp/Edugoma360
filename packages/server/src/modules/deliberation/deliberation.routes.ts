import { Router } from 'express';
import { deliberationController } from './deliberation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// Get deliberation data (Préfet only)
router.get(
    '/:classId/:termId',
    requirePermission('deliberation:read'),
    (req, res, next) => deliberationController.getDeliberationData(req, res, next)
);

// Validate deliberation (Préfet only)
router.post(
    '/:classId/:termId/validate',
    requirePermission('deliberation:create'),
    (req, res, next) => deliberationController.validateDeliberation(req, res, next)
);

// Get deliberation results
router.get(
    '/results/:deliberationId',
    requirePermission('deliberation:read'),
    (req, res, next) => deliberationController.getDeliberationResults(req, res, next)
);

// Get bulletin job status
router.get(
    '/bulletin-job/:jobId',
    requirePermission('deliberation:read'),
    (req, res, next) => deliberationController.getBulletinJobStatus(req, res, next)
);

export default router;
