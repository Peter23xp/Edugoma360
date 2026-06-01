import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// ── Subscription Middleware ───────────────────────────────────────────────────
// Verifies that the current tenant (req.school) has a valid, non-expired
// subscription (status ACTIVE, TRIAL, or PENDING while payment/setup is ongoing).
//
// Must be applied AFTER tenantMiddleware.
// Exempted routes: subscription renewal, onboarding, superadmin.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * checkSubscription
 *
 * - Reads req.school (set by tenantMiddleware)
 * - Finds the latest valid subscription for this school
 * - Returns 403 { expired: true } if no valid subscription found
 * - Adds X-Quota-Warning header if student quota is near or exceeded
 * - Injects req.subscription for downstream controllers
 */
export async function checkSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.school) {
            // tenantMiddleware must run before this
            res.status(500).json({
                error: {
                    code: 'MIDDLEWARE_ORDER_ERROR',
                    message: 'tenantMiddleware doit s\'exécuter avant checkSubscription.',
                },
            });
            return;
        }

        const schoolId = req.school.id;
        const now = new Date();

        // 1. Retrieve the most recently created usable subscription.
        // PENDING is allowed so a newly configured school can finish setup and billing.
        const subscription = await prisma.subscription.findFirst({
            where: {
                schoolId,
                status: { in: ['ACTIVE', 'TRIAL', 'PENDING'] },
                endDate: { gte: now },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!subscription) {
            res.status(403).json({
                expired: true,
                error: {
                    code: 'SUBSCRIPTION_EXPIRED',
                    message:
                        'Abonnement expiré — veuillez renouveler pour continuer.',
                },
            });
            return;
        }

        // 2. Inject subscription into request context
        req.subscription = subscription;

        // 3. Quota check — warn if student limit exceeded or near limit
        //    (non-blocking: only adds a response header)
        const plan = (req.school as any).plan as {
            maxStudents: number;
            maxTeachers: number;
            maxSmsPerMonth: number;
        } | null;

        if (plan && plan.maxStudents !== -1) {
            // Efficient count — avoids fetching all students
            const studentCount = await prisma.student.count({
                where: { schoolId, isActive: true },
            });

            if (studentCount >= plan.maxStudents) {
                res.setHeader('X-Quota-Warning', 'students');
            } else if (studentCount >= Math.floor(plan.maxStudents * 0.9)) {
                // Warn at 90% usage
                res.setHeader('X-Quota-Warning', 'students-near-limit');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * checkStudentQuota
 *
 * Standalone guard used specifically on student CREATION routes.
 * Blocks the creation with 403 if the school has reached its max student quota.
 * Must run AFTER checkSubscription (req.subscription must be set).
 */
export async function checkStudentQuota(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const plan = (req.school as any)?.plan as { maxStudents: number } | null;

        // -1 = unlimited
        if (!plan || plan.maxStudents === -1) {
            next();
            return;
        }

        const schoolId = req.school!.id;
        const studentCount = await prisma.student.count({
            where: { schoolId, isActive: true },
        });

        if (studentCount >= plan.maxStudents) {
            res.status(403).json({
                quotaExceeded: true,
                error: {
                    code: 'STUDENT_QUOTA_EXCEEDED',
                    message: `Quota atteint : votre plan autorise ${plan.maxStudents} élèves actifs. Passez à un plan supérieur.`,
                    limit: plan.maxStudents,
                    current: studentCount,
                },
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}
