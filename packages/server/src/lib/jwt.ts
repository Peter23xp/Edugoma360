import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
    userId: string;
    id?: string;         // alias de userId — rempli automatiquement par verifyToken
    schoolId: string;
    role: string;
}

/**
 * Generate an access token
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET as string, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET as string, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): JwtPayload {
    const payload = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtPayload;
    // Ensure `id` is populated for backward-compat with controllers using req.user!.id
    if (!payload.id && payload.userId) {
        payload.id = payload.userId;
    }
    return payload;
}
