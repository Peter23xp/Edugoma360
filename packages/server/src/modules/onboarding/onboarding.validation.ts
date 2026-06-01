import { z } from 'zod';

// ── Validation Zod — Onboarding SaaS ─────────────────────────────────────────
// All error messages are in French, tailored for DRC context.
// ─────────────────────────────────────────────────────────────────────────────

const CONGO_PHONE_RE = /^\+243(81|82|83|84|85|86|87|88|89|90|97|98|99)\d{7}$/;
const STRONG_PWD_RE  = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// ── School info block ─────────────────────────────────────────────────────────
export const SchoolRegistrationSchema = z.object({
    name: z
        .string({ required_error: 'Le nom de l\'école est obligatoire' })
        .min(4, 'Le nom doit contenir au moins 4 caractères')
        .max(120, 'Le nom ne peut pas dépasser 120 caractères'),

    address: z
        .string()
        .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
        .optional(),

    city: z
        .string()
        .default('Goma'),

    province: z
        .string()
        .default('Nord-Kivu'),

    phone: z
        .string({ required_error: 'Le numéro de téléphone de l\'école est obligatoire' })
        .regex(CONGO_PHONE_RE, 'Numéro congolais invalide — format attendu : +243XXXXXXXXX'),

    email: z
        .string()
        .email('Adresse email invalide')
        .optional()
        .or(z.literal('')),

    estimatedStudents: z
        .number({ invalid_type_error: 'Nombre d\'élèves estimé invalide' })
        .int('Ce champ doit être un entier')
        .min(1, 'Minimum 1 élève')
        .max(10000, 'Maximum 10 000 élèves')
        .optional(),
});

// ── Admin account block ───────────────────────────────────────────────────────
export const AdminRegistrationSchema = z.object({
    firstName: z
        .string({ required_error: 'Le prénom est obligatoire' })
        .min(2, 'Le prénom doit contenir au moins 2 caractères'),

    lastName: z
        .string({ required_error: 'Le nom de famille est obligatoire' })
        .min(2, 'Le nom de famille doit contenir au moins 2 caractères'),

    email: z
        .string()
        .email('Adresse email invalide')
        .optional()
        .or(z.literal('')),

    phone: z
        .string({ required_error: 'Le numéro de téléphone de l\'administrateur est obligatoire' })
        .regex(CONGO_PHONE_RE, 'Numéro congolais invalide — format attendu : +243XXXXXXXXX'),

    password: z
        .string({ required_error: 'Le mot de passe est obligatoire' })
        .regex(
            STRONG_PWD_RE,
            'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
        ),
});

// ── Full registration body ────────────────────────────────────────────────────
export const RegisterSchoolSchema = z.object({
    school:   SchoolRegistrationSchema,
    admin:    AdminRegistrationSchema,
    planSlug: z
        .enum(['trial', 'bronze', 'silver', 'gold'], {
            errorMap: () => ({
                message: 'Formule invalide. Choisissez : trial, bronze, silver ou gold',
            }),
        })
        .default('trial'),
});

export type RegisterSchoolInput = z.infer<typeof RegisterSchoolSchema>;

// ── Check-subdomain query ─────────────────────────────────────────────────────
export const CheckSubdomainSchema = z.object({
    slug: z
        .string({ required_error: 'Le paramètre slug est requis' })
        .min(3, 'Minimum 3 caractères')
        .max(30, 'Maximum 30 caractères')
        .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
});

export type CheckSubdomainInput = z.infer<typeof CheckSubdomainSchema>;
