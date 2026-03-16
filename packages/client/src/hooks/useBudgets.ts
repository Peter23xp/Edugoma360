import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface BudgetCategory {
  category: string;
  budgeted: number;
  realized: number;
  variance: number;
  rate: number;
}

export interface BudgetMonth {
  month: string;
  monthNum: number;
  budgeted: number;
  realized: number;
}

export interface BudgetTracking {
  totalBudget: number;
  totalRealized: number;
  realizationRate: number;
  byCategory: BudgetCategory[];
  byMonth: BudgetMonth[];
  alerts: string[];
}

export interface Budget {
  id: string;
  academicYearId: string;
  monthlyDistribution: 'UNIFORM' | 'CUSTOM';
  categories: { id: string; name: string; amount: number }[];
  months: { id: string; month: number; amount: number }[];
  academicYear?: { label: string };
}

export function useBudgets(academicYearId?: string) {
  const queryClient = useQueryClient();
  const key = ['budgets', academicYearId ?? 'active'];

  const getBudget = useQuery({
    queryKey: key,
    queryFn: async () => {
      const url = academicYearId ? `/budgets/${academicYearId}` : '/budgets/';
      const { data } = await api.get(url);
      return data as {
        budget: Budget | null;
        tracking: BudgetTracking;
        academicYearId: string;
      };
    },
  });

  const upsertBudget = useMutation({
    mutationFn: async (payload: {
      academicYearId: string;
      categories: { name: string; amount: number }[];
      monthlyDistribution: 'UNIFORM' | 'CUSTOM';
      months?: { month: number; amount: number }[];
    }) => {
      const { data } = await api.post('/budgets/', payload);
      return data.budget as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return { getBudget, upsertBudget };
}
