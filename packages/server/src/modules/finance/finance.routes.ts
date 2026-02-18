import { Router } from 'express';
import { financeController } from './finance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('finance:read'), (req, res, next) => financeController.getPayments(req, res, next));
router.post('/', requirePermission('finance:create'), (req, res, next) => financeController.createPayment(req, res, next));
router.get('/balance/:studentId', requirePermission('finance:read'), (req, res, next) => financeController.getStudentBalance(req, res, next));
router.get('/debts', requirePermission('finance:reports'), (req, res, next) => financeController.getDebts(req, res, next));
router.get('/monthly-summary', (req, res, next) => financeController.getMonthlySummary(req, res, next));
router.get('/recovery-chart', (req, res, next) => financeController.getRecoveryChart(req, res, next));

export default router;
