import { z } from 'zod';

// ── School Types ──────────────────────────────────────────────────────────────
export type SchoolType = 'OFFICIELLE' | 'CONVENTIONNEE' | 'PRIVEE';
export type Convention = 'CATHOLIQUE' | 'PROTESTANTE' | 'KIMBANGUISTE' | 'ISLAMIQUE' | 'ARMEE_SALUT';

export interface School {
    id: string;
    name: string;
    type: SchoolType;
    convention?: Convention | null;
    agrement?: string | null;
    logoUrl?: string | null;
    province: string;
    ville: string;
    commune?: string | null;
    adresse: string;
    latitude?: number | null;
    longitude?: number | null;
    telephone: string;
    email?: string | null;
    website?: string | null;
    facebook?: string | null;
    whatsapp?: string | null;
    twitter?: string | null;
    isConfigured: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface AcademicYear {
    id: string;
    schoolId: string;
    label: string;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    createdAt: Date | string;
}

export interface Class {
    id: string;
    schoolId: string;
    sectionId: string;
    name: string;
    maxStudents: number;
    createdAt: Date | string;
}

export interface Section {
    id: string;
    schoolId: string;
    code: string;
    name: string;
    year: number;
}

// ── Setup Wizard Schemas ──────────────────────────────────────────────────────
export const Step1Schema = z.object({
    name: z.string().min(5, 'Minimum 5 caractères').max(100, 'Maximum 100 caractères'),
    type: z.enum(['OFFICIELLE', 'CONVENTIONNEE', 'PRIVEE']),
    convention: z.enum(['CATHOLIQUE', 'PROTESTANTE', 'KIMBANGUISTE', 'ISLAMIQUE', 'ARMEE_SALUT']).optional(),
    agrement: z.string().optional(),
    logoFile: z.instanceof(File).optional(),
}).refine(
    (data) => {
        if (data.type === 'CONVENTIONNEE') {
            return !!data.convention;
        }
        return true;
    },
    {
        message: 'La convention religieuse est requise pour une école conventionnée',
        path: ['convention'],
    }
);

export const Step2Schema = z.object({
    province: z.string().min(1, 'Sélectionnez une province'),
    ville: z.string().min(2, 'Minimum 2 caractères'),
    commune: z.string().optional(),
    adresse: z.string().min(10, 'Minimum 10 caractères').max(200, 'Maximum 200 caractères'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const Step3Schema = z.object({
    telephone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, 'Numéro congolais invalide'),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    facebook: z.string().optional(),
    whatsapp: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, 'Numéro invalide').optional().or(z.literal('')),
    twitter: z.string().optional(),
});

export const TermSchema = z.object({
    number: z.number().int().min(1).max(3),
    startDate: z.date(),
    endDate: z.date(),
    examStartDate: z.date(),
    examEndDate: z.date(),
});

export const Step4Schema = z.object({
    label: z.string().regex(/^\d{4}-\d{4}$/, 'Format YYYY-YYYY'),
    startDate: z.date(),
    endDate: z.date(),
    terms: z.array(TermSchema).length(3, '3 trimestres requis'),
    holidays: z.array(
        z.object({
            date: z.string(),
            label: z.string(),
        })
    ),
}).refine((data) => data.endDate > data.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
});

export const ClassDataSchema = z.object({
    sectionCode: z.string(),
    year: z.number().int().min(1).max(6),
    name: z.string(),
    maxStudents: z.number().int().min(1).max(100).default(45),
});

export const Step5Schema = z.object({
    sections: z.array(z.string()).min(1, 'Sélectionnez au moins une section'),
    classes: z.array(ClassDataSchema).min(1, 'Créez au moins une classe'),
});

export const Step6Schema = z.object({
    nom: z.string().min(2, 'Minimum 2 caractères'),
    postNom: z.string().min(2, 'Minimum 2 caractères'),
    prenom: z.string().optional(),
    phone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, 'Numéro congolais invalide'),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    password: z
        .string()
        .min(8, 'Minimum 8 caractères')
        .regex(/[A-Z]/, 'Au moins une majuscule')
        .regex(/\d/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type Step4Data = z.infer<typeof Step4Schema>;
export type Step5Data = z.infer<typeof Step5Schema>;
export type Step6Data = z.infer<typeof Step6Schema>;

export interface SetupWizardData {
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
    step5?: Step5Data;
    step6?: Step6Data;
}

export interface SetupSchoolDto {
    school: Step1Data & Step2Data & Step3Data;
    academicYear: Step4Data;
    classes: Step5Data['classes'];
    admin: Step6Data;
}
