import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { generateToken, generateRefreshToken } from '../../lib/jwt';
import { env } from '../../config/env';
import type { LoginInput, ChangePasswordInput } from './auth.dto';

export class AuthService {
    /**
     * Authenticate user with phone + password
     */
    async login(data: LoginInput) {
        const user = await prisma.user.findFirst({
            where: {
                phone: data.phone,
                isActive: true,
            },
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
            throw new Error('Identifiants invalides');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Identifiants invalides');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const payload = {
            userId: user.id,
            schoolId: user.schoolId,
            role: user.role,
        };

        const token = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const { passwordHash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
            refreshToken,
        };
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

export const authService = new AuthService();
