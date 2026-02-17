import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: {
            code: 'RATE_LIMIT',
            message: 'Trop de requêtes. Réessayez dans quelques minutes.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
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
