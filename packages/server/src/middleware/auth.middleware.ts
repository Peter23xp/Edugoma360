import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import prisma from '../lib/prisma';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { schoolId: string };
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT from Authorization header or httpOnly cookie
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        let token: string | undefined;

        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        // Check httpOnly cookie as fallback
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Token d\'authentification manquant',
                },
            });
            return;
        }

        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token invalide ou expiré',
            },
        });
    }
}

/**
 * Optional authentication - doesn't fail if no token present
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            req.user = verifyToken(token);
        } else if (req.cookies?.token) {
            req.user = verifyToken(req.cookies.token);
        }
    } catch {
        // Silently ignore invalid tokens for optional auth
    }
    next();
}
