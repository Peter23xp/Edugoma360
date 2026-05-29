import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface MaintenanceRequest {
  id: string;
  titre: string;
  category: string;
  urgency: string;
  status: string;
  roomId: string | null;
  room: { name: string } | null;
  location: string | null;
  description: string;
  photoUrl: string | null;
  technicien: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  notes: string | null;
  reportedBy: { nom: string; postNom: string };
  resolvedAt: string | null;
  createdAt: string;
}

export interface MaintenanceStats {
  total: number;
  urgent: number;
  inProgress: number;
  resolvedThisMonth: number;
}

export interface MaintenanceFilters {
  status?: string;
  urgency?: string;
  roomId?: string;
}

export function useMaintenance(filters: MaintenanceFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.roomId) params.roomId = filters.roomId;
      const { data } = await api.get('/inventory/maintenance', { params });
      return data as { requests: MaintenanceRequest[]; stats: MaintenanceStats };
    },
  });

  const costsQuery = useQuery({
    queryKey: ['maintenance-costs'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/maintenance/costs');
      return data as { totalActual: number; totalEstimated: number; byCategory: Record<string, number>; count: number };
    },
  });

  const createRequest = useMutation({
    mutationFn: async (payload: FormData | {
      titre: string;
      category: string;
      roomId?: string;
      location?: string;
      urgency: string;
      description: string;
      estimatedCost?: number;
    }) => {
      const isFormData = payload instanceof FormData;
      const { data } = await api.post('/inventory/maintenance', payload, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return data.request;
    },
    onSuccess: () => {
      toast.success('Demande créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      status: string;
      technicien?: string;
      startDate?: string;
      endDate?: string;
      actualCost?: number;
      notes?: string;
      progress?: number;
    }) => {
      const { data } = await api.put(`/inventory/maintenance/${id}/status`, payload);
      return data.request;
    },
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-costs'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });

  return {
    requests: query.data?.requests || [],
    stats: query.data?.stats || { total: 0, urgent: 0, inProgress: 0, resolvedThisMonth: 0 },
    costs: costsQuery.data || { totalActual: 0, totalEstimated: 0, byCategory: {}, count: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createRequest,
    updateStatus,
  };
}
