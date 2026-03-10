import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const API_URL = '/assignments';

export interface MatrixFilters {
    academicYearId: string;
    sectionId?: string;
    classId?: string;
    searchTeacher?: string;
}

export function useAssignments(filters: MatrixFilters) {
    const queryClient = useQueryClient();

    // Fetch matrix data
    const matrixQuery = useQuery({
        queryKey: ['assignments', filters],
        queryFn: async () => {
            const response = await api.get(API_URL, { params: filters });
            return response.data;
        },
        enabled: !!filters.academicYearId,
    });

    // Create/Update assignment
    const assignMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post(API_URL, {
                ...data,
                academicYearId: filters.academicYearId
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            toast.success('Affectation enregistrée');
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                // Conflict handled by the component opening the warning modal
                return;
            }
            toast.error(error.response?.data?.error?.message || 'Erreur lors de l\'affectation');
        }
    });

    // Bulk assign
    const bulkAssignMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post(`${API_URL}/bulk`, {
                ...data,
                academicYearId: filters.academicYearId
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            toast.success('Affectations en masse réussies');
        }
    });

    // Remove assignment
    const removeMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`${API_URL}/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            toast.success('Affectation retirée');
        }
    });

    return {
        matrixData: matrixQuery.data,
        isLoading: matrixQuery.isLoading,
        error: matrixQuery.error,
        assign: assignMutation.mutateAsync,
        bulkAssign: bulkAssignMutation.mutateAsync,
        remove: removeMutation.mutateAsync,
        isAssigning: assignMutation.isPending || bulkAssignMutation.isPending,
    };
}
