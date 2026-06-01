import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';

// ── Super Admin Guard ─────────────────────────────────────────────────────────
// Replaces tenantMiddleware for /api/superadmin/* routes.
// Verifies:
//   1. JWT is valid (via authenticate)
//   2. User.isSuperAdmin === true in the database
//
// Usage in routes:
//   router.use(superAdminGuard);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * superAdminGuard
 *
 * Express middleware that chains JWT auth + platform-level super admin check.
 * Injects req.isSuperAdmin = true on success.
 */
export async function superAdminGuard(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // Step 1: Verify JWT (synchronous — calls next() internally on success)
    await new Promise<void>((resolve) => {
        authenticate(req, res, () => resolve());
    });

    // If authenticate called res.status().json() without calling next, the
    // response is already sent — stop here.
    if (res.headersSent) return;

    // Step 2: Verify isSuperAdmin flag in DB (live check — no caching)
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' },
        });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isSuperAdmin: true, isActive: true },
    });

    if (!user || !user.isActive || !user.isSuperAdmin) {
        res.status(403).json({
            error: {
                code: 'FORBIDDEN_SUPER_ADMIN',
                message:
                    'Accès refusé. Cette section est réservée aux administrateurs de la plateforme.',
            },
        });
        return;
    }

    req.isSuperAdmin = true;
    next();
}
