import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfMonth(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const UpdateSubscriptionSchema = z.object({
    planId:    z.string().optional(),
    startDate: z.string().or(z.date()).transform((v) => new Date(v)),
    endDate:   z.string().or(z.date()).transform((v) => new Date(v)),
    status:    z.enum(['TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'PENDING']),
    notes:     z.string().optional(),
    amountPaid: z.number().default(0),
    currency:   z.string().default('USD'),
    paymentMethod: z.string().optional(),
});

const UpdateStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']),
    reason: z.string().optional(),
});

const CreatePlanSchema = z.object({
    name:           z.string().min(2),
    slug:           z.string().min(2).max(30),
    priceUSD:       z.number().min(0),
    priceCDF:       z.number().min(0),
    maxStudents:    z.number().int(),
    maxTeachers:    z.number().int(),
    maxSmsPerMonth: z.number().int().min(0),
    durationDays:   z.number().int().min(1),
    features:       z.array(z.string()),
    isActive:       z.boolean().default(true),
});

// ── getMetrics ─────────────────────────────────────────────────────────────────
export async function getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const monthStart = startOfMonth();
        const monthEnd   = endOfMonth();
        const now        = new Date();

        // Parallel queries for performance
        const [
            totalSchools,
            activeSubCount,
            trialSubCount,
            expiredSchools,
            mrrData,
            totalSmsThisMonth,
            schoolsByPlan,
        ] = await Promise.all([
            prisma.school.count({ where: { isActive: true } }),

            prisma.subscription.count({
                where: { status: 'ACTIVE', endDate: { gte: now } },
            }),

            prisma.subscription.count({
                where: { status: 'TRIAL', endDate: { gte: now } },
            }),

            prisma.subscription.count({
                where: { status: { in: ['EXPIRED', 'SUSPENDED'] } },
            }),

            // MRR: sum of amountPaid for ACTIVE subscriptions created this month
            prisma.subscription.aggregate({
                _sum: { amountPaid: true },
                where: {
                    status: 'ACTIVE',
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
            }),

            // SMS count this month (SMSCampaign.sentSMS sum)
            prisma.sMSCampaign.aggregate({
                _sum: { sentSMS: true },
                where: { createdAt: { gte: monthStart, lte: monthEnd } },
            }),

            // Schools grouped by plan
            prisma.school.groupBy({
                by: ['planId'],
                _count: { _all: true },
                where: { isActive: true },
            }),
        ]);

        // Resolve plan names for schoolsByPlan
        const planIds = schoolsByPlan.map((g) => g.planId).filter(Boolean) as string[];
        const plans   = await prisma.subscriptionPlan.findMany({
            where: { id: { in: planIds } },
            select: { id: true, name: true, slug: true },
        });
        const planMap = new Map(plans.map((p) => [p.id, p]));

        const schoolsByPlanFormatted = schoolsByPlan.map((g) => ({
            planId:   g.planId,
            planName: g.planId ? (planMap.get(g.planId)?.name ?? 'Inconnu') : 'Sans plan',
            slug:     g.planId ? (planMap.get(g.planId)?.slug ?? '') : '',
            count:    g._count._all,
        }));

        res.json({
            data: {
                totalSchools,
                activeSchools:   activeSubCount,
                trialSchools:    trialSubCount,
                expiredSchools,
                mrr:             mrrData._sum.amountPaid ?? 0,
                totalSmsThisMonth: totalSmsThisMonth._sum.sentSMS ?? 0,
                schoolsByPlan:   schoolsByPlanFormatted,
                month:           `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
            },
        });
    } catch (error) {
        next(error);
    }
}

// ── listSchools ───────────────────────────────────────────────────────────────
export async function listSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page   = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit  = Math.min(100, parseInt(req.query.limit as string) || 10);
        const skip   = (page - 1) * limit;
        const search = (req.query.search as string)?.trim() || '';
        const status = req.query.status as string | undefined;
        const now    = new Date();

        const where: any = { isActive: true };

        if (search) {
            where.OR = [
                { name:      { contains: search } },
                { subdomain: { contains: search } },
                { email:     { contains: search } },
                { ville:     { contains: search } },
            ];
        }

        // Filter by subscription status — join via subscriptions relation
        if (status && status !== 'ALL') {
            where.subscriptions = {
                some: {
                    status,
                    endDate: status === 'EXPIRED' ? { lt: now } : { gte: now },
                },
            };
        }

        const [schools, total] = await Promise.all([
            prisma.school.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    plan: true,
                    subscriptions: {
                        where: {
                            status: { in: ['ACTIVE', 'TRIAL'] },
                            endDate: { gte: now },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: { students: true },
                    },
                },
            }),
            prisma.school.count({ where }),
        ]);

        res.json({
            data: schools,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
}

// ── getSchoolDetail ───────────────────────────────────────────────────────────
export async function getSchoolDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const monthStart = startOfMonth();

        const [school, smsThisMonth] = await Promise.all([
            prisma.school.findUnique({
                where: { id },
                include: {
                    plan: true,
                    subscriptions: { orderBy: { createdAt: 'desc' } },
                    _count: {
                        select: { students: true, teachers: true, users: true },
                    },
                },
            }),
            prisma.sMSCampaign.aggregate({
                _sum: { sentSMS: true },
                where: { schoolId: id, createdAt: { gte: monthStart } },
            }),
        ]);

        if (!school) {
            res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'École introuvable.' },
            });
            return;
        }

        res.json({
            data: {
                ...school,
                smsThisMonth: smsThisMonth._sum.sentSMS ?? 0,
            },
        });
    } catch (error) {
        next(error);
    }
}

// ── updateSchoolSubscription ──────────────────────────────────────────────────
export async function updateSchoolSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const body = UpdateSubscriptionSchema.parse(req.body);

        // Check school exists
        const school = await prisma.school.findUnique({ where: { id } });
        if (!school) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'École introuvable.' } });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Expire any existing active/trial subscriptions
            await tx.subscription.updateMany({
                where: {
                    schoolId: id,
                    status: { in: ['ACTIVE', 'TRIAL', 'PENDING'] },
                },
                data: { status: 'EXPIRED' },
            });

            // Create new subscription
            const newSub = await tx.subscription.create({
                data: {
                    schoolId:      id,
                    planId:        body.planId ?? school.planId,
                    startDate:     body.startDate,
                    endDate:       body.endDate,
                    status:        body.status,
                    amountPaid:    body.amountPaid,
                    currency:      body.currency,
                    paymentMethod: body.paymentMethod ?? 'MANUAL',
                    notes:         body.notes ?? `Mis à jour manuellement par Super Admin`,
                },
            });

            // Update school planId if a new plan was specified
            if (body.planId) {
                await tx.school.update({
                    where: { id },
                    data:  { planId: body.planId },
                });
            }

            return newSub;
        });

        res.json({
            success: true,
            message: `Abonnement de l'école mis à jour avec succès.`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

// ── updateSchoolStatus ────────────────────────────────────────────────────────
export async function updateSchoolStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const { status, reason } = UpdateStatusSchema.parse(req.body);

        const school = await prisma.school.findUnique({ where: { id } });
        if (!school) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'École introuvable.' } });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Toggle school isActive
            const isActive = status === 'ACTIVE';
            await tx.school.update({
                where: { id },
                data:  { isActive },
            });

            // Update subscription status to match
            if (status === 'SUSPENDED') {
                await tx.subscription.updateMany({
                    where: { schoolId: id, status: { in: ['ACTIVE', 'TRIAL'] } },
                    data:  { status: 'SUSPENDED', notes: reason ?? 'Suspendu par Super Admin' },
                });
            } else if (status === 'ACTIVE') {
                // Reactivate the latest subscription if it was suspended
                const lastSub = await tx.subscription.findFirst({
                    where: { schoolId: id, status: 'SUSPENDED' },
                    orderBy: { createdAt: 'desc' },
                });
                if (lastSub && new Date(lastSub.endDate) > new Date()) {
                    await tx.subscription.update({
                        where: { id: lastSub.id },
                        data:  { status: 'ACTIVE' },
                    });
                }
            }
        });

        res.json({ success: true, status, message: `École ${status === 'ACTIVE' ? 'réactivée' : 'suspendue'} avec succès.` });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

