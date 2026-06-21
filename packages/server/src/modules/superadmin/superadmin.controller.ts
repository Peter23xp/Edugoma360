import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { auditSAAction } from '../audit/audit.service';

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

const UpdatePlanSchema = z.object({
    name:           z.string().min(2).optional(),
    priceUSD:       z.number().min(0).optional(),
    priceCDF:       z.number().min(0).optional(),
    maxStudents:    z.number().int().optional(),
    maxTeachers:    z.number().int().optional(),
    maxSmsPerMonth: z.number().int().min(0).optional(),
    durationDays:   z.number().int().min(1).optional(),
    features:       z.array(z.string()).optional(),
    isActive:       z.boolean().optional(),
});

const CreateSAAdminSchema = z.object({
    nom:         z.string().min(2),
    postNom:     z.string().min(2),
    prenom:      z.string().optional(),
    email:       z.string().email().optional().or(z.literal('')),
    phone:       z.string().optional(),
    password:    z.string().min(8),
    schoolId:    z.string().optional(),
    permissions: z.array(z.string()).default([]),
});

const UpdatePermissionsSchema = z.object({
    permissions: z.array(z.string()),
});

// ── getMetrics ─────────────────────────────────────────────────────────────────
export async function getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const monthStart = startOfMonth();
        const monthEnd   = endOfMonth();
        const now        = new Date();
        const in30Days   = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Parallel queries for performance
        const [
            totalSchools,
            activeSubCount,
            trialSubCount,
            expiredSchools,
            mrrData,
            totalSmsThisMonth,
            schoolsByPlan,
            expiringIn30Days,
            newSchoolsThisMonth,
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

            // Subscriptions expiring in the next 30 days
            prisma.subscription.count({
                where: {
                    status: { in: ['ACTIVE', 'TRIAL'] },
                    endDate: { gte: now, lte: in30Days },
                },
            }),

            // New schools registered this month
            prisma.school.count({
                where: { createdAt: { gte: monthStart, lte: monthEnd } },
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
                activeSchools:      activeSubCount,
                trialSchools:       trialSubCount,
                expiredSchools,
                mrr:                mrrData._sum.amountPaid ?? 0,
                totalSmsThisMonth:  totalSmsThisMonth._sum.sentSMS ?? 0,
                schoolsByPlan:      schoolsByPlanFormatted,
                expiringIn30Days,
                newSchoolsThisMonth,
                month:              `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
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

        // Show ALL schools (active + suspended) so SA can manage suspended ones too
        const where: any = {};

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

        auditSAAction(req, 'SUBSCRIPTION_UPDATE', `Abonnement mis à jour pour l'école ${id}`, { schoolId: id, entityId: id, entity: 'Subscription' }).catch(() => {});
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

        auditSAAction(req, status === 'ACTIVE' ? 'ACTIVATE' : 'SUSPEND', `École ${id} ${status === 'ACTIVE' ? 'réactivée' : 'suspendue'}${reason ? ` : ${reason}` : ''}`, { schoolId: id, entity: 'School', entityId: id }).catch(() => {});
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

// ── listPlans ─────────────────────────────────────────────────────────────────
export async function listPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { priceUSD: 'asc' },
            include: { _count: { select: { schools: true } } },
        });
        const data = plans.map((p) => ({
            ...p,
            features: (() => { try { return JSON.parse(p.features); } catch { return []; } })(),
            schoolCount: p._count.schools,
        }));
        res.json({ data });
    } catch (error) { next(error); }
}

// ── updatePlan ────────────────────────────────────────────────────────────────
export async function updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const body = UpdatePlanSchema.parse(req.body);
        const { features, ...planData } = body;
        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: { ...planData, ...(features !== undefined && { features: JSON.stringify(features) }) },
        });
        res.json({
            success: true,
            data: { ...plan, features: (() => { try { return JSON.parse(plan.features); } catch { return []; } })() },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

// ── togglePlan ────────────────────────────────────────────────────────────────
export async function togglePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
        if (!plan) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plan introuvable.' } });
            return;
        }
        const updated = await prisma.subscriptionPlan.update({
            where: { id },
            data: { isActive: !plan.isActive },
        });
        res.json({ success: true, data: updated });
    } catch (error) { next(error); }
}

