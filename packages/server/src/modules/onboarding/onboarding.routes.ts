import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import {
    RegisterSchoolController,
    CheckSubdomainController,
    GetPlansController,
} from './onboarding.controller';

// ── Public Onboarding Router ──────────────────────────────────────────────────
// All routes here are PUBLIC — no tenantMiddleware, no checkSubscription,
// no authenticate required. They are mounted at /api/public in app.ts.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// POST /api/public/onboarding/register
// Creates a new school account with admin user + initial subscription.
// Rate-limited to prevent abuse (same limiter as login).
router.post(
    '/onboarding/register',
    authLimiter,
    (req, res, next) => RegisterSchoolController(req, res, next),
);

// GET /api/public/onboarding/check-subdomain?slug=xxx
// Checks availability of a subdomain slug and returns a suggestion if taken.
router.get(
    '/onboarding/check-subdomain',
    (req, res, next) => CheckSubdomainController(req, res, next),
);

// GET /api/public/plans
// Returns all active subscription plans for the pricing page.
router.get(
    '/plans',
    (req, res, next) => GetPlansController(req, res, next),
);

export default router;
