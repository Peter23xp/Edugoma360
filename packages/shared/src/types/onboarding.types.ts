import { z } from 'zod';

// ── Onboarding Types — EduGoma 360 SaaS ──────────────────────────────────────
// Shared between client (React) and server (Express/Prisma).
// Import via: import { ... } from '@edugoma360/shared'
// ─────────────────────────────────────────────────────────────────────────────

// ── Request Schemas ───────────────────────────────────────────────────────────

const CONGO_PHONE_RE = /^\+243(81|82|83|84|85|86|87|88|89|90|97|98|99)\d{7}$/;

export const SchoolOnboardingSchema = z.object({
    name:              z.string().min(4).max(120),
    address:           z.string().max(200).optional(),
    city:              z.string().default('Goma'),
    province:          z.string().default('Nord-Kivu'),
    phone:             z.string().regex(CONGO_PHONE_RE, 'Numéro congolais invalide (+243XXXXXXXXX)'),
    email:             z.string().email().optional().or(z.literal('')),
    estimatedStudents: z.number().int().min(1).max(10000).optional(),
});

export const AdminOnboardingSchema = z.object({
    firstName: z.string().min(2),
    lastName:  z.string().min(2),
    email:     z.string().email().optional().or(z.literal('')),
    phone:     z.string().regex(CONGO_PHONE_RE, 'Numéro congolais invalide (+243XXXXXXXXX)'),
    password:  z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d).{8,}$/,
                   'Minimum 8 caractères, une majuscule et un chiffre'),
});

export const RegisterSchoolRequestSchema = z.object({
    school:   SchoolOnboardingSchema,
    admin:    AdminOnboardingSchema,
    planSlug: z.enum(['trial', 'bronze', 'silver', 'gold']).default('trial'),
});

export type RegisterSchoolRequest = z.infer<typeof RegisterSchoolRequestSchema>;

// ── Response Types ────────────────────────────────────────────────────────────

export interface RegisterSchoolResponse {
    success: boolean;
    school: {
        id:        string;
        name:      string;
        subdomain: string;
    };
    admin: {
        id:    string;
        email: string | null;
        phone: string;
        role:  string;
    };
    subscription: {
        status:  string;
        endDate: string | Date;
        plan:    string;
    };
    loginUrl: string;
    message:  string;
}

export interface CheckSubdomainResponse {
    available:  boolean;
    slug:       string;
    suggestion: string;
}

// ── Plan displayed on landing page ───────────────────────────────────────────

export interface PublicPlan {
    id:               string;
    name:             string;
    slug:             'trial' | 'bronze' | 'silver' | 'gold';
    priceUSD:         number;
    priceCDF:         number;
    maxStudents:      number;
    maxStudentsLabel: string;   // "300" or "Illimité"
    maxTeachers:      number;
    maxTeachersLabel: string;   // "20" or "Illimité"
    maxSmsPerMonth:   number;
    durationDays:     number;
    features:         string[]; // parsed from JSON
    isActive:         boolean;
}

// ── Onboarding wizard step state (frontend only) ──────────────────────────────

export interface OnboardingWizardState {
    currentStep: 1 | 2 | 3;
    school?:     z.infer<typeof SchoolOnboardingSchema>;
    admin?:      z.infer<typeof AdminOnboardingSchema>;
    planSlug?:   'trial' | 'bronze' | 'silver' | 'gold';
    subdomainPreview?: string; // live preview as user types school name
}
