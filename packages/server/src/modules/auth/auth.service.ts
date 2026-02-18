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

    /**
     * Send OTP for password reset
     */
    async sendOtp(phone: string) {
        // Validate phone format
        const PHONE_REGEX = /^\+243(81|82|97|98|89)\d{7}$/;
        if (!PHONE_REGEX.test(phone)) {
            throw new AuthError('INVALID_PHONE', 'Numéro de téléphone invalide');
        }

        // Check if user exists
        const user = await prisma.user.findFirst({
            where: { phone, isActive: true },
        });

        if (!user) {
            throw new AuthError('PHONE_NOT_FOUND', 'Aucun compte trouvé avec ce numéro');
        }

        // Generate 6-digit OTP
        const crypto = await import('crypto');
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash OTP before storing
        const otpHash = await bcrypt.hash(otp, 10);

        // Store OTP in database (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.otpToken.create({
            data: {
                phone,
                otpHash,
                expiresAt,
                used: false,
            },
        });

        // Send SMS via Africa's Talking
        try {
            const smsService = await import('../sms/sms.service');
            const message = `EduGoma360: Votre code de réinitialisation est ${otp}. Valable 10 minutes.`;
            
            await smsService.smsService.sendAndLog(user.schoolId, phone, message, 'fr');
        } catch (error) {
            console.error('SMS sending failed:', error);
            // Continue even if SMS fails (for development)
        }

        // Mask phone number for response
        const maskedPhone = phone.replace(/(\+243)(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2X XXX XXX');

        return {
            success: true,
            expiresIn: 600,
            maskedPhone,
        };
    }

    /**
     * Verify OTP and generate reset token
     */
    async verifyOtp(phone: string, otp: string) {
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            throw new AuthError('INVALID_OTP', 'Code incorrect');
        }

        // Find the latest unused OTP for this phone
        const otpToken = await prisma.otpToken.findFirst({
            where: {
                phone,
                used: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!otpToken) {
            throw new AuthError('INVALID_OTP', 'Code incorrect');
        }

        // Check if expired
        if (otpToken.expiresAt < new Date()) {
            throw new AuthError('OTP_EXPIRED', 'Code expiré. Demandez-en un nouveau.');
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, otpToken.otpHash);
        if (!isValid) {
            throw new AuthError('INVALID_OTP', 'Code incorrect');
        }

        // Mark OTP as used
        await prisma.otpToken.update({
            where: { id: otpToken.id },
            data: { used: true },
        });

        // Generate reset token (valid for 10 minutes)
        const jwt = await import('jsonwebtoken');
        const resetToken = jwt.sign(
            { phone, purpose: 'reset' },
            env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        return {
            success: true,
            resetToken,
        };
    }

    /**
     * Reset password using reset token
     */
    async resetPassword(resetToken: string, newPassword: string) {
        // Verify reset token
        let payload: any;
        try {
            const jwt = await import('jsonwebtoken');
            payload = jwt.verify(resetToken, env.JWT_SECRET);
            
            if (payload.purpose !== 'reset') {
                throw new Error('Invalid token purpose');
            }
        } catch {
            throw new AuthError('INVALID_RESET_TOKEN', 'Session expirée');
        }

        // Validate password strength
        if (newPassword.length < 8) {
            throw new AuthError('WEAK_PASSWORD', 'Le mot de passe doit contenir au moins 8 caractères');
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { phone: payload.phone, isActive: true },
        });

        if (!user) {
            throw new AuthError('USER_NOT_FOUND', 'Utilisateur non trouvé');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        return {
            success: true,
            message: 'Mot de passe modifié avec succès',
        };
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
