import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  goodQty: number;
  usedQty: number;
  brokenQty: number;
  totalQty: number;
  unitValue: number;
  totalValue: number;
  minStock: number;
  isLowStock: boolean;
  location: string | null;
  acquiredAt: string | null;
  notes: string | null;
  updatedAt: string;
  movements: StockMovement[];
}

export interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  fromStatus: string | null;
  toStatus: string | null;
  reason: string;
  date: string;
  createdAt: string;
  createdBy: { nom: string; postNom: string };
}

export interface MaterialStats {
  totalItems: number;
  goodItems: number;
  usedItems: number;
  brokenItems: number;
  totalValue: number;
}

export interface MaterialFilters {
  category?: string;
  status?: string;
  search?: string;
}

export function useMaterial(filters: MaterialFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['material', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/inventory/material', { params });
      return data as { items: MaterialItem[]; stats: MaterialStats };
    },
  });

  const createItem = useMutation({
    mutationFn: async (payload: {
      name: string;
      category: string;
      goodQty: number;
      usedQty: number;
      brokenQty: number;
      unitValue: number;
      minStock: number;
      location?: string;
      acquiredAt?: string;
      notes?: string;
    }) => {
      const { data } = await api.post('/inventory/material', payload);
      return data.item;
    },
    onSuccess: () => {
      toast.success('Article ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['material'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<{
      name: string;
      category: string;
      goodQty: number;
      usedQty: number;
      brokenQty: number;
      unitValue: number;
      minStock: number;
      location: string;
      notes: string;
    }>) => {
      const { data } = await api.put(`/inventory/material/${id}`, payload);
      return data.item;
    },
    onSuccess: () => {
      toast.success('Article mis à jour');
      queryClient.invalidateQueries({ queryKey: ['material'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/material/${id}`);
    },
    onSuccess: () => {
      toast.success('Article supprimé');
      queryClient.invalidateQueries({ queryKey: ['material'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });

  const createMovement = useMutation({
    mutationFn: async ({ itemId, ...payload }: {
      itemId: string;
      type: string;
      quantity: number;
      fromStatus?: string;
      toStatus?: string;
      reason: string;
      date: string;
    }) => {
      const { data } = await api.post(`/inventory/material/${itemId}/movement`, payload);
      return data.item;
    },
    onSuccess: () => {
      toast.success('Mouvement enregistré');
      queryClient.invalidateQueries({ queryKey: ['material'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du mouvement');
    },
  });

  const exportMaterial = async () => {
    const { data } = await api.get('/inventory/material', { params: filters });
    return data;
  };

  return {
    items: query.data?.items || [],
    stats: query.data?.stats || { totalItems: 0, goodItems: 0, usedItems: 0, brokenItems: 0, totalValue: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createItem,
    updateItem,
    deleteItem,
    createMovement,
    exportMaterial,
  };
}
