import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { generateToken, generateRefreshToken } from '../../lib/jwt';
import { env } from '../../config/env';
import type { LoginInput, ChangePasswordInput } from './auth.dto';

// ── Regex helpers ────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MATRICULE_REGEX = /^[A-Z]{2}-[A-Z]{3}-[A-Z0-9]+-\d+$/i;

export class AuthService {
    /**
     * Authenticate user with identifier (email / matricule / phone) + password
     */
    async login(data: LoginInput) {
        const { identifier, password, rememberMe } = data;

        // ── Detect identifier type and build Prisma where clause ─────────
        let whereClause: any;
        if (EMAIL_REGEX.test(identifier)) {
            // Email login
            whereClause = { email: identifier, isActive: true };
        } else if (MATRICULE_REGEX.test(identifier)) {
            // Matricule login — look up the student first, then the parent user
            // For now, also try matching phone as a fallback
            whereClause = { phone: identifier, isActive: true };
        } else {
            // Phone number login (legacy / fallback)
            whereClause = { phone: identifier, isActive: true };
        }

        const user = await prisma.user.findFirst({
            where: whereClause,
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        province: true,
                        ville: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AuthError('INVALID_CREDENTIALS', 'Email/matricule ou mot de passe incorrect.');
        }

        // ── Verify password ─────────────────────────────────────────────
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AuthError('INVALID_CREDENTIALS', 'Email/matricule ou mot de passe incorrect.');
        }

        // ── Check lockout (handled at controller level via loginAttempts) ─

        // ── Update last login ───────────────────────────────────────────
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // ── Generate tokens ─────────────────────────────────────────────
        const payload = {
            userId: user.id,
            schoolId: user.schoolId,
            role: user.role,
        };

        const token = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const { passwordHash, ...userWithoutPassword } = user;

        return {
            user: {
                id: userWithoutPassword.id,
                nom: userWithoutPassword.nom,
                postNom: userWithoutPassword.postNom,
                prenom: userWithoutPassword.prenom,
                role: userWithoutPassword.role,
                phone: userWithoutPassword.phone,
                email: userWithoutPassword.email,
                schoolId: userWithoutPassword.schoolId,
                schoolName: userWithoutPassword.school.name,
            },
            token,
            refreshToken,
            rememberMe: rememberMe ?? false,
        };
    }

    /**
     * Refresh an access token
     */
    async refresh(refreshToken: string) {
        try {
            const { verifyToken } = await import('../../lib/jwt');
            const payload = verifyToken(refreshToken);
            const newToken = generateToken({
                userId: payload.userId,
                schoolId: payload.schoolId,
                role: payload.role,
            });
            return { token: newToken, expiresIn: 28800 }; // 8h in seconds
        } catch {
            throw new AuthError('INVALID_TOKEN', 'Token de rafraîchissement invalide ou expiré.');
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        province: true,
                        ville: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Change user password
     */
    async changePassword(userId: string, data: ChangePasswordInput) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Mot de passe actuel incorrect');
        }

        const passwordHash = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { message: 'Mot de passe modifié avec succès' };
    }

    /**
     * Create a new user (admin function)
     */
    async createUser(schoolId: string, data: {
        nom: string;
        postNom: string;
        prenom?: string;
        email?: string;
        phone: string;
        role: string;
        password: string;
    }) {
        const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                schoolId,
                nom: data.nom,
                postNom: data.postNom,
                prenom: data.prenom,
                email: data.email || null,
                phone: data.phone,
                role: data.role as any,
                passwordHash,
            },
        });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

// ── Custom Auth Error ────────────────────────────────────────────────────────
export class AuthError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = 'AuthError';
    }
}

export const authService = new AuthService();
