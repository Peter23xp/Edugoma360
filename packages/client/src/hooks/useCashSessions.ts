import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface CashSession {
  id: string;
  schoolId: string;
  date: string;
  cashierId: string;
  openingBalance: number;
  closingBalance?: number;
  totalReceived: number;
  totalSpent: number;
  theoreticalBalance: number;
  actualBalance?: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED' | 'VALIDATED';
  openedAt: string;
  closedAt?: string;
  movements: CashMovement[];
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'IN' | 'OUT';
  category: 'PAYMENT' | 'EXPENSE' | 'OPENING' | 'CLOSING';
  amount: number;
  balance: number;
  reference?: string;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
}

export function useCashSessions() {
  const queryClient = useQueryClient();

  const getCurrentSession = useQuery({
    queryKey: ['cash-sessions', 'current'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/cash-sessions/current');
        return data.session as CashSession;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  const openSession = useMutation({
    mutationFn: async (payload: { date?: string; openingBalance: number; observations?: string }) => {
      const { data } = await api.post('/cash-sessions/open', payload);
      return data.session as CashSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions', 'current'] });
    },
  });

  const recordExpense = useMutation({
    mutationFn: async ({ sessionId, ...payload }: {
      sessionId: string;
      type: string;
      amount: number;
      beneficiary: string;
      motif: string;
      receiptFile?: string;
    }) => {
      const { data } = await api.post(`/cash-sessions/${sessionId}/expense`, payload);
      return data.movement as CashMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions', 'current'] });
    },
  });

  const closeSession = useMutation({
    mutationFn: async ({ sessionId, ...payload }: {
      sessionId: string;
      actualBalance: number;
      denominations: Record<string, number>;
      discrepancyReason?: string;
      discrepancyDetails?: string;
    }) => {
      const { data } = await api.post(`/cash-sessions/${sessionId}/close`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions', 'current'] });
    },
  });

  return {
    getCurrentSession,
    openSession,
    recordExpense,
    closeSession,
  };
}
