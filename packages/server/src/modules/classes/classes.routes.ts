import { Router } from 'express';
import { classesController } from './classes.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// List classes
router.get(
    '/',
    requirePermission('classes:read'),
    (req, res, next) => classesController.getClasses(req, res, next)
);

// Get single class
router.get(
    '/:id',
    requirePermission('classes:read'),
    (req, res, next) => classesController.getClassById(req, res, next)
);

// Create class
router.post(
    '/',
    requirePermission('classes:create'),
    (req, res, next) => classesController.createClass(req, res, next)
);

// Update class
router.patch(
    '/:id',
    requirePermission('classes:update'),
    (req, res, next) => classesController.updateClass(req, res, next)
);

// Archive class
router.delete(
    '/:id',
    requirePermission('classes:delete'),
    (req, res, next) => classesController.archiveClass(req, res, next)
);

// Assign teachers to subjects
router.post(
    '/:id/assign-teachers',
    requirePermission('classes:update'),
    (req, res, next) => classesController.assignTeachers(req, res, next)
);

// Get class assignments
router.get(
    '/:id/assignments',
    requirePermission('classes:read'),
    (req, res, next) => classesController.getClassAssignments(req, res, next)
);

export default router;
