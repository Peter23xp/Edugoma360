import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { verifyToken } from '../lib/jwt';

// ── Tenant Middleware ─────────────────────────────────────────────────────────
// Resolves the school (tenant) from:
//   1. X-Tenant-Subdomain request header  (preferred — sent by React client)
//   2. The authenticated JWT's schoolId        (fallback for persisted sessions)
//   3. The hostname's first subdomain segment  (fallback for direct API calls)
//
// Routes exempted: /api/auth/*, /api/public/*, /api/superadmin/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the first subdomain from a hostname string.
 * "mungano.edugoma360.cd" → "mungano"
 * "localhost" or "edugoma360.cd" → null
 */
function extractSubdomain(hostname: string): string | null {
    // Strip port if present (localhost:3000)
    const host = hostname.split(':')[0];
    const parts = host.split('.');

    // Need at least 3 parts: subdomain.domain.tld
    if (parts.length >= 3) {
        return parts[0];
    }
    return null;
}

function extractSchoolIdFromToken(req: Request): string | null {
    try {
        let token: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) return null;
        const payload = verifyToken(token);
        return payload.isSuperAdmin ? null : payload.schoolId ?? null;
    } catch {
        return null;
    }
}

/**
 * tenantMiddleware
 *
 * Injects `req.school` with the full School record for the resolved tenant.
 * Must be applied before any route handler that needs school-scoped data.
 */
export async function tenantMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // 1. Read from explicit header (sent by React app)
        let subdomain =
            (req.headers['x-tenant-subdomain'] as string | undefined)?.trim().toLowerCase() ||
            null;

        // 2. Fallback: resolve from authenticated schoolId.
        const schoolIdFromToken = subdomain ? null : extractSchoolIdFromToken(req);

        // 3. Fallback: extract from hostname
        if (!subdomain && !schoolIdFromToken) {
            subdomain = extractSubdomain(req.hostname);
        }

        if (!subdomain && !schoolIdFromToken) {
            res.status(400).json({
                error: {
                    code: 'TENANT_MISSING',
                    message:
                        'Identifiant de l\'institution manquant. ' +
                        'Envoyez le header X-Tenant-Subdomain ou reconnectez-vous.',
                },
            });
            return;
        }

        // 3. Load school with its current plan (for quota checks)
        const school = await prisma.school.findFirst({
            where: subdomain ? { subdomain } : { id: schoolIdFromToken! },
            include: { plan: true },
        });

        if (!school || !school.isActive) {
            res.status(404).json({
                error: {
                    code: 'TENANT_NOT_FOUND',
                    message: 'Institution introuvable sur cette plateforme.',
                },
            });
            return;
        }

        // 4. Inject school into request context
        req.school = school as any; // cast needed because include adds `plan`

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * requireSchoolId
 *
 * Helper used inside route handlers to safely retrieve the current tenant's
 * school ID. Throws a 401-style error if the tenant was not resolved
 * (e.g., middleware was bypassed accidentally).
 *
 * Usage in a controller:
 *   const schoolId = requireSchoolId(req);
 *   const students = await prisma.student.findMany({ where: { schoolId } });
 */
export function requireSchoolId(req: Request): string {
    if (!req.school?.id) {
        throw Object.assign(new Error('Tenant non résolu — accès refusé.'), {
            statusCode: 401,
            code: 'TENANT_UNRESOLVED',
        });
    }
    return req.school.id;
}
