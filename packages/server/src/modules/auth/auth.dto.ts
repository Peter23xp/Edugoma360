import { z } from 'zod';

export const LoginDto = z.object({
    phone: z.string().min(1, 'Numéro de téléphone requis'),
    password: z.string().min(1, 'Mot de passe requis'),
});

export const RefreshTokenDto = z.object({
    refreshToken: z.string().min(1),
});

export const ChangePasswordDto = z.object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
});

export type LoginInput = z.infer<typeof LoginDto>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordDto>;
