import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { reportsController } from './reports.controller';

const router = Router();
router.use(authenticate);

router.get('/bulletin/:studentId/:termId', requirePermission('reports:bulletins'), (req, res, next) => reportsController.generateBulletin(req, res, next));
router.get('/palmares/:classId/:termId', requirePermission('reports:palmares'), (req, res, next) => reportsController.generatePalmares(req, res, next));
router.get('/receipt/:paymentId', requirePermission('finance:read'), (req, res, next) => reportsController.generateReceipt(req, res, next));

export default router;
