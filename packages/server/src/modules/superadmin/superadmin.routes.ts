import { Router } from 'express';
import { superAdminGuard } from './superadmin.guard';
import {
    getMetrics,
    listSchools,
    getSchoolDetail,
    updateSchoolSubscription,
    updateSchoolStatus,
    getSmsUsage,
    managePlan,
} from './superadmin.controller';

// ── Super Admin Router ────────────────────────────────────────────────────────
// All routes here require:
//   1. Valid JWT (Bearer token)
//   2. User.isSuperAdmin === true (verified live in DB)
//
// Mounted at /api/superadmin in app.ts — BEFORE tenantMiddleware.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// Apply super admin guard to ALL routes in this router
router.use(superAdminGuard);

// ── Platform Metrics ──────────────────────────────────────────────────────────
// GET /api/superadmin/metrics
// Returns total schools, active, trial, expired counts + MRR + SMS usage
router.get('/metrics', (req, res, next) => getMetrics(req, res, next));

// ── Schools Management ────────────────────────────────────────────────────────
// GET /api/superadmin/schools?page=1&limit=10&search=mungano&status=ACTIVE
router.get('/schools', (req, res, next) => listSchools(req, res, next));

// GET /api/superadmin/schools/:id
router.get('/schools/:id', (req, res, next) => getSchoolDetail(req, res, next));

// PATCH /api/superadmin/schools/:id/subscription
// Body: { planId?, startDate, endDate, status, notes?, amountPaid, currency }
router.patch('/schools/:id/subscription', (req, res, next) => updateSchoolSubscription(req, res, next));

// PATCH /api/superadmin/schools/:id/status
// Body: { status: 'ACTIVE'|'SUSPENDED'|'ARCHIVED', reason? }
router.patch('/schools/:id/status', (req, res, next) => updateSchoolStatus(req, res, next));

// ── SMS Usage ─────────────────────────────────────────────────────────────────
// GET /api/superadmin/sms-usage
// Returns SMS consumption grouped by school for current month
router.get('/sms-usage', (req, res, next) => getSmsUsage(req, res, next));

// ── Plans Management ─────────────────────────────────────────────────────────
// POST /api/superadmin/plans
// Body: { name, slug, priceUSD, priceCDF, maxStudents, maxTeachers, ... }
router.post('/plans', (req, res, next) => managePlan(req, res, next));

export default router;
