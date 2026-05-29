import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useSchoolStats(tab: string, academicYearId?: string) {
  return useQuery({
    queryKey: ['reports', 'stats', tab, academicYearId],
    queryFn: async () => {
      try {
        const { data } = await api.get('/reports/statistics', { params: { tab, academicYearId } });
        return data;
      } catch { return null; }
    },
    staleTime: 5 * 60 * 1000,
  });
}
