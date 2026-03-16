import { Router } from 'express';
import { cashSessionsController } from './cash-sessions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.post('/open', requirePermission('finance:create'), (req, res, next) => cashSessionsController.openSession(req, res, next));
router.get('/current', requirePermission('finance:read'), (req, res, next) => cashSessionsController.getCurrentSession(req, res, next));
router.get('/history', requirePermission('finance:read'), (req, res, next) => cashSessionsController.getSessions(req, res, next));
router.post('/:id/expense', requirePermission('finance:create'), (req, res, next) => cashSessionsController.recordExpense(req, res, next));
router.post('/:id/close', requirePermission('finance:create'), (req, res, next) => cashSessionsController.closeSession(req, res, next));

export default router;
