import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import type { JustificationsResponse } from '@edugoma360/shared';

interface UseJustificationsFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export function useJustifications(filters: UseJustificationsFilters) {
  const queryClient = useQueryClient();

  const query = useQuery<JustificationsResponse>({
    queryKey: ['justifications', filters],
    queryFn: async () => {
      const { data } = await api.get('/attendance/justifications', { params: filters });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await api.put(`/attendance/justifications/${id}/approve`, { comment });
      return data;
    },
    onSuccess: () => {
      toast.success('Justificatif approuvé et absence mise à jour', {
        style: {
          background: '#1B5E20',
          color: '#fff',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['justifications'] });
      queryClient.invalidateQueries({ queryKey: ['absence-history'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'approbation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, rejectionReason, comment }: { id: string; rejectionReason: string; comment: string }) => {
      const { data } = await api.put(`/attendance/justifications/${id}/reject`, { rejectionReason, comment });
      return data;
    },
    onSuccess: () => {
      toast.success('Justificatif rejeté avec succès');
      queryClient.invalidateQueries({ queryKey: ['justifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    },
  });

  return {
    ...query,
    approveJustification: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectJustification: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}
