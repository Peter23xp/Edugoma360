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
    listPlans,
    updatePlan,
    togglePlan,
    listAllSubscriptions,
    listSAAdmins,
    createSAAdmin,
    updateSAAdminPermissions,
    toggleSAAdmin,
} from './superadmin.controller';

const router = Router();
router.use(superAdminGuard);

// ── Metrics ───────────────────────────────────────────────────────────────────
router.get('/metrics', (req, res, next) => getMetrics(req, res, next));

// ── Schools ───────────────────────────────────────────────────────────────────
router.get('/schools',                      (req, res, next) => listSchools(req, res, next));
router.get('/schools/:id',                  (req, res, next) => getSchoolDetail(req, res, next));
router.patch('/schools/:id/subscription',   (req, res, next) => updateSchoolSubscription(req, res, next));
router.patch('/schools/:id/status',         (req, res, next) => updateSchoolStatus(req, res, next));

// ── Subscriptions (vue globale) ───────────────────────────────────────────────
router.get('/subscriptions', (req, res, next) => listAllSubscriptions(req, res, next));

// ── SMS Usage ─────────────────────────────────────────────────────────────────
router.get('/sms-usage', (req, res, next) => getSmsUsage(req, res, next));

// ── Plans ─────────────────────────────────────────────────────────────────────
router.get('/plans',                (req, res, next) => listPlans(req, res, next));
router.post('/plans',               (req, res, next) => managePlan(req, res, next));
router.put('/plans/:id',            (req, res, next) => updatePlan(req, res, next));
router.patch('/plans/:id/toggle',   (req, res, next) => togglePlan(req, res, next));

// ── SA Admins ─────────────────────────────────────────────────────────────────
router.get('/admins',                           (req, res, next) => listSAAdmins(req, res, next));
router.post('/admins',                          (req, res, next) => createSAAdmin(req, res, next));
router.patch('/admins/:id/permissions',         (req, res, next) => updateSAAdminPermissions(req, res, next));
router.patch('/admins/:id/toggle',              (req, res, next) => toggleSAAdmin(req, res, next));

export default router;
