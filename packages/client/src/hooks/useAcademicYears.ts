import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Term {
    id: string;
    number: number;
    startDate: string;
    endDate: string;
    status: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
}

export interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    type: 'TRIMESTRES' | 'SEMESTRES';
    isActive: boolean;
    isClosed: boolean;
    terms?: Term[];
    closedAt?: string;
    studentCount?: number;
    termCount?: number;
}

export interface AcademicYearsResponse {
    current: AcademicYear | null;
    past: AcademicYear[];
}

export function useAcademicYears() {
    const queryClient = useQueryClient();

    const query = useQuery<AcademicYearsResponse>({
        queryKey: ['academic-years'],
        queryFn: async () => {
            const res = await api.get('/academic-years');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/academic-years', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            toast.success("Année académique créée avec succès");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la création");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await api.put(`/academic-years/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            toast.success("Année académique mise à jour avec succès");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la mise à jour");
        }
    });

    const closeMutation = useMutation({
        mutationFn: async ({ id, ignoreUnpaidDebts }: { id: string, ignoreUnpaidDebts: boolean }) => {
            const res = await api.post(`/academic-years/${id}/close`, { ignoreUnpaidDebts });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            toast.success(`Année clôturée. ${data.statistics.admitted} admis, ${data.statistics.failed} ajournés.`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la clôture");
        }
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        createYear: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateYear: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        closeYear: closeMutation.mutateAsync,
        isClosing: closeMutation.isPending
    };
}
