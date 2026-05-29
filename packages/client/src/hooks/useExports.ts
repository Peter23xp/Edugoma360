import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useExports() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['exports', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/exports/history');
      return data;
    },
  });

  const schedulesQuery = useQuery({
    queryKey: ['exports', 'schedules'],
    queryFn: async () => {
      const { data } = await api.get('/exports/schedules');
      return data;
    },
  });

  const quickExportMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/exports/quick', body);
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['exports', 'history'] });
      if (result.fileUrl) {
        const a = document.createElement('a');
        a.href = result.fileUrl;
        a.download = result.fileUrl.split('/').pop() ?? 'export';
        a.click();
        toast.success('Export téléchargé avec succès');
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || "Erreur lors de l'export"),
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/exports/schedules', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports', 'schedules'] });
      toast.success('Export planifié avec succès');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/exports/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports', 'schedules'] });
      toast.success('Planification supprimée');
    },
  });

  return {
    history: historyQuery.data ?? [],
    isLoadingHistory: historyQuery.isLoading,
    schedules: schedulesQuery.data ?? [],
    isLoadingSchedules: schedulesQuery.isLoading,
    quickExport: quickExportMutation.mutateAsync,
    isExporting: quickExportMutation.isPending,
    createSchedule: createScheduleMutation.mutateAsync,
    isCreatingSchedule: createScheduleMutation.isPending,
    deleteSchedule: deleteScheduleMutation.mutateAsync,
  };
}
