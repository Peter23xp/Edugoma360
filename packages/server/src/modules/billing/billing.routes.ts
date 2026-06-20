import { Router } from 'express';
import {
    initiatePayment, getPaymentStatus, getPaymentHistory,
    handleFlexPayWebhook, getBillingInfo,
    createStripeCheckout, getStripeStatus, handleStripeWebhook,
} from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const protectedRouter = Router();
const publicRouter = Router();

// ── Protected Billing Routes ──────────────────────────────────────────────────
protectedRouter.use(authenticate);
protectedRouter.use(requireRole('SUPER_ADMIN', 'PREFET', 'ECONOME'));

// FlexPay Mobile Money
protectedRouter.post('/initiate',             initiatePayment);
protectedRouter.get('/status/:orderNum',      getPaymentStatus);
protectedRouter.get('/history',               getPaymentHistory);
protectedRouter.get('/info',                  getBillingInfo);

// Stripe Card
protectedRouter.post('/stripe/checkout',      createStripeCheckout);
protectedRouter.get('/stripe/status/:sessionId', getStripeStatus);

// ── Public Webhook Routes ─────────────────────────────────────────────────────
publicRouter.post('/webhook/flexpay', handleFlexPayWebhook);

// Stripe webhook requires raw body — mounted via express.raw() in app.ts
publicRouter.post('/webhook/stripe', handleStripeWebhook);

export { protectedRouter as billingRoutes, publicRouter as billingWebhookRoutes };
