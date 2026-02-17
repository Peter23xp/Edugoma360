import { z } from 'zod';

export const CreatePaymentDto = z.object({
    studentId: z.string().uuid(),
    feeTypeId: z.string().uuid(),
    amountPaid: z.number().int().positive('Le montant doit être positif'),
    currency: z.enum(['FC', 'USD']).default('FC'),
    exchangeRate: z.number().positive().optional(),
    paymentMode: z.enum(['ESPECES', 'AIRTEL_MONEY', 'MPESA', 'ORANGE_MONEY', 'VIREMENT']),
    reference: z.string().optional(),
    paidAt: z.string().optional(),
});

export const FinanceQueryDto = z.object({
    page: z.coerce.number().optional().default(1),
    perPage: z.coerce.number().optional().default(20),
    studentId: z.string().uuid().optional(),
    feeTypeId: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    paymentMode: z.enum(['ESPECES', 'AIRTEL_MONEY', 'MPESA', 'ORANGE_MONEY', 'VIREMENT']).optional(),
});
