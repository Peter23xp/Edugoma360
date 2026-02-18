import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
    userId: string;
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
    return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtPayload;
}
