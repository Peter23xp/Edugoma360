import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { CreatePaymentDto, StudentFeesDueResponse } from '@edugoma360/shared';

export function usePayments() {
  const queryClient = useQueryClient();

  const getFeesDue = (studentId?: string, enabled = true) => {
    return useQuery({
      queryKey: ['fees-due', studentId],
      queryFn: async () => {
        if (!studentId) return null;
        const res = await api.get(`/payments/students/${studentId}/fees-due`);
        return res.data as StudentFeesDueResponse;
      },
      enabled: enabled && !!studentId,
    });
  };

  const createPayment = useMutation({
    mutationFn: async (dto: CreatePaymentDto) => {
      const res = await api.post('/payments', dto);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['fees-due'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création du paiement');
    }
  });

  return {
    getFeesDue,
    createPayment
  };
}
