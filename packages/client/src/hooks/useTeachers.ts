import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const API_URL = '/teachers';

export interface TeacherFilters {
    search?: string;
    status?: string;
    subjectId?: string;
    section?: string;
    page?: number;
    limit?: number;
}

export function useTeachers(filters: TeacherFilters = {}) {
    const queryClient = useQueryClient();

    // Get paginated teachers list
    const teachersQuery = useQuery({
        queryKey: ['teachers', filters],
        queryFn: async () => {
            const { data } = await api.get(API_URL, { params: filters });
            return data;
        },
        placeholderData: (previousData) => previousData,
    });

    // Get a single teacher by ID
    const useTeacherById = (id: string | undefined) => useQuery({
        queryKey: ['teacher', id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get(`${API_URL}/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    // Create a new teacher
    const createMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post(API_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
    });

    // Update an existing teacher
    const updateMutation = useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const { data } = await api.put(`${API_URL}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            queryClient.invalidateQueries({ queryKey: ['teacher', variables.id] });
        },
    });

    // Archive (soft-delete) a teacher
    const archiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`${API_URL}/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
    });

    return {
        teachersQuery,
        useTeacherById,
        createMutation,
        updateMutation,
        archiveMutation,
    };
}
