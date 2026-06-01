import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@edugoma360/shared';
import { hasPermission, hasAnyPermission, Permission } from '@edugoma360/shared';

/**
 * Middleware factory to restrict access to specific roles
 * 
 * @param roles - Allowed roles for this route
 * @returns Express middleware
 * 
 * @example
 * router.get('/students', authenticate, requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), getStudents);
 */
export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentification requise',
                },
            });
            return;
        }

        const userRole = req.user.role as UserRole;

        if (!roles.includes(userRole)) {
            res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Accès refusé. Rôle insuffisant.',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Middleware factory to check for specific permissions
 * 
 * @param permissions - Required permissions
 * @returns Express middleware
 * 
 * @example
 * router.post('/grades', authenticate, requirePermission('grades:create'), createGrade);
 */
export function requirePermission(...permissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentification requise',
                },
            });
            return;
        }

        const userRole = req.user.role as UserRole;
        const hasAccess = hasAnyPermission(userRole, permissions);

        if (!hasAccess) {
            res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Permission insuffisante pour cette action.',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Middleware to ensure user operates within their own school (multi-tenant isolation)
 */
export function requireSameSchool(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentification requise',
            },
        });
        return;
    }

    const schoolId = req.params.schoolId || req.body?.schoolId;

    if (schoolId && schoolId !== req.user.schoolId) {
        res.status(403).json({
            error: {
                code: 'FORBIDDEN',
                message: 'Accès refusé. Vous ne pouvez accéder qu\'aux données de votre école.',
            },
        });
        return;
    }

    next();
}

/**
 * Middleware for teacher ownership - ensures teacher can only modify their own grades
 */
export function requireOwnership(resourceType: 'grade' | 'attendance') {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'Authentification requise' },
            });
            return;
        }

        const userRole = req.user.role as UserRole;

        // Admin roles bypass ownership check
        if (['SUPER_ADMIN', 'PREFET'].includes(userRole)) {
            next();
            return;
        }

        // For teachers, check ownership in the service layer
        if (userRole === 'ENSEIGNANT') {
            // Set a flag for the controller/service to check
            (req as any)._requireOwnership = true;
            (req as any)._resourceType = resourceType;
        }

        next();
    };
}
