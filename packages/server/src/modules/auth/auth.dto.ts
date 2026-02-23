import { z } from 'zod';

// â”€â”€ Login DTO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Accepts either email, phone, or matricule via a single "identifier" field.
export const LoginDto = z.object({
    identifier: z.string().min(4, 'Minimum 4 caractères'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    rememberMe: z.boolean().default(false),
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
