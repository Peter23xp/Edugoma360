import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { smsLimiter } from '../../middleware/rateLimit.middleware';
import { smsController } from './sms.controller';

const router = Router();
router.use(authenticate);

router.post('/send', requirePermission('sms:send'), smsLimiter, (req, res, next) => smsController.sendSms(req, res, next));
router.post('/bulk', requirePermission('sms:send'), smsLimiter, (req, res, next) => smsController.sendBulk(req, res, next));
router.get('/logs', requirePermission('sms:read'), (req, res, next) => smsController.getLogs(req, res, next));

export default router;
