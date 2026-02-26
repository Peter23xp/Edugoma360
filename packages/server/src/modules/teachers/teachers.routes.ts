import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { teachersController } from './teachers.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Gestion des enseignants
router.get('/', requirePermission('teachers:read'), (req, res, next) => teachersController.getTeachers(req, res, next));
router.get('/:id', requirePermission('teachers:read'), (req, res, next) => teachersController.getTeacherById(req, res, next));

router.post('/', requirePermission('teachers:create'), (req, res, next) => teachersController.createTeacher(req, res, next));
router.put('/:id', requirePermission('teachers:update'), (req, res, next) => teachersController.updateTeacher(req, res, next));
router.delete('/:id', requirePermission('teachers:delete'), (req, res, next) => teachersController.archiveTeacher(req, res, next));
router.post('/:id/archive', requirePermission('teachers:update'), (req, res, next) => teachersController.archiveTeacher(req, res, next));

export default router;
