import { z } from 'zod';

export const CreatePaymentDto = z.object({
  studentId: z.string().uuid(),
  feeIds: z.array(z.string().uuid()),
  amountPaid: z.number().int().positive('Le montant doit être positif'),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK']),
  transactionRef: z.string().optional(),
  paymentDate: z.string().optional(),
  observations: z.string().optional()
});
