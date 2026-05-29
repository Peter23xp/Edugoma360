import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useReportGenerator() {
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: ['reports', 'saved'],
    queryFn: async () => {
      const { data } = await api.get('/reports/saved');
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/reports/generate', body);
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'saved'] });
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
        toast.success('PDF généré avec succès');
      }
      if (result.excelUrl) {
        const a = document.createElement('a');
        a.href = result.excelUrl;
        a.download = result.excelUrl.split('/').pop() ?? 'rapport.xlsx';
        a.click();
        toast.success('Excel généré avec succès');
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Erreur génération rapport'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reports/saved/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'saved'] });
      toast.success('Rapport supprimé');
    },
  });

  return {
    savedReports: savedQuery.data ?? [],
    isLoadingSaved: savedQuery.isLoading,
    generateReport: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    deleteReport: deleteMutation.mutateAsync,
  };
}
