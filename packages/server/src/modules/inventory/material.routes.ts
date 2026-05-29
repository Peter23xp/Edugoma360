import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { materialController } from './material.controller';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), (req, res, next) => materialController.getItems(req, res, next));
router.post('/', requireRole('SUPER_ADMIN', 'PREFET'), (req, res, next) => materialController.createItem(req, res, next));
router.put('/:id', requireRole('SUPER_ADMIN', 'PREFET'), (req, res, next) => materialController.updateItem(req, res, next));
router.delete('/:id', requireRole('SUPER_ADMIN', 'PREFET'), (req, res, next) => materialController.deleteItem(req, res, next));
router.post('/:id/movement', requireRole('SUPER_ADMIN', 'PREFET'), (req, res, next) => materialController.createMovement(req, res, next));
router.get('/:id/movements', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), (req, res, next) => materialController.getMovements(req, res, next));

export default router;
