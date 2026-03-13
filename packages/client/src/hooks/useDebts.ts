import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface DebtFilters {
  classId?: string;
  level?: 'LEGER' | 'MOYEN' | 'ELEVE';
  search?: string;
  minAmount?: number;
  page?: number;
  limit?: number;
}

export interface DebtItem {
  student: {
    id: string;
    nom: string;
    postNom: string;
    prenom?: string;
    matricule: string;
    className: string;
  };
  totalDebt: number;
  daysPastDue: number;
  level: 'LEGER' | 'MOYEN' | 'ELEVE';
  lastPaymentDate: string;
  blockedServices: string[];
}

export function useDebtsQuery(filters: DebtFilters) {
  return useQuery({
    queryKey: ['debts', filters],
    queryFn: async () => {
      const res = await api.get('/debts', { params: filters });
      return res.data;
    },
  });
}

export function useDebts() {
  const queryClient = useQueryClient();

  const getDebts = (filters: DebtFilters) => {
    return useQuery({
      queryKey: ['debts', filters],
      queryFn: async () => {
        const res = await api.get('/debts', { params: filters });
        return res.data;
      },
    });
  };

  const sendReminders = useMutation({
    mutationFn: async (body: { studentIds: string[]; channel: 'SMS' | 'EMAIL' | 'BOTH'; template: string }) => {
      const res = await api.post('/debts/send-reminders', body);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.sent} rappels envoyés avec succès!`);
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi des rappels");
    },
  });

  const createPaymentPlan = useMutation({
    mutationFn: async ({ studentId, data }: { studentId: string; data: any }) => {
      const res = await api.post(`/debts/${studentId}/payment-plan`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Plan d'apurement créé!");
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    onError: () => {
      toast.error("Erreur lors de la création du plan");
    },
  });

  return {
    getDebts,
    sendReminders,
    createPaymentPlan,
  };
}
