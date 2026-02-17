import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type Currency = 'FC' | 'USD';

export type PaymentMode =
    | 'ESPECES'
    | 'AIRTEL_MONEY'
    | 'MPESA'
    | 'ORANGE_MONEY'
    | 'VIREMENT';

// ── FeeType Interface ─────────────────────────────────────────────────────────
export interface FeeType {
    id: string;
    schoolId: string;
    name: string;
    amount: number; // En FC (entiers)
    termNumber?: number | null; // 1, 2, 3 ou null si annuel
    isRequired: boolean;
    isActive: boolean;
}

// ── Payment Interface ─────────────────────────────────────────────────────────
export interface Payment {
    id: string;
    receiptNumber: string;
    studentId: string;
    feeTypeId: string;
    schoolId: string;
    academicYearId: string;
    amountDue: number; // FC
    amountPaid: number; // FC
    currency: Currency;
    exchangeRate?: number | null;
    paymentMode: PaymentMode;
    reference?: string | null;
    paidAt: Date | string;
    createdById: string;
    createdAt: Date | string;
}

// ── Student Balance ───────────────────────────────────────────────────────────
export interface StudentBalance {
    studentId: string;
    studentName: string;
    totalDue: number;
    totalPaid: number;
    balance: number; // totalDue - totalPaid
    payments: Payment[];
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
export const CreatePaymentSchema = z.object({
    studentId: z.string().uuid('Élève requis'),
    feeTypeId: z.string().uuid('Type de frais requis'),
    amountPaid: z.number().int().positive('Le montant doit être positif'),
    currency: z.enum(['FC', 'USD']).default('FC'),
    exchangeRate: z.number().positive().optional(),
    paymentMode: z.enum(['ESPECES', 'AIRTEL_MONEY', 'MPESA', 'ORANGE_MONEY', 'VIREMENT']),
    reference: z.string().optional(),
    paidAt: z.string().or(z.date()).optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

// ── Payment Mode Labels ───────────────────────────────────────────────────────
export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
    ESPECES: 'Espèces',
    AIRTEL_MONEY: 'Airtel Money',
    MPESA: 'M-Pesa',
    ORANGE_MONEY: 'Orange Money',
    VIREMENT: 'Virement Bancaire',
};
