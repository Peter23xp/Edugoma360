import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
export interface PaymentHistoryFilters {
  startDate?: string;
  endDate?: string;
  studentId?: string;
  classId?: string;
  paymentMethod?: string;
  cashierId?: string;
  receiptNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentHistoryItem {
  id: string;
  receiptNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentMode?: string;
  paymentDate?: string;
  transactionRef?: string | null;
  reference?: string | null;
  observations?: string | null;
  status: string;
  paidAt: string;
  createdAt: string;
  receiptUrl?: string | null;
  student: {
    id: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    matricule: string;
    enrollments?: Array<{ class?: { id: string; name: string } }>;
  };
  cashier?: {
    id: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    role: string;
  };
  feePayments?: Array<{
    id: string;
    amount: number;
    fee: {
      id: string;
      name: string;
      amount: number;
    };
  }>;
}

export interface PaymentHistoryResponse {
  data: PaymentHistoryItem[];
  total: number;
  page: number;
  pages: number;
  stats: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
  };
}

export interface PaymentDetailResponse {
  payment: PaymentHistoryItem & {
    student: PaymentHistoryItem['student'];
    cashier: PaymentHistoryItem['cashier'];
    feePayments: NonNullable<PaymentHistoryItem['feePayments']>;
  };
}

export interface CancelPaymentDto {
  reason: string;
  details: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function usePaymentHistory() {
  const queryClient = useQueryClient();

  /** List payments with filters + pagination */
  const getPayments = (filters: PaymentHistoryFilters) => {
    return useQuery<PaymentHistoryResponse>({
      queryKey: ['payment-history', filters],
      queryFn: async () => {
        const params: Record<string, string | number> = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.studentId) params.studentId = filters.studentId;
        if (filters.classId) params.classId = filters.classId;
        if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
        if (filters.cashierId) params.cashierId = filters.cashierId;
        if (filters.receiptNumber) params.receiptNumber = filters.receiptNumber;
        if (filters.search) params.search = filters.search;
        if (filters.page) params.page = filters.page;
        params.limit = filters.limit || 50;

        const res = await api.get('/payments', { params });
        const payload = res.data;
        console.log('[usePaymentHistory] payload:', payload);

        // Extract list regardless of structure (data, payments, or direct array)
        let paymentsList: PaymentHistoryItem[] = [];
        if (Array.isArray(payload)) {
          paymentsList = payload;
        } else if (Array.isArray(payload.data)) {
          paymentsList = payload.data;
        } else if (Array.isArray(payload.payments)) {
          paymentsList = payload.payments;
        }

        return {
          data: paymentsList,
          total: payload.total ?? paymentsList.length,
          page: payload.page ?? 1,
          pages: payload.pages ?? 1,
          stats: payload.stats ?? { todayTotal: 0, weekTotal: 0, monthTotal: 0 },
        };
      },
      staleTime: 30_000,
    });
  };

  /** Get single payment details */
  const getPaymentDetail = (paymentId: string | null) => {
    return useQuery<PaymentDetailResponse>({
      queryKey: ['payment-detail', paymentId],
      queryFn: async () => {
        const res = await api.get(`/payments/${paymentId}`);
        return res.data?.data ?? res.data;
      },
      enabled: !!paymentId,
    });
  };

  /** Cancel a payment */
  const cancelPayment = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CancelPaymentDto }) => {
      const res = await api.post(`/payments/${id}/cancel`, dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Paiement annulé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['payment-detail'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de l'annulation");
    },
  });

  /** Export payments to Excel */
  const exportPayments = async (filters: PaymentHistoryFilters) => {
    const params: Record<string, string | number> = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.studentId) params.studentId = filters.studentId;
    if (filters.classId) params.classId = filters.classId;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.cashierId) params.cashierId = filters.cashierId;
    if (filters.receiptNumber) params.receiptNumber = filters.receiptNumber;

    const res = await api.get('/payments/export', {
      params,
      responseType: 'blob',
    });

    // Trigger download
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    a.href = url;
    a.download = `Paiements_${dd}-${mm}-${yyyy}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /** Generate periodic report PDF */
  const generateReport = async (filters: PaymentHistoryFilters) => {
    const params: Record<string, string | number> = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.classId) params.classId = filters.classId;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

    const res = await api.get('/payments/report', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    window.URL.revokeObjectURL(url);
  };

  return {
    getPayments,
    getPaymentDetail,
    cancelPayment,
    exportPayments,
    generateReport,
  };
}
