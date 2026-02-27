import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { assignmentsController } from './assignments.controller';

const router = Router();

// Routes protégées par authentification
router.use(authenticate);

// Gestion des affectations
router.get('/', requirePermission('teachers:read'), (req, res, next) => assignmentsController.getMatrix(req, res, next));
router.post('/', requirePermission('teachers:update'), (req, res, next) => assignmentsController.create(req, res, next));
router.post('/bulk', requirePermission('teachers:update'), (req, res, next) => assignmentsController.bulkAssign(req, res, next));
router.put('/:id', requirePermission('teachers:update'), (req, res, next) => assignmentsController.update(req, res, next));
router.delete('/:id', requirePermission('teachers:delete'), (req, res, next) => assignmentsController.remove(req, res, next));

export default router;
