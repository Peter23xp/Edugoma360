import { Router } from 'express';
import { gradesController } from './grades.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// Get grades
router.get(
    '/',
    requirePermission('grades:read'),
    (req, res, next) => gradesController.getGrades(req, res, next)
);

// Create or update single grade
router.post(
    '/',
    requirePermission('grades:create'),
    (req, res, next) => gradesController.upsertGrade(req, res, next)
);

// Batch create/update grades
router.post(
    '/batch',
    requirePermission('grades:create'),
    (req, res, next) => gradesController.batchUpsertGrades(req, res, next)
);

// Lock grades
router.post(
    '/lock',
    requirePermission('grades:create'),
    (req, res, next) => gradesController.lockGrades(req, res, next)
);

// Unlock grades (Préfet only)
router.post(
    '/unlock',
    requirePermission('grades:update'),
    (req, res, next) => gradesController.unlockGrades(req, res, next)
);

// Batch sync from offline
router.post(
    '/batch-sync',
    requirePermission('grades:create'),
    (req, res, next) => gradesController.batchSync(req, res, next)
);

// Get averages
router.get(
    '/averages',
    requirePermission('grades:read'),
    (req, res, next) => gradesController.getAverages(req, res, next)
);

// Calculate averages
router.post(
    '/calculate-averages',
    requirePermission('grades:create'),
    (req, res, next) => gradesController.calculateAverages(req, res, next)
);

// Validate averages
router.post(
    '/validate-averages',
    requirePermission('grades:update'),
    (req, res, next) => gradesController.validateAverages(req, res, next)
);

// Get class grades matrix
router.get(
    '/class/:classId/matrix',
    requirePermission('grades:read'),
    (req, res, next) => gradesController.getClassMatrix(req, res, next)
);

export default router;
