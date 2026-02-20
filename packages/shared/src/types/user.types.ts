import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type UserRole =
    | 'SUPER_ADMIN'
    | 'PREFET'
    | 'ECONOME'
    | 'SECRETAIRE'
    | 'ENSEIGNANT'
    | 'PARENT';

// NOTE: SchoolType, School, AcademicYear, Class, Section are defined in school.types.ts

// ── Teacher ───────────────────────────────────────────────────────────────────
export type TeacherStatus = 'MECHANISE' | 'NON_PAYE' | 'NOUVELLE_UNITE' | 'VACATAIRE';

export interface Teacher {
    id: string;
    schoolId: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    matriculeMepst?: string | null;
    diplome?: string | null;
    phone?: string | null;
    statut: TeacherStatus;
    isActive: boolean;
}


// ── User Interface ────────────────────────────────────────────────────────────
export interface User {
    id: string;
    schoolId: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    email?: string | null;
    phone: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ── Auth Response ─────────────────────────────────────────────────────────────
export interface AuthUser extends Omit<User, 'updatedAt'> {
    school: {
        id: string;
        name: string;
        province: string;
        ville: string;
    };
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
    refreshToken?: string;
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
    phone: z.string().min(1, 'Numéro de téléphone requis'),
    password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    postNom: z.string().min(2, 'Le post-nom doit contenir au moins 2 caractères'),
    prenom: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    phone: z.string().regex(/^\+243\d{9}$/, 'Format: +243XXXXXXXXX'),
    role: z.enum(['SUPER_ADMIN', 'PREFET', 'ECONOME', 'SECRETAIRE', 'ENSEIGNANT', 'PARENT']),
    password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ── Role Labels ───────────────────────────────────────────────────────────────
export const USER_ROLE_LABELS: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    PREFET: 'Préfet des Études',
    ECONOME: 'Économe',
    SECRETAIRE: 'Secrétaire',
    ENSEIGNANT: 'Enseignant',
    PARENT: 'Parent',
};

export const TEACHER_STATUS_LABELS: Record<TeacherStatus, string> = {
    MECHANISE: 'Mécanisé',
    NON_PAYE: 'Non Payé',
    NOUVELLE_UNITE: 'Nouvelle Unité',
    VACATAIRE: 'Vacataire',
};
