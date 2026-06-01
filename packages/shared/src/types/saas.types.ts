import { z } from 'zod';

// ── SaaS: Statuts d'abonnement ────────────────────────────────────────────────
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, string> = {
    TRIAL:     'Période d\'essai',
    ACTIVE:    'Abonnement actif',
    EXPIRED:   'Abonnement expiré',
    SUSPENDED: 'Suspendu',
    PENDING:   'En attente de paiement',
};

export type SubscriptionStatusColor = Record<SubscriptionStatus, 'success' | 'warning' | 'error' | 'info' | 'secondary'>;

export const SUBSCRIPTION_STATUS_COLORS: SubscriptionStatusColor = {
    TRIAL:     'info',
    ACTIVE:    'success',
    EXPIRED:   'error',
    SUSPENDED: 'error',
    PENDING:   'warning',
};

// ── SaaS: Méthodes de paiement ────────────────────────────────────────────────
export type PaymentMethodSaaS =
    | 'MPESA'
    | 'AIRTEL_MONEY'
    | 'ORANGE_MONEY'
    | 'FLEXPAY'
    | 'FAYPAY'
    | 'MAISHAPAY'
    | 'CARD'
    | 'MANUAL';

export const PAYMENT_METHOD_SAAS_LABELS: Record<PaymentMethodSaaS, string> = {
    MPESA:        'M-Pesa (Vodacom)',
    AIRTEL_MONEY: 'Airtel Money',
    ORANGE_MONEY: 'Orange Money',
    FLEXPAY:      'FlexPay',
    FAYPAY:       'FaysPay',
    MAISHAPAY:    'MaishaPay',
    CARD:         'Carte Bancaire',
    MANUAL:       'Paiement Manuel / Administratif',
};

// ── SaaS: Slugs de plan ───────────────────────────────────────────────────────
export type PlanSlug = 'trial' | 'bronze' | 'silver' | 'gold';

export const PLAN_SLUG_LABELS: Record<PlanSlug, string> = {
    trial:  'Essai Gratuit',
    bronze: 'Bronze',
    silver: 'Argent',
    gold:   'Or',
};

// ── Interface: SubscriptionPlan ───────────────────────────────────────────────
export interface SubscriptionPlan {
    id:             string;
    name:           string;
    slug:           PlanSlug;
    priceUSD:       number;
    priceCDF:       number;
    maxStudents:    number;  // -1 = illimité
    maxTeachers:    number;  // -1 = illimité
    maxSmsPerMonth: number;
    durationDays:   number;
    features:       string;  // JSON string → string[]
    isActive:       boolean;
}

/** Helper pour désérialiser les fonctionnalités d'un plan */
export function parsePlanFeatures(plan: SubscriptionPlan): string[] {
    try {
        return JSON.parse(plan.features) as string[];
    } catch {
        return [];
    }
}

// ── Interface: Subscription ───────────────────────────────────────────────────
export interface Subscription {
    id:            string;
    schoolId:      string;
    planId:        string | null;
    startDate:     Date | string;
    endDate:       Date | string;
    status:        SubscriptionStatus;
    amountPaid:    number;
    currency:      string;
    paymentRef:    string | null;
    paymentMethod: PaymentMethodSaaS | null;
    notes:         string | null;
    createdAt:     Date | string;
}

// ── Interface enrichie: School avec SaaS ─────────────────────────────────────
export interface SchoolWithSubscription {
    id:           string;
    name:         string;
    subdomain:    string | null;
    planId:       string | null;
    plan:         SubscriptionPlan | null;
    trialEndsAt:  Date | string | null;
    subscriptions: Subscription[];
}

// ── Helper: Vérifier si un abonnement est valide ─────────────────────────────
export function isSubscriptionValid(subscription: Subscription | null | undefined): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIAL') return false;
    return new Date(subscription.endDate) > new Date();
}

// ── Helper: Jours restants avant expiration ────────────────────────────────
export function daysUntilExpiry(subscription: Subscription | null | undefined): number {
    if (!subscription) return 0;
    const diff = new Date(subscription.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Zod: Schéma de création d'abonnement (Onboarding SaaS) ───────────────────
export const SubscribeSchoolSchema = z.object({
    planSlug:      z.enum(['trial', 'bronze', 'silver', 'gold']),
    paymentMethod: z.enum(['MPESA', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'FLEXPAY', 'FAYPAY', 'MAISHAPAY', 'CARD', 'MANUAL']).optional(),
    paymentRef:    z.string().optional(),
    notes:         z.string().optional(),
});

export type SubscribeSchoolInput = z.infer<typeof SubscribeSchoolSchema>;

// ── Zod: Schéma d'onboarding complet d'une école SaaS ────────────────────────
export const SaasOnboardingSchema = z.object({
    // Informations de l'école
    schoolName:  z.string().min(5, 'Minimum 5 caractères'),
    schoolType:  z.enum(['OFFICIELLE', 'CONVENTIONNEE', 'PRIVE']),
    province:    z.string().min(1),
    ville:       z.string().min(2),
    commune:     z.string().optional(),
    adresse:     z.string().optional(),
    telephone:   z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, 'Numéro congolais invalide'),
    email:       z.string().email().optional().or(z.literal('')),
    // Sous-domaine souhaité
    subdomain:   z.string()
                   .min(3, 'Minimum 3 caractères')
                   .max(30, 'Maximum 30 caractères')
                   .regex(/^[a-z0-9-]+$/, 'Uniquement des lettres minuscules, chiffres et tirets'),
    // Administrateur de l'école
    adminNom:      z.string().min(2),
    adminPostNom:  z.string().min(2),
    adminPrenom:   z.string().optional(),
    adminPhone:    z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, 'Numéro congolais invalide'),
    adminEmail:    z.string().email().optional().or(z.literal('')),
    adminPassword: z.string().min(8).regex(/[A-Z]/, 'Au moins une majuscule').regex(/\d/, 'Au moins un chiffre'),
    // Plan choisi
    planSlug: z.enum(['trial', 'bronze', 'silver', 'gold']),
});

export type SaasOnboardingInput = z.infer<typeof SaasOnboardingSchema>;
