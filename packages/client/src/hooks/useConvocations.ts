import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface ConvocationStudent {
  id: string;
  nom: string;
  classe: string;
  parents: Array<{ nom: string; phone: string | null; qualite: string }>;
  parentEmail: string | null;
}

export interface Convocation {
  id: string;
  numero: string;
  studentId: string;
  student: { nom: string; postNom: string; prenom?: string };
  className: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  parentQualite: string;
  motif: string;
  details: string;
  dateRendezVous: string;
  heureRendezVous: string;
  lieu: string;
  status: 'PENDING' | 'CONFIRMED' | 'ATTENDED' | 'MISSED' | 'CANCELLED';
  confirmedAt?: string;
  attendedAt?: string;
  pdfUrl?: string;
  emailSent: boolean;
  smsSent: boolean;
  notes?: string;
  actions: string;
  createdBy?: { nom: string; role: string };
  createdAt: string;
}

export interface ConvocationStats {
  total: number;
  pending: number;
  confirmed: number;
  attended: number;
  missed: number;
}

export function useConvocations(filters?: { motif?: string; status?: string; classId?: string; search?: string }) {
  const queryClient = useQueryClient();

  const listQuery = useQuery<{ convocations: Convocation[]; stats: ConvocationStats }>({
    queryKey: ['convocations', filters],
    queryFn: async () => {
      const { data } = await api.get('/convocations', { params: filters });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/convocations', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convocations'] });
      toast.success('Convocation créée et envoyée avec succès');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Erreur création convocation'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: string; status: string; notes?: string; actions?: string[] }) => {
      const { data } = await api.put(`/convocations/${id}/status`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convocations'] });
      toast.success('Statut mis à jour');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Erreur mise à jour'),
  });

  const searchStudents = async (q: string): Promise<ConvocationStudent[]> => {
    const { data } = await api.get('/convocations/search-students', { params: { q } });
    return data;
  };

  return {
    convocations: listQuery.data?.convocations ?? [],
    stats: listQuery.data?.stats ?? { total: 0, pending: 0, confirmed: 0, attended: 0, missed: 0 },
    isLoading: listQuery.isLoading,

    createConvocation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,

    searchStudents,
  };
}
