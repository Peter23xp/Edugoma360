import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import prisma from '../../lib/prisma';
import { flexpayService } from './flexpay.service';
import { stripe } from '../../lib/stripe-client';
import { env } from '../../config/env';
import { notifyPaymentSuccess, notifyPaymentFailed, notifyNewSchool } from '../notifications/notification.service';

// ── Zod Schemas for Validation ────────────────────────────────────────────────
const InitiatePaymentSchema = z.object({
    planSlug: z.string({ required_error: 'La formule est requise' }),
    currency: z.enum(['USD', 'CDF'], { required_error: 'La devise doit être USD ou CDF' }),
    phone: z.string({ required_error: 'Le numéro de téléphone est requis' })
        .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Numéro de téléphone invalide. Ex: +243999999999' }),
});

/**
 * initiatePayment
 *
 * POST /api/billing/initiate
 * Secure endpoint to start a Mobile Money payment process.
 */
export async function initiatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const schoolId = req.school.id;
        const { planSlug, currency, phone } = InitiatePaymentSchema.parse(req.body);

        // 1. Fetch the subscription plan details
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { slug: planSlug },
        });

        if (!plan || !plan.isActive) {
            res.status(404).json({ error: { code: 'PLAN_NOT_FOUND', message: 'Formule d\'abonnement introuvable ou inactive' } });
            return;
        }

        // Calculate final price based on selected currency
        const price = currency === 'USD' ? plan.priceUSD : plan.priceCDF;

        // 2. Generate a unique transaction reference
        const reference = `EDU-${schoolId.slice(0, 6).toUpperCase()}-${Date.now()}`;

        // 3. Create a pending Subscription record
        const now = new Date();
        const durationDays = plan.durationDays;
        const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const subscription = await prisma.subscription.create({
            data: {
                schoolId,
                planId: plan.id,
                startDate: now,
                endDate,
                status: 'PENDING',
                amountPaid: 0, // Remains 0 until success is confirmed
                currency,
                paymentMethod: 'FLEXPAY',
                notes: `En attente de paiement FlexPay RDC pour la formule ${plan.name}`,
            },
        });

        // 4. Trigger payment registration on FlexPay Service
        const callbackUrl = `${req.protocol}://${req.get('host')}/api/public/billing/webhook/flexpay`;
        const payment = await flexpayService.initPayment({
            amount: price,
            currency,
            phone,
            reference,
            description: `EduGoma 360 - Renouvellement ${plan.name}`,
            callbackUrl,
        });

        // 5. Update subscription with orderNumber returned as paymentRef
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                paymentRef: payment.orderNumber,
                notes: `Référence FlexPay: ${payment.orderNumber}. En attente de validation...`,
            },
        });

        res.status(200).json({
            success: true,
            paymentUrl: payment.paymentUrl,
            orderNumber: payment.orderNumber,
            reference,
            amount: price,
            currency,
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            res.status(422).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Données invalides',
                    fields: error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
            });
            return;
        }
        next(error);
    }
}

/**
 * getPaymentStatus
 *
 * GET /api/billing/status/:orderNum
 * Status check endpoint. Polls FlexPay gateway status and updates DB if successful.
 */
export async function getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const schoolId = req.school.id;
        const { orderNum } = req.params;

        // Find the subscription first
        const subscription = await prisma.subscription.findFirst({
            where: {
                schoolId,
                paymentRef: orderNum,
            },
        });

        if (!subscription) {
            res.status(404).json({ error: { code: 'TRANSACTION_NOT_FOUND', message: 'Transaction introuvable pour cette école.' } });
            return;
        }

        // If it's already active, return success directly
        if (subscription.status === 'ACTIVE') {
            res.status(200).json({ success: true, status: 'SUCCESSFUL', subscription });
            return;
        }

        // Call the service to check live status
        const liveStatus = await flexpayService.checkPaymentStatus(orderNum);

        if (liveStatus === 'SUCCESSFUL') {
            // Find the chosen plan to get price
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id: subscription.planId || undefined },
            });

            if (plan) {
                const amountPaid = subscription.currency === 'USD' ? plan.priceUSD : plan.priceCDF;
                await activateSubscription(schoolId, plan.id, amountPaid, orderNum);
                
                const updatedSub = await prisma.subscription.findUnique({ where: { id: subscription.id } });
                res.status(200).json({ success: true, status: 'SUCCESSFUL', subscription: updatedSub });
                return;
            }
        } else if (liveStatus === 'FAILED') {
            // Mark transaction as failed in DB
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'EXPIRED', // Map to expired/failed status
                    notes: 'Paiement décliné par FlexPay',
                },
            });
            res.status(200).json({ success: true, status: 'FAILED' });
            return;
        }

        res.status(200).json({ success: true, status: 'PENDING' });
    } catch (error) {
        next(error);
    }
}

