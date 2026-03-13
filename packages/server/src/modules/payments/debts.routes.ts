
import { Router } from 'express';
import { debtsController } from './debts.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('finance:read'), (req, res, next) => debtsController.getDebts(req, res, next));
router.post('/send-reminders', requirePermission('finance:manage'), (req, res, next) => debtsController.sendReminders(req, res, next));
router.post('/:studentId/payment-plan', requirePermission('finance:manage'), (req, res, next) => debtsController.createPaymentPlan(req, res, next));

export default router;
