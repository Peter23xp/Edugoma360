import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import prisma from '../../lib/prisma';
import { RegisterSchoolSchema, CheckSubdomainSchema } from './onboarding.validation';
import { slugify, findAvailableSubdomain, currentAcademicYear } from './onboarding.service';

// ── OnboardingError ───────────────────────────────────────────────────────────
class OnboardingError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode = 400,
    ) {
        super(message);
        this.name = 'OnboardingError';
    }
}

const PUBLIC_PLANS_TIMEOUT_MS = 2500;

const FALLBACK_PUBLIC_PLANS = [
    {
        id: 'fallback-trial',
        name: 'Essai',
        slug: 'trial',
        priceUSD: 0,
        priceCDF: 0,
        maxStudents: 150,
        maxTeachers: 10,
        maxSmsPerMonth: 50,
        durationDays: 30,
        features: ['30 jours gratuits', 'Gestion des eleves', 'Presences et notes', 'Support de demarrage'],
        isActive: true,
    },
    {
        id: 'fallback-bronze',
        name: 'Bronze',
        slug: 'bronze',
        priceUSD: 15,
        priceCDF: 42000,
        maxStudents: 300,
        maxTeachers: 20,
        maxSmsPerMonth: 150,
        durationDays: 30,
        features: ['Eleves et classes', 'Paiements scolaires', 'Bulletins', 'SMS parents'],
        isActive: true,
    },
    {
        id: 'fallback-silver',
        name: 'Argent',
        slug: 'silver',
        priceUSD: 30,
        priceCDF: 84000,
        maxStudents: 700,
        maxTeachers: 50,
        maxSmsPerMonth: 500,
        durationDays: 30,
        features: ['Tout Bronze', 'Rapports avances', 'Mode hors-ligne', 'Support prioritaire'],
        isActive: true,
    },
    {
        id: 'fallback-gold',
        name: 'Or',
        slug: 'gold',
        priceUSD: 60,
        priceCDF: 168000,
        maxStudents: -1,
        maxTeachers: -1,
        maxSmsPerMonth: 1500,
        durationDays: 30,
        features: ['Utilisateurs illimites', 'SMS et finances avances', 'Exports officiels', 'Accompagnement premium'],
        isActive: true,
    },
];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
}

function toPublicPlan(plan: (typeof FALLBACK_PUBLIC_PLANS)[number] | {
    id: string;
    name: string;
    slug: string;
    priceUSD: number;
    priceCDF: number;
    maxStudents: number;
    maxTeachers: number;
    maxSmsPerMonth: number;
    durationDays: number;
    features: string;
    isActive: boolean;
}) {
    const features = Array.isArray(plan.features)
        ? plan.features
        : (() => {
            try { return JSON.parse(plan.features) as string[]; }
            catch { return []; }
        })();

    return {
        ...plan,
        features,
        maxStudentsLabel: plan.maxStudents === -1 ? 'Illimité' : `${plan.maxStudents}`,
        maxTeachersLabel: plan.maxTeachers === -1 ? 'Illimité' : `${plan.maxTeachers}`,
    };
}

// ── RegisterSchoolController ──────────────────────────────────────────────────
/**
 * POST /api/public/onboarding/register
 *
 * Creates a new school, admin user, and initial subscription in a single
 * atomic Prisma transaction. If any step fails the entire operation rolls back.
 */