/**
 * getPaymentHistory
 *
 * GET /api/billing/history
 * Returns the history of subscription purchases for this school.
 */
export async function getPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const history = await prisma.subscription.findMany({
            where: { schoolId: req.school.id },
            include: {
                school: {
                    select: {
                        plan: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Clean plan details mapping
        const mapped = history.map((sub: any) => ({
            id: sub.id,
            startDate: sub.startDate,
            endDate: sub.endDate,
            status: sub.status,
            amountPaid: sub.amountPaid,
            currency: sub.currency,
            paymentRef: sub.paymentRef,
            paymentMethod: sub.paymentMethod,
            notes: sub.notes,
            createdAt: sub.createdAt,
            planName: sub.school?.plan?.name || 'Inconnu',
        }));

        res.status(200).json({ success: true, data: mapped });
    } catch (error) {
        next(error);
    }
}

/**
 * handleFlexPayWebhook
 *
 * POST /api/public/billing/webhook/flexpay
 * Completely public webhook receiver to handle instant FlexPay push events.
 */
export async function handleFlexPayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const signatureHeader = req.headers['x-flexpay-signature'] as string || '';
        const rawBody = JSON.stringify(req.body);

        // 1. Verify HMAC integrity
        const isValid = flexpayService.verifyWebhookSignature(rawBody, signatureHeader);
        if (!isValid) {
            res.status(401).json({ error: 'Signature Webhook invalide' });
            return;
        }

        const { reference, orderNumber, status, currency, amount } = req.body;

        if (status === 'SUCCESSFUL') {
            // Find subscription where generated reference or orderNumber matches
            const sub = await prisma.subscription.findFirst({
                where: {
                    OR: [
                        { paymentRef: orderNumber },
                        { paymentRef: reference },
                    ],
                },
            });

            if (sub && sub.status === 'PENDING') {
                const amountPaid = amount ? parseFloat(amount) : sub.amountPaid;
                await activateSubscription(sub.schoolId, sub.planId!, amountPaid, reference || orderNumber);
                const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId! } });
                notifyPaymentSuccess(sub.schoolId, plan?.name ?? 'inconnu', amountPaid, sub.currency).catch(() => {});
                console.log(`[FLEXPAY WEBHOOK] Subscription successfully activated for school ${sub.schoolId}`);
            }
        }

        res.status(200).json({ success: true, message: 'Webhook traité avec succès' });
    } catch (error) {
        next(error);
    }
}

/**
 * getBillingInfo
 *
 * GET /api/billing/info
 * Returns the school's active plan, latest subscription, student counts, and SMS logs used.
 */
export async function getBillingInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const schoolId = req.school.id;

        // 1. Fetch school with its plan details
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: {
                plan: true,
            },
        });

        if (!school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        // 2. Fetch the latest subscription
        const latestSubscription = await prisma.subscription.findFirst({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });

        // 3. Count active students
        const studentCount = await prisma.student.count({
            where: { schoolId, isActive: true },
        });

        // 4. Count SMS logs sent this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const smsCount = await prisma.smsLog.count({
            where: {
                schoolId,
                sentAt: { gte: startOfMonth },
            },
        });

        res.status(200).json({
            success: true,
            data: {
                plan: school.plan ? {
                    id: school.plan.id,
                    name: school.plan.name,
                    slug: school.plan.slug,
                    priceUSD: school.plan.priceUSD,
                    priceCDF: school.plan.priceCDF,
                    maxStudents: school.plan.maxStudents,
                    maxTeachers: school.plan.maxTeachers,
                    maxSmsPerMonth: school.plan.maxSmsPerMonth,
                    durationDays: school.plan.durationDays,
                } : null,
                latestSubscription,
                trialEndsAt: school.trialEndsAt,
                studentsUsed: studentCount,
                smsUsed: smsCount,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * createStripeCheckout
 *
 * POST /api/billing/stripe/checkout
 * Creates a Stripe Checkout session and returns the URL.
 */
export async function createStripeCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const { planSlug } = z.object({ planSlug: z.string() }).parse(req.body);
        const schoolId = req.school.id;

        const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
        if (!plan || !plan.isActive) {
            res.status(404).json({ error: { code: 'PLAN_NOT_FOUND', message: 'Formule introuvable' } });
            return;
        }

        const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, email: true } });

        const successUrl = `${env.CLIENT_URL}/billing/callback?provider=stripe&session={CHECKOUT_SESSION_ID}`;
        const cancelUrl  = `${env.CLIENT_URL}/billing`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: school?.email ?? undefined,
            metadata: { schoolId, planSlug, planId: plan.id },
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(plan.priceUSD * 100),
                    product_data: {
                        name: `EduGoma 360 — ${plan.name}`,
                        description: `Abonnement ${plan.durationDays} jours · ${plan.maxStudents === -1 ? 'Illimité' : plan.maxStudents} élèves`,
                    },
                },
                quantity: 1,
            }],
            success_url: successUrl,
            cancel_url:  cancelUrl,
        });

        // Create pending subscription
        const now = new Date();
        const endDate = new Date(now.getTime() + plan.durationDays * 86400000);
        const sub = await prisma.subscription.create({
            data: {
                schoolId, planId: plan.id, startDate: now, endDate,
                status: 'PENDING', amountPaid: 0, currency: 'USD',
                paymentMethod: 'STRIPE', paymentRef: session.id,
                notes: `Session Stripe: ${session.id}`,
            },
        });

        res.json({ success: true, checkoutUrl: session.url, sessionId: session.id, subscriptionId: sub.id });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(422).json({ error: { code: 'VALIDATION_ERROR', fields: error.errors } });
            return;
        }
        next(error);
    }
}

