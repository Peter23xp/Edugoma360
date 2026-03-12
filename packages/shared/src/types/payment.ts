import { PaymentMethod } from '../constants/paymentMethods';

export interface FeeDue {
  feeId: string;
  name: string;
  amountDue: number;
  amountPaid: number;
  remainingBalance: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
}

export interface StudentFeesDueResponse {
  fees: FeeDue[];
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface CreatePaymentDto {
  studentId: string;
  feeIds: string[];
  amountPaid: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  observations?: string;
  isOffline?: boolean;
}
