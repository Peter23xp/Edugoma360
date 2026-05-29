import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface DashboardKPIs {
  totalStudents: number;
  totalClasses: number;
  presenceRate: number;
  paymentRate: number;
  totalTeachers: number;
  avgGrade: number;
  revenueThisMonth: number;
  unpaidDebts: number;
  trends: { studentsTrend: number; presenceTrend: number; paymentTrend: number; gradeTrend: number };
}

export interface DashboardData {
  kpis: DashboardKPIs;
  presenceChart: Array<{ date: string; taux: number; objectif: number }>;
  financeChart: { collected: number; expected: number; debts: number };
  topClasses: Array<{ rang: number; name: string; section: string; presenceRate: number; avgGrade: number; paymentRate: number; status: string }>;
  alerts: Array<{ id: string; severity: string; message: string; count?: number; link?: string }>;
  recentActivity: Array<{ id: string; type: string; message: string; user: string; createdAt: string }>;
}

export function useDashboardStats() {
  const queryClient = useQueryClient();

  const query = useQuery<DashboardData>({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        return data;
      } catch {
        return {
          kpis: { totalStudents: 0, totalClasses: 0, presenceRate: 0, paymentRate: 0, totalTeachers: 0, avgGrade: 0, revenueThisMonth: 0, unpaidDebts: 0, trends: { studentsTrend: 0, presenceTrend: 0, paymentTrend: 0, gradeTrend: 0 } },
          presenceChart: [],
          financeChart: { collected: 0, expected: 0, debts: 0 },
          topClasses: [],
          alerts: [],
          recentActivity: [],
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard'] });

  return { data: query.data, isLoading: query.isLoading, refresh };
}
