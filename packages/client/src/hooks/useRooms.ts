import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: string;
  building: string | null;
  floor: string | null;
  assignedClassId: string | null;
  assignedClass: { id: string; name: string; enrollments?: { id: string }[] } | null;
  responsableId: string | null;
  responsable: {
    id: string;
    nom: string;
    postNom: string;
    prenom?: string;
    telephone?: string;
    email?: string;
  } | null;
  equipments: string[];
  stateDescription: string | null;
  currentOccupancy: number;
  maintenanceRequestsCount: number;
}

export interface RoomStats {
  total: number;
  good: number;
  degraded: number;
  closed: number;
}

export interface OccupancyData {
  id: string;
  name: string;
  capacity: number;
  className: string | null;
  effectif: number;
  occupancyRate: number;
}

export function useRooms(filters: { type?: string; status?: string } = {}) {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/inventory/rooms', { params });
      return data as { rooms: Room[]; stats: RoomStats };
    },
  });

  const occupancyQuery = useQuery({
    queryKey: ['rooms-occupancy'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/rooms/occupancy');
      return data.occupancy as OccupancyData[];
    },
  });

  const createRoom = useMutation({
    mutationFn: async (payload: {
      name: string;
      type: string;
      capacity: number;
      status?: string;
      building?: string;
      floor?: string;
      classId?: string;
      responsableId?: string;
      equipments?: string[];
      stateDescription?: string;
    }) => {
      const { data } = await api.post('/inventory/rooms', payload);
      return data.room;
    },
    onSuccess: () => {
      toast.success('Salle ajoutée avec succès');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-occupancy'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<{
      name: string;
      type: string;
      capacity: number;
      status: string;
      building: string;
      floor: string;
      classId: string | null;
      responsableId: string | null;
      equipments: string[];
      stateDescription: string;
    }>) => {
      const { data } = await api.put(`/inventory/rooms/${id}`, payload);
      return data.room;
    },
    onSuccess: () => {
      toast.success('Salle mise à jour');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-occupancy'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/rooms/${id}`);
    },
    onSuccess: () => {
      toast.success('Salle supprimée');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });

  return {
    rooms: roomsQuery.data?.rooms || [],
    stats: roomsQuery.data?.stats || { total: 0, good: 0, degraded: 0, closed: 0 },
    occupancy: occupancyQuery.data || [],
    isLoading: roomsQuery.isLoading,
    isError: roomsQuery.isError,
    refetch: roomsQuery.refetch,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
