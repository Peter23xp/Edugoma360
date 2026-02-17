import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { teachersController } from './teachers.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('teachers:read'), (req, res, next) => teachersController.getTeachers(req, res, next));
router.post('/', requirePermission('teachers:create'), (req, res, next) => teachersController.createTeacher(req, res, next));
router.put('/:id', requirePermission('teachers:update'), (req, res, next) => teachersController.updateTeacher(req, res, next));
router.post('/:id/assign', requirePermission('teachers:update'), (req, res, next) => teachersController.assignSubject(req, res, next));
router.delete('/:id/assign', requirePermission('teachers:update'), (req, res, next) => teachersController.removeAssignment(req, res, next));

export default router;