/**
 * getStripeStatus
 *
 * GET /api/billing/stripe/status/:sessionId
 * Polls Stripe session status and activates subscription if paid.
 */
export async function getStripeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.school) {
            res.status(404).json({ error: { code: 'SCHOOL_NOT_FOUND', message: 'École non identifiée' } });
            return;
        }

        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const sub = await prisma.subscription.findFirst({
                where: { schoolId: req.school.id, paymentRef: sessionId, status: 'PENDING' },
            });
            if (sub) {
                const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId! } });
                if (plan) await activateSubscription(req.school.id, plan.id, plan.priceUSD, sessionId);
            }
            res.json({ success: true, status: 'SUCCESSFUL' });
        } else if (session.status === 'expired') {
            res.json({ success: true, status: 'FAILED' });
        } else {
            res.json({ success: true, status: 'PENDING' });
        }
    } catch (error) { next(error); }
}

/**
 * handleStripeWebhook
 *
 * POST /api/public/billing/webhook/stripe
 * Stripe webhook — requires raw body for signature verification.
 */
export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const sig = req.headers['stripe-signature'] as string;
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
        } catch {
            res.status(400).json({ error: 'Signature webhook Stripe invalide' });
            return;
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const { schoolId, planId } = session.metadata ?? {};
            if (schoolId && planId && session.payment_status === 'paid') {
                const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
                if (plan) {
                    const amountPaid = (session.amount_total ?? 0) / 100;
                    await activateSubscription(schoolId, planId, amountPaid, session.id);
                }
            }
        }

        res.json({ received: true });
    } catch (error) { next(error); }
}

/**
 * createStripeRefund
 *
 * POST /api/superadmin/billing/refund/:subscriptionId
 * SA-only: refund a Stripe payment.
 */
export async function createStripeRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { subscriptionId } = req.params;
        const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
        if (!sub || sub.paymentMethod !== 'STRIPE' || !sub.paymentRef) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction Stripe introuvable.' } });
            return;
        }
        const session = await stripe.checkout.sessions.retrieve(sub.paymentRef);
        if (!session.payment_intent) {
            res.status(400).json({ error: { code: 'NO_PAYMENT_INTENT', message: 'Aucun PaymentIntent lié à cette session.' } });
            return;
        }
        const refund = await stripe.refunds.create({ payment_intent: session.payment_intent as string });
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'EXPIRED', notes: `Remboursé via Stripe (ref: ${refund.id})` },
        });
        res.json({ success: true, refundId: refund.id });
    } catch (error) { next(error); }
}

/**
 * activateSubscription
 *
 * Helper function to atomically activate a PENDING subscription.
 */
export async function activateSubscription(
    schoolId: string,
    planId: string,
    amountPaid: number,
    reference: string,
): Promise<void> {
    // 1. Find the pending subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            schoolId,
            status: 'PENDING',
            OR: [
                { paymentRef: reference },
                { id: reference },
            ],
        },
    });

    if (!subscription) {
        throw new Error(`Aucun abonnement en attente trouvé pour la référence : ${reference}`);
    }

    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
    });

    if (!plan) {
        throw new Error(`Formule d'abonnement introuvable pour l'id : ${planId}`);
    }

    // 2. Perform atomic activation block
    await prisma.$transaction(async (tx) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        // Update Subscription details
        await tx.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                startDate: now,
                endDate,
                amountPaid,
                paymentMethod: 'FLEXPAY',
                notes: `Abonnement activé le ${now.toLocaleDateString('fr-FR')} via FlexPay RDC (Ref: ${reference})`,
            },
        });

        // Update School plan reference
        await tx.school.update({
            where: { id: schoolId },
            data: {
                planId: plan.id,
                trialEndsAt: null, // End trial period since school paid
            },
        });
    });
}
