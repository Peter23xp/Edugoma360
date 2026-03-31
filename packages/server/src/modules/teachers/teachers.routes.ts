import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { teachersController } from './teachers.controller';
import { upload } from '../../lib/storage';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── GET routes ──────────────────────────────────────────────────────────────
router.get(
    '/stats',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getGlobalStats(req, res, next)
);

router.get(
    '/me/classes',
    (req, res, next) => teachersController.getMyClasses(req, res, next)
);

router.get(
    '/me/subjects',
    (req, res, next) => teachersController.getMySubjects(req, res, next)
);

router.get(
    '/',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getTeachers(req, res, next)
);

router.get(
    '/:id',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getTeacherById(req, res, next)
);

router.get(
    '/:id/stats',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getTeacherStats(req, res, next)
);

router.get(
    '/:id/timetable/pdf',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getTimetablePdf(req, res, next)
);

router.get(
    '/:id/contract',
    requirePermission('teachers:read'),
    (req, res, next) => teachersController.getContractPdf(req, res, next)
);

// ── POST routes ──────────────────────────────────────────────────────────────
router.post(
    '/',
    requirePermission('teachers:create'),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'certificats', maxCount: 10 }
    ]),
    (req, res, next) => teachersController.createTeacher(req, res, next)
);

router.post(
    '/import',
    requirePermission('teachers:create'),
    upload.single('file'),
    (req, res, next) => teachersController.importTeachers(req, res, next)
);

router.post(
    '/:id/assign',
    requirePermission('teachers:update'),
    (req, res, next) => teachersController.assignClasses(req, res, next)
);

router.post(
    '/:id/reset-password',
    requirePermission('teachers:update'),
    (req, res, next) => teachersController.resetPassword(req, res, next)
);

router.post(
    '/:id/archive',
    requirePermission('teachers:update'),
    (req, res, next) => teachersController.archiveTeacher(req, res, next)
);

// ── PUT routes ──────────────────────────────────────────────────────────────
router.put(
    '/:id',
    requirePermission('teachers:update'),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'certificats', maxCount: 10 }
    ]),
    (req, res, next) => teachersController.updateTeacher(req, res, next)
);

// ── DELETE routes ──────────────────────────────────────────────────────────
router.delete(
    '/:id',
    requirePermission('teachers:delete'),
    (req, res, next) => teachersController.archiveTeacher(req, res, next)
);

export default router;
