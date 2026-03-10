import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const BASE = '/absences';

export interface AbsenceFilters {
    teacherId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}

export function useAbsences(filters: AbsenceFilters = {}) {
    const queryClient = useQueryClient();

    // Get all leave requests
    const absencesQuery = useQuery({
        queryKey: ['absences', filters],
        queryFn: async () => {
            const { data } = await api.get(BASE, { params: filters });
            return data;
        },
    });

    // Get stats
    const statsQuery = useQuery({
        queryKey: ['absences-stats'],
        queryFn: async () => {
            const { data } = await api.get(`${BASE}/stats`);
            return data;
        },
    });

    // Get my balance (for teacher role)
    const balanceQuery = useQuery({
        queryKey: ['absences-balance'],
        queryFn: async () => {
            const { data } = await api.get(`${BASE}/my-balance`);
            return data;
        },
    });

    // Create leave request
    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post(BASE, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absences'] });
            queryClient.invalidateQueries({ queryKey: ['absences-stats'] });
            queryClient.invalidateQueries({ queryKey: ['absences-balance'] });
        },
    });

    // Approve a request
    const approveMutation = useMutation({
        mutationFn: async ({ id, observations }: { id: string; observations?: string }) => {
            const { data } = await api.put(`${BASE}/${id}/approve`, { observations });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absences'] });
            queryClient.invalidateQueries({ queryKey: ['absences-stats'] });
        },
    });

    // Reject a request
    const rejectMutation = useMutation({
        mutationFn: async ({ id, observations }: { id: string; observations: string }) => {
            const { data } = await api.put(`${BASE}/${id}/reject`, { observations });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absences'] });
            queryClient.invalidateQueries({ queryKey: ['absences-stats'] });
        },
    });

    // Cancel a request (teacher)
    const cancelMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`${BASE}/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absences'] });
            queryClient.invalidateQueries({ queryKey: ['absences-balance'] });
        },
    });

    return {
        absencesQuery,
        statsQuery,
        balanceQuery,
        createMutation,
        approveMutation,
        rejectMutation,
        cancelMutation,
    };
}
