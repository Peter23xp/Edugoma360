import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

/**
 * Global error handler middleware
 * Format standard: { error: { code, message, field? } }
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    console.error('[ERROR]', err.message);

    // Zod validation errors
    if (err instanceof ZodError) {
        const firstError = err.errors[0];
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: firstError?.message ?? 'Données invalides',
                field: firstError?.path?.join('.'),
            },
        });
        return;
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        res.status(400).json({
            error: {
                code: 'UPLOAD_ERROR',
                message: err.message,
            },
        });
        return;
    }

    // Prisma errors
    if ((err as any).code?.startsWith?.('P')) {
        const prismaCode = (err as any).code;

        switch (prismaCode) {
            case 'P2002':
                res.status(409).json({
                    error: {
                        code: 'DUPLICATE_ENTRY',
                        message: 'Cette entrée existe déjà.',
                        field: (err as any).meta?.target?.[0],
                    },
                });
                return;

            case 'P2025':
                res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ressource introuvable.',
                    },
                });
                return;

            case 'P2003':
                res.status(400).json({
                    error: {
                        code: 'FOREIGN_KEY_ERROR',
                        message: 'Référence invalide. La ressource liée n\'existe pas.',
                    },
                });
                return;

            default:
                res.status(500).json({
                    error: {
                        code: 'DATABASE_ERROR',
                        message: env.isDev ? err.message : 'Erreur de base de données.',
                    },
                });
                return;
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token invalide ou expiré.',
            },
        });
        return;
    }

    // Default error
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: env.isDev ? err.message : 'Erreur interne du serveur.',
        },
    });
}
