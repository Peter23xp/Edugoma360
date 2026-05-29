import { Router } from 'express';
import { SMSController } from './sms.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/rbac.middleware';

const router = Router();

// Apply auth middleware to all routes in this module
router.use(authenticate);

// Must have communication permissions or be a secretary
// Mocking permission check for now, you should adjust according to your permission system
// router.use(requirePermission(['SECRETARY', 'ADMIN']));

router.get('/balance', SMSController.getBalance);
router.get('/preview-recipients', SMSController.getPreviewRecipients);
router.post('/send', SMSController.sendCampaign);
router.get('/job/:jobId', SMSController.getCampaignStatus);
router.get('/history', SMSController.getHistory);

export { router as smsRoutes };
