import { Router } from 'express';
import { initiatePayment, getPaymentStatus, getPaymentHistory, handleFlexPayWebhook, getBillingInfo } from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const protectedRouter = Router();
const publicRouter = Router();

// ── Protected Billing Routes ──────────────────────────────────────────────────
// Protected by JWT authenticate + role validation (PREFET and ECONOME allowed).
protectedRouter.use(authenticate);
protectedRouter.use(requireRole('SUPER_ADMIN', 'PREFET', 'ECONOME'));

protectedRouter.post('/initiate', initiatePayment);
protectedRouter.get('/status/:orderNum', getPaymentStatus);
protectedRouter.get('/history', getPaymentHistory);
protectedRouter.get('/info', getBillingInfo);

// ── Public Webhook Routes ─────────────────────────────────────────────────────
// Completely public, bypasses auth and tenant validation.
publicRouter.post('/webhook/flexpay', handleFlexPayWebhook);

export { protectedRouter as billingRoutes, publicRouter as billingWebhookRoutes };
