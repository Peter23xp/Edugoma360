import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Fee {
  id: string;
  schoolId: string;
  academicYearId: string;
  type: string;
  name: string;
  amount: number;
  scope: string;
  sectionIds: string[];
  classIds: string[];
  frequency: string;
  months: number[];
  termNumber: number | null;
  isRequired: boolean;
  observations: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FeeStats {
  total: number;
  totalAmount: number;
  byType: Record<string, number>;
}

export interface FeesResponse {
  fees: Fee[];
  stats: FeeStats;
}

export function useFees(filters: {
  academicYearId?: string;
  scope?: string;
  type?: string;
} = {}) {
  const queryClient = useQueryClient();

  // List all fees
  const feesQuery = useQuery({
    queryKey: ['fees', filters],
    queryFn: async (): Promise<FeesResponse> => {
      const { data } = await api.get('/fees', { params: filters });
      return data.data || data;
    },
  });

  // Create fee
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/fees', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Frais créé avec succès');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erreur lors de la création du frais");
    },
  });

  // Update fee
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.put(`/fees/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Frais modifié avec succès');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    },
  });

  // Delete fee
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/fees/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Frais supprimé');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  // Archive fee
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/fees/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Frais archivé avec succès');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erreur lors de l'archivage");
    },
  });

  // Create from template
  const templateMutation = useMutation({
    mutationFn: async (templateName: string) => {
      const { data } = await api.post('/fees/template', { templateName });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      const count = data.data?.count || data.count;
      toast.success(`${count} frais créés depuis le modèle`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erreur lors de la création depuis le modèle");
    },
  });

  return {
    feesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    archiveMutation,
    templateMutation,
  };
}
