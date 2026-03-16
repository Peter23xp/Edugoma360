import { Router } from 'express';
import { budgetsController } from './budgets.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/:academicYearId', requirePermission('finance:read'), (req, res, next) => budgetsController.getBudget(req, res, next));
router.get('/', requirePermission('finance:read'), (req, res, next) => budgetsController.getBudget(req, res, next));
router.post('/', requirePermission('finance:manage'), (req, res, next) => budgetsController.upsertBudget(req, res, next));

export default router;
