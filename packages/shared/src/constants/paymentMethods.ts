export const PAYMENT_METHODS = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
  CHECK: 'Chèque',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;