export async function RegisterSchoolController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // ── 1. Validate input ───────────────────────────────────────────────
        const body = RegisterSchoolSchema.parse(req.body);
        const { school: schoolInput, admin, planSlug } = body;

        // ── 2. Fetch the chosen plan (outside transaction — read-only) ──────
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { slug: planSlug },
        });

        if (!plan || !plan.isActive) {
            throw new OnboardingError(
                'PLAN_NOT_FOUND',
                `La formule "${planSlug}" n'est pas disponible.`,
                404,
            );
        }

        // ── 3. Determine unique subdomain ───────────────────────────────────
        const subdomain = await findAvailableSubdomain(schoolInput.name);

        // ── 4. Atomic transaction ───────────────────────────────────────────
        const result = await prisma.$transaction(async (tx) => {
            // 4a. Create the school
            const school = await tx.school.create({
                data: {
                    name:               schoolInput.name,
                    nomOfficiel:        schoolInput.name,
                    nomCourt:           schoolInput.name,
                    type:               'PRIVE',
                    province:           schoolInput.province,
                    ville:              schoolInput.city,
                    commune:            schoolInput.city,
                    adresse:            schoolInput.address ?? schoolInput.city,
                    avenue:             schoolInput.address ?? schoolInput.city,
                    telephone:          schoolInput.phone,
                    telephonePrincipal: schoolInput.phone,
                    email:              schoolInput.email || null,
                    subdomain,
                    planId:             plan.id,
                },
            });

            // 4b. Create default academic year (based on current DRC school year)
            const ay = currentAcademicYear();
            await tx.academicYear.create({
                data: {
                    schoolId:  school.id,
                    label:     ay.label,
                    name:      ay.label,
                    startDate: ay.startDate,
                    endDate:   ay.endDate,
                    isActive:  true,
                    isClosed:  false,
                },
            });

            // 4c. Hash password & create admin user (role: PREFET)
            const passwordHash = await bcrypt.hash(admin.password, 12);

            const adminUser = await tx.user.create({
                data: {
                    schoolId:     school.id,
                    nom:          admin.lastName.toUpperCase(),
                    postNom:      admin.lastName.toUpperCase(),
                    prenom:       admin.firstName,
                    email:        admin.email || null,
                    phone:        admin.phone,
                    role:         'PREFET',
                    passwordHash,
                    isActive:     true,
                    isSuperAdmin: false,
                    mustChangePassword: false,
                },
            });

            // 4d. Compute subscription dates
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + plan.durationDays);

            const subscriptionStatus = planSlug === 'trial' ? 'TRIAL' : 'PENDING';

            // 4e. Create initial subscription
            const subscription = await tx.subscription.create({
                data: {
                    schoolId:     school.id,
                    planId:       plan.id,
                    startDate:    now,
                    endDate,
                    status:       subscriptionStatus,
                    amountPaid:   planSlug === 'trial' ? 0 : 0, // 0 until payment confirmed
                    currency:     'USD',
                    paymentMethod: 'MANUAL',
                    notes:        planSlug === 'trial'
                        ? 'Période d\'essai gratuit 30 jours'
                        : `En attente de paiement — plan ${plan.name}`,
                },
            });

            // 4f. Set trialEndsAt on school if trial plan
            if (planSlug === 'trial') {
                await tx.school.update({
                    where: { id: school.id },
                    data:  { trialEndsAt: endDate },
                });
            }

            return { school, adminUser, subscription };
        });

        // ── 5. Respond with success ─────────────────────────────────────────
        const loginUrl = `https://${subdomain}.edugoma360.cd`;

        res.status(201).json({
            success: true,
            school: {
                id:        result.school.id,
                name:      result.school.name,
                subdomain: result.school.subdomain,
            },
            admin: {
                id:    result.adminUser.id,
                email: result.adminUser.email,
                phone: result.adminUser.phone,
                role:  result.adminUser.role,
            },
            subscription: {
                status:  result.subscription.status,
                endDate: result.subscription.endDate,
                plan:    plan.name,
            },
            loginUrl,
            message: planSlug === 'trial'
                ? `Votre espace "${result.school.name}" a été créé ! Vous avez 30 jours d'essai gratuit.`
                : `Votre espace "${result.school.name}" a été créé ! Finalisez votre paiement pour activer votre abonnement ${plan.name}.`,
        });

    } catch (error) {
        // ── Zod validation errors → 422 with field details ──────────────────
        if (error instanceof ZodError) {
            res.status(422).json({
                success: false,
                error: {
                    code:    'VALIDATION_ERROR',
                    message: 'Données invalides — vérifiez les champs ci-dessous.',
                    fields:  error.errors.map((e) => ({
                        field:   e.path.join('.'),
                        message: e.message,
                    })),
                },
            });
            return;
        }

        // ── Business errors (OnboardingError) ───────────────────────────────
        if (error instanceof OnboardingError) {
            res.status(error.statusCode).json({
                success: false,
                error: { code: error.code, message: error.message },
            });
            return;
        }

        // ── Prisma unique constraint (duplicate phone/email) ─────────────────
        if (
            error instanceof Error &&
            error.message.includes('Unique constraint failed')
        ) {
            const field = error.message.includes('phone') ? 'téléphone' : 'email';
            res.status(409).json({
                success: false,
                error: {
                    code:    'DUPLICATE_ENTRY',
                    message: `Ce ${field} est déjà utilisé sur notre plateforme.`,
                },
            });
            return;
        }

        next(error);
    }
}

// ── CheckSubdomainController ──────────────────────────────────────────────────
/**
 * GET /api/public/onboarding/check-subdomain?slug=xxx
 *
 * Checks if a given subdomain slug is available.
 * Also returns a suggested slug based on the input.
 */
export async function CheckSubdomainController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { slug } = CheckSubdomainSchema.parse(req.query);

        const existing = await prisma.school.findUnique({
            where: { subdomain: slug },
        });

        const available = !existing;

        // Build a suggestion if taken
        let suggestion = slug;
        if (!available) {
            suggestion = await findAvailableSubdomain(slug);
        }

        res.json({ available, slug, suggestion });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(422).json({
                error: {
                    code:    'VALIDATION_ERROR',
                    message: error.errors[0]?.message ?? 'Slug invalide',
                },
            });
            return;
        }
        next(error);
    }
}

// ── GetPlansController ────────────────────────────────────────────────────────
/**
 * GET /api/public/plans
 *
 * Returns all active subscription plans ordered by price (ascending).
 * The features field is parsed from JSON string to array for frontend convenience.
 */
export async function GetPlansController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        try {
            const plans = await withTimeout(
                prisma.subscriptionPlan.findMany({
                    where:   { isActive: true },
                    orderBy: { priceUSD: 'asc' },
                }),
                PUBLIC_PLANS_TIMEOUT_MS,
            );

            const source = plans?.length ? plans : FALLBACK_PUBLIC_PLANS;
            res.json({ data: source.map(toPublicPlan) });
            return;
        } catch {
            res.json({ data: FALLBACK_PUBLIC_PLANS.map(toPublicPlan) });
            return;
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where:   { isActive: true },
            orderBy: { priceUSD: 'asc' },
        });

        const parsed = plans.map((p) => ({
            ...p,
            features: (() => {
                try { return JSON.parse(p.features) as string[]; }
                catch { return []; }
            })(),
            maxStudentsLabel: p.maxStudents === -1 ? 'Illimité' : `${p.maxStudents}`,
            maxTeachersLabel: p.maxTeachers === -1 ? 'Illimité' : `${p.maxTeachers}`,
        }));

        res.json({ data: parsed });
    } catch (error) {
        next(error);
    }
}
