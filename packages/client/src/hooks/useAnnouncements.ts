import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Announcement {
  id: string;
  priority: 'INFO' | 'URGENT' | 'CRITIQUE';
  titre: string;
  message: string;
  audience: string[];
  classIds: string[];
  startDate: string;
  endDate: string;
  isPinned: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'ARCHIVED';
  viewCount: number;
  createdBy?: { nom: string; role: string };
  createdAt: string;
}

export interface AnnouncementStats {
  total: number;
  active: number;
  scheduled: number;
  archived: number;
}

export function useAnnouncements(filters?: { priority?: string; status?: string }) {
  const queryClient = useQueryClient();

  const listQuery = useQuery<{ announcements: Announcement[]; stats: AnnouncementStats }>({
    queryKey: ['announcements', filters],
    queryFn: async () => {
      const { data } = await api.get('/announcements', { params: filters });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/announcements', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Annonce publiée avec succès');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Erreur création annonce'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const { data } = await api.put(`/announcements/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Annonce modifiée');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/announcements/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Annonce archivée');
    },
  });

  const recordView = async (id: string) => {
    try {
      await api.post(`/announcements/${id}/view`);
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
    } catch { /* silencieux */ }
  };

  return {
    announcements: listQuery.data?.announcements ?? [],
    stats: listQuery.data?.stats ?? { total: 0, active: 0, scheduled: 0, archived: 0 },
    isLoading: listQuery.isLoading,

    createAnnouncement: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateAnnouncement: updateMutation.mutateAsync,
    archiveAnnouncement: archiveMutation.mutateAsync,

    recordView,
  };
}

// Hook léger pour le dashboard
export function useActiveAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/announcements/active');
        return data;
      } catch {
        return [];
      }
    },
    refetchInterval: 60_000,
  });
}