// ── listAllSubscriptions ──────────────────────────────────────────────────────
export async function listAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page   = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip   = (page - 1) * limit;
        const status = req.query.status as string | undefined;
        const search = (req.query.search as string)?.trim() || '';
        const planId = req.query.planId as string | undefined;

        const where: any = {};
        if (status && status !== 'ALL') where.status = status;
        if (planId) where.planId = planId;
        if (search) where.school = { name: { contains: search } };

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { school: { select: { id: true, name: true, subdomain: true } } },
            }),
            prisma.subscription.count({ where }),
        ]);

        const planIds = [...new Set(subscriptions.map((s) => s.planId).filter(Boolean))] as string[];
        const plans   = await prisma.subscriptionPlan.findMany({
            where: { id: { in: planIds } },
            select: { id: true, name: true, slug: true },
        });
        const planMap = new Map(plans.map((p) => [p.id, p]));

        const data = subscriptions.map((s) => ({
            ...s,
            planName: s.planId ? (planMap.get(s.planId)?.name ?? 'Inconnu') : 'Sans plan',
        }));

        res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
}

// ── listSAAdmins ──────────────────────────────────────────────────────────────
export async function listSAAdmins(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const admins = await prisma.user.findMany({
            where: { isSuperAdmin: true },
            select: {
                id: true, nom: true, postNom: true, prenom: true,
                email: true, phone: true, isActive: true,
                permissions: true, createdAt: true, lastLoginAt: true,
                school: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        const data = admins.map((a) => ({
            ...a,
            permissions: (() => {
                try { const p = JSON.parse(a.permissions || '[]'); return Array.isArray(p) ? p : []; }
                catch { return []; }
            })(),
        }));
        res.json({ data });
    } catch (error) { next(error); }
}

// ── createSAAdmin ─────────────────────────────────────────────────────────────
export async function createSAAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const body = CreateSAAdminSchema.parse(req.body);
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(body.password, 12);

        // Super Admin = indépendant de toute école. schoolId optionnel (null par défaut).
        const schoolId = body.schoolId ?? null;

        if (body.email) {
            const existing = await prisma.user.findFirst({ where: { email: body.email } });
            if (existing) {
                res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Cet email est déjà utilisé.' } });
                return;
            }
        }

        const user = await prisma.user.create({
            data: {
                schoolId,
                nom:                body.nom.toUpperCase(),
                postNom:            body.postNom.toUpperCase(),
                prenom:             body.prenom,
                email:              body.email || null,
                phone:              body.phone || null,
                role:               'SUPER_ADMIN',
                passwordHash,
                isSuperAdmin:       true,
                isActive:           true,
                mustChangePassword: true,
                permissions:        JSON.stringify(body.permissions),
            },
        });

        const { passwordHash: _, ...safe } = user;
        auditSAAction(req, 'ADMIN_CREATE', `Nouvel admin SA créé : ${body.nom} ${body.postNom}`, { entity: 'User', entityId: user.id }).catch(() => {});
        res.status(201).json({ success: true, data: { ...safe, permissions: body.permissions } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

// ── updateSAAdminPermissions ──────────────────────────────────────────────────
export async function updateSAAdminPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const { permissions } = UpdatePermissionsSchema.parse(req.body);

        const admin = await prisma.user.findUnique({ where: { id } });
        if (!admin || !admin.isSuperAdmin) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Admin introuvable.' } });
            return;
        }

        await prisma.user.update({ where: { id }, data: { permissions: JSON.stringify(permissions) } });
        res.json({ success: true, message: 'Permissions mises à jour avec succès.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

// ── deleteSchool ──────────────────────────────────────────────────────────────
export async function deleteSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;

        const school = await prisma.school.findUnique({
            where: { id },
            select: { id: true, name: true },
        });
        if (!school) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'École introuvable.' } });
            return;
        }

        // Explicit ordered cascade: collect parent IDs, then delete children before
        // parents using scalar FK filters. Deterministic — no reliance on SQLite
        // PRAGMA (which is a no-op inside a transaction) or partial onDelete rules.
        await prisma.$transaction(async (tx) => {
            // ── Collect parent IDs ──────────────────────────────────────────────
            const pick = (rows: { id: string }[]) => rows.map((r) => r.id);
            const studentIds   = pick(await tx.student.findMany({ where: { schoolId: id }, select: { id: true } }));
            const classIds     = pick(await tx.class.findMany({ where: { schoolId: id }, select: { id: true } }));
            const teacherIds   = pick(await tx.teacher.findMany({ where: { schoolId: id }, select: { id: true } }));
            const ayIds        = pick(await tx.academicYear.findMany({ where: { schoolId: id }, select: { id: true } }));
            const sectionIds   = pick(await tx.section.findMany({ where: { schoolId: id }, select: { id: true } }));
            const paymentIds   = pick(await tx.payment.findMany({ where: { schoolId: id }, select: { id: true } }));
            const planIds      = pick(await tx.paymentPlan.findMany({ where: { schoolId: id }, select: { id: true } }));
            const sessionIds   = pick(await tx.cashSession.findMany({ where: { schoolId: id }, select: { id: true } }));
            const budgetIds    = pick(await tx.budget.findMany({ where: { schoolId: id }, select: { id: true } }));
            const campaignIds  = pick(await tx.sMSCampaign.findMany({ where: { schoolId: id }, select: { id: true } }));
            const announceIds  = pick(await tx.announcement.findMany({ where: { schoolId: id }, select: { id: true } }));
            const materialIds  = pick(await tx.materialItem.findMany({ where: { schoolId: id }, select: { id: true } }));
            const bookIds      = pick(await tx.book.findMany({ where: { schoolId: id }, select: { id: true } }));
            const tcsIds       = pick(await tx.teacherClassSubject.findMany({ where: { classId: { in: classIds } }, select: { id: true } }));
            const delibIds     = pick(await tx.deliberation.findMany({ where: { classId: { in: classIds } }, select: { id: true } }));

            // ── Delete leaf children first ──────────────────────────────────────
            await tx.timetablePeriod.deleteMany({ where: { teacherClassSubjectId: { in: tcsIds } } });
            await tx.delibResult.deleteMany({ where: { deliberationId: { in: delibIds } } });
            await tx.grade.deleteMany({ where: { studentId: { in: studentIds } } });
            await tx.justification.deleteMany({ where: { schoolId: id } });        // refs attendance → before attendance
            await tx.attendance.deleteMany({ where: { studentId: { in: studentIds } } });
            await tx.teacherAttendance.deleteMany({ where: { schoolId: id } });
            await tx.disciplineRecord.deleteMany({ where: { studentId: { in: studentIds } } });
            await tx.feePayment.deleteMany({ where: { paymentId: { in: paymentIds } } });
            await tx.installment.deleteMany({ where: { planId: { in: planIds } } });
            await tx.cashMovement.deleteMany({ where: { sessionId: { in: sessionIds } } });
            await tx.budgetMonth.deleteMany({ where: { budgetId: { in: budgetIds } } });
            await tx.budgetCategory.deleteMany({ where: { budgetId: { in: budgetIds } } });
            await tx.announcementView.deleteMany({ where: { announcementId: { in: announceIds } } });
            await tx.sMSMessage.deleteMany({ where: { campaignId: { in: campaignIds } } });
            await tx.stockMovement.deleteMany({ where: { itemId: { in: materialIds } } });
            await tx.bookLoan.deleteMany({ where: { bookId: { in: bookIds } } });
            await tx.maintenanceRequest.deleteMany({ where: { schoolId: id } });
            await tx.enrollment.deleteMany({ where: { studentId: { in: studentIds } } });
            await tx.teacherCertificate.deleteMany({ where: { teacherId: { in: teacherIds } } });
            await tx.teacherLeave.deleteMany({ where: { schoolId: id } });
            await tx.teacherClassSubject.deleteMany({ where: { id: { in: tcsIds } } });

            // ── Mid-level entities ──────────────────────────────────────────────
            await tx.deliberation.deleteMany({ where: { id: { in: delibIds } } });
            await tx.payment.deleteMany({ where: { schoolId: id } });
            await tx.paymentPlan.deleteMany({ where: { schoolId: id } });
            await tx.feeType.deleteMany({ where: { schoolId: id } });
            await tx.cashSession.deleteMany({ where: { schoolId: id } });
            await tx.budget.deleteMany({ where: { schoolId: id } });
            await tx.sMSCampaign.deleteMany({ where: { schoolId: id } });
            await tx.emailCampaign.deleteMany({ where: { schoolId: id } });
            await tx.convocation.deleteMany({ where: { schoolId: id } });
            await tx.announcement.deleteMany({ where: { schoolId: id } });
            await tx.savedReport.deleteMany({ where: { schoolId: id } });
            await tx.exportHistory.deleteMany({ where: { schoolId: id } });
            await tx.exportSchedule.deleteMany({ where: { schoolId: id } });
            await tx.smsLog.deleteMany({ where: { schoolId: id } });
            await tx.setting.deleteMany({ where: { schoolId: id } });
            await tx.subscription.deleteMany({ where: { schoolId: id } });
            await tx.materialItem.deleteMany({ where: { schoolId: id } });
            await tx.book.deleteMany({ where: { schoolId: id } });
            await tx.room.deleteMany({ where: { schoolId: id } });

            // ── Structural entities (order matters) ─────────────────────────────
            await tx.term.deleteMany({ where: { academicYearId: { in: ayIds } } });
            await tx.class.deleteMany({ where: { schoolId: id } });
            await tx.subjectSection.deleteMany({ where: { sectionId: { in: sectionIds } } });
            await tx.subject.deleteMany({ where: { schoolId: id } });
            await tx.section.deleteMany({ where: { schoolId: id } });
            await tx.student.deleteMany({ where: { schoolId: id } });
            await tx.teacher.deleteMany({ where: { schoolId: id } });
            await tx.academicYear.deleteMany({ where: { schoolId: id } });
            await tx.user.deleteMany({ where: { schoolId: id } });

            // ── Finally the school itself ───────────────────────────────────────
            await tx.school.delete({ where: { id } });
        }, { timeout: 30000 });

        auditSAAction(req, 'DELETE', `École supprimée définitivement : ${school.name}`, {
            schoolId: id, schoolName: school.name, entity: 'School', entityId: id,
        }).catch(() => {});

        res.json({ success: true, message: `L'école "${school.name}" a été supprimée définitivement.` });
    } catch (error) { next(error); }
}

// ── toggleSAAdmin ─────────────────────────────────────────────────────────────
export async function toggleSAAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.userId;

        if (id === requestingUserId) {
            res.status(400).json({ error: { code: 'SELF_ACTION', message: 'Vous ne pouvez pas désactiver votre propre compte.' } });
            return;
        }

        const admin = await prisma.user.findUnique({ where: { id } });
        if (!admin || !admin.isSuperAdmin) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Admin introuvable.' } });
            return;
        }

        const updated = await prisma.user.update({ where: { id }, data: { isActive: !admin.isActive } });
        res.json({ success: true, isActive: updated.isActive });
    } catch (error) { next(error); }
}
