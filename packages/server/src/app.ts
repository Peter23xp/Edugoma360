import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { checkSubscription } from './middleware/subscription.middleware';
import { UPLOADS_ROOT } from './lib/uploads';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import studentsRoutes from './modules/students/students.routes';
import classesRoutes from './modules/classes/classes.routes';
import timetableRoutes from './modules/timetable/timetable.routes';
import gradesRoutes from './modules/grades/grades.routes';
import deliberationRoutes from './modules/deliberation/deliberation.routes';
import financeRoutes from './modules/finance/finance.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import teachersRoutes from './modules/teachers/teachers.routes';
import { smsRoutes } from './modules/communication/sms/sms.routes';
import { emailRoutes } from './modules/communication/email/email.routes';
import { convocationsRoutes } from './modules/communication/convocations/convocations.routes';
import { announcementsRoutes } from './modules/communication/announcements/announcements.routes';
import { dashboardRoutes } from './modules/reports/dashboard/dashboard.routes';
import { statsRoutes as reportsStatsRoutes } from './modules/reports/stats/stats.routes';
import { generatorRoutes } from './modules/reports/generator/generator.routes';
import { exportsRoutes } from './modules/reports/exports/exports.routes';
import reportsRoutes from './modules/reports/reports.routes';
import syncRoutes from './modules/sync/sync.routes';
import settingsRoutes from './modules/settings/settings.routes';
import academicYearRoutes from './modules/academic-year/academic-year.routes';
import sectionsRoutes from './modules/sections/sections.routes';
import statsRoutes from './modules/stats/stats.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import bulletinsRoutes from './modules/bulletins/bulletins.routes';
import assignmentsRoutes from './modules/assignments/assignments.routes';
import absencesRoutes from './modules/absences/absences.routes';
import feesRoutes from './modules/fees/fees.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import debtsRoutes from './modules/payments/debts.routes';
import cashSessionsRoutes from './modules/cash-sessions/cash-sessions.routes';
import budgetsRoutes from './modules/budgets/budgets.routes';
import usersRoutes from './modules/users/users.routes';
import materialRoutes from './modules/inventory/material.routes';
import libraryRoutes from './modules/inventory/library.routes';
import roomsRoutes from './modules/inventory/rooms.routes';
import maintenanceRoutes from './modules/inventory/maintenance.routes';
import parentRoutes from './modules/parent/parent.routes';
import profileRoutes from './modules/users/profile.routes';
import disciplineRoutes from './modules/discipline/discipline.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import superAdminRoutes from './modules/superadmin/superadmin.routes';
import { billingRoutes, billingWebhookRoutes } from './modules/billing/billing.routes';
import { handleStripeWebhook } from './modules/billing/billing.controller';
import notificationRoutes from './modules/notifications/notification.routes';
import auditRoutes        from './modules/audit/audit.routes';
import exportRoutes       from './modules/exports/export.routes';
import { startSubscriptionAlertsCron } from './lib/cron/subscription-alerts';

const app = express();

// ── Stripe Webhook — raw body BEFORE express.json() ───────────────────────────
app.post('/api/public/billing/webhook/stripe',
    express.raw({ type: 'application/json' }),
    (req, res, next) => handleStripeWebhook(req, res, next),
);

// â”€â”€ Global Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(helmet());
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// â”€â”€ Static Files (uploads) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/uploads', express.static(UPLOADS_ROOT));

// â”€â”€ Health Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        name: 'EduGoma 360 API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// ── Public & Auth Routes (exempt from tenant + subscription checks) ───────────
// These routes do NOT require a resolved school tenant:
//   • /api/auth/*       → login, OTP, forgot-password
//   • /api/public/*     → landing page data, subscription plans
//   • /api/superadmin/* → platform-level Super Admin dashboard
//   • /api/health       → health check (already registered above)
app.use('/api/auth', authRoutes);

// ── Super Admin Routes (auth required, isSuperAdmin check, NO tenant) ──────────
// Mounted BEFORE tenantMiddleware so Super Admin can access all schools.
// Protected entirely by superAdminGuard (JWT + isSuperAdmin DB check).
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/superadmin/notifications', notificationRoutes);
app.use('/api/superadmin/audit',         auditRoutes);
app.use('/api/superadmin/exports',       exportRoutes);

// ── Fully Public Routes (no tenant, no subscription, no auth) ──────────────
// /api/public/onboarding/register   → create school account
// /api/public/onboarding/check-subdomain → check slug availability
// /api/public/plans                 → list subscription plans
app.use('/api/public', onboardingRoutes);
app.use('/api/public/billing', billingWebhookRoutes);

// ── Tenant Resolution ──────────────────────────────────────────────────────────
// Applied on all /api/* routes that follow this point.
// Reads X-Tenant-Subdomain header → resolves School from DB → sets req.school.
app.use('/api', tenantMiddleware);

// ── Billing Routes (tenant resolved, but exempt from subscription block) ────────
app.use('/api/billing', billingRoutes);

// ── Subscription Gate ──────────────────────────────────────────────────────────
// Blocks access with 403 if the school's subscription is expired.
// Applies to all business routes except subscription renewal endpoints.
app.use('/api', checkSubscription);

// ── Business Routes (all protected by tenant + subscription) ───────────────
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/deliberation', deliberationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/convocations', convocationsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/reports/dashboard', dashboardRoutes);
app.use('/api/reports/statistics', reportsStatsRoutes);
app.use('/api/reports', generatorRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/bulletin', bulletinsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/cash-sessions', cashSessionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inventory/material', materialRoutes);
app.use('/api/inventory/books', libraryRoutes);
app.use('/api/inventory/rooms', roomsRoutes);
app.use('/api/inventory/maintenance', maintenanceRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/discipline', disciplineRoutes);

// â”€â”€ 404 Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use((_req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route non trouvée',
        },
    });
});

// â”€â”€ Error Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(errorHandler);

// ── Start Cron Jobs ───────────────────────────────────────────────────────────
startSubscriptionAlertsCron();

export default app;
