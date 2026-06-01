import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.NODE_ENV === 'production' ? 100 : 1000, // Plus permissif en dev
    message: {
        error: {
            code: 'RATE_LIMIT',
            message: 'Trop de requêtes. Réessayez dans quelques minutes.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env.NODE_ENV === 'development' && req.ip === '127.0.0.1', // Skip pour localhost en dev
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.MAX_LOGIN_ATTEMPTS * 3,
    message: {
        error: {
            code: 'AUTH_RATE_LIMIT',
            message: `Trop de tentatives de connexion. Réessayez dans ${env.LOCKOUT_DURATION_MINUTES} minutes.`,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * SMS rate limiter (to avoid excessive costs)
 */
export const smsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: {
        error: {
            code: 'SMS_RATE_LIMIT',
            message: 'Limite d\'envoi de SMS atteinte. Réessayez plus tard.',
        },
    },
});
