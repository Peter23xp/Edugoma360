import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/students/:studentId/fees-due', requirePermission('finance:read'), (req, res, next) => paymentsController.getStudentFeesDue(req, res, next));
router.get('/', requirePermission('finance:read'), (req, res, next) => paymentsController.getPayments(req, res, next));
router.post('/', requirePermission('finance:create'), (req, res, next) => paymentsController.createPayment(req, res, next));
router.get('/:id/receipt', requirePermission('finance:read'), (req, res, next) => paymentsController.getReceipt(req, res, next));

export default router;
