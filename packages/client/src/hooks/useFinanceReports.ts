
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface FinanceDashboardData {
  kpis: {
    totalRevenue: number;
    totalDebts: number;
    recoveryRate: number;
    avgRevenuePerStudent: number;
    paymentsCount: number;
    avgPaymentAmount: number;
  };
  revenueEvolution: Array<{ month: string; amount: number }>;
  revenueByFeeType: Array<{ type: string; amount: number }>;
  revenueByClass: Array<{ className: string; amount: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
}

export function useFinanceReports() {
  const getDashboard = (startDate: string, endDate: string) => {
    return useQuery<FinanceDashboardData>({
      queryKey: ['finance-dashboard', startDate, endDate],
      queryFn: async () => {
        const res = await api.get('/finance/dashboard', { params: { startDate, endDate } });
        return res.data;
      }
    });
  };

  const generateReport = useMutation({
    mutationFn: async (body: { type: string, startDate: string, endDate: string, sections: string[], format: string }) => {
       const res = await api.post('/finance/reports/generate', body);
       return res.data;
    },
    onSuccess: (data) => {
       toast.success("Rapport généré avec succès!");
       if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
       }
    },
    onError: () => {
       toast.error("Erreur lors de la génération du rapport");
    }
  });

  return { getDashboard, generateReport };
}