// ── getSmsUsage ───────────────────────────────────────────────────────────────
export async function getSmsUsage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const monthStart = startOfMonth();

        const usage = await prisma.sMSCampaign.groupBy({
            by: ['schoolId'],
            _sum: { sentSMS: true, cost: true },
            _count: { _all: true },
            where: { createdAt: { gte: monthStart } },
            orderBy: { _sum: { sentSMS: 'desc' } },
        });

        // Resolve school names
        const ids = usage.map((u) => u.schoolId);
        const schools = await prisma.school.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, subdomain: true, plan: { select: { name: true, maxSmsPerMonth: true } } },
        });
        const schoolMap = new Map(schools.map((s) => [s.id, s]));

        const data = usage.map((u) => ({
            school:     schoolMap.get(u.schoolId) ?? { id: u.schoolId, name: 'Inconnu', subdomain: null, plan: null },
            sentSMS:    u._sum.sentSMS ?? 0,
            cost:       u._sum.cost ?? 0,
            campaigns:  u._count._all,
            quota:      schoolMap.get(u.schoolId)?.plan?.maxSmsPerMonth ?? 0,
        }));

        res.json({ data, month: monthStart.toISOString().slice(0, 7) });
    } catch (error) {
        next(error);
    }
}

// ── managePlan ────────────────────────────────────────────────────────────────
export async function managePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const body = CreatePlanSchema.parse(req.body);
        const { features, ...planData } = body;

        const plan = await prisma.subscriptionPlan.upsert({
            where:  { slug: planData.slug },
            update: { ...planData, features: JSON.stringify(features) },
            create: { ...planData, features: JSON.stringify(features) },
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}
