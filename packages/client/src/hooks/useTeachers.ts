import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { TeacherFilters } from '@edugoma360/shared';

const API_URL = '/api/teachers';

export function useTeachers(filters: TeacherFilters = {}) {
    const queryClient = useQueryClient();

    // Get paginated teachers
    const teachersQuery = useQuery({
        queryKey: ['teachers', filters],
        queryFn: async () => {
            const { data } = await axios.get(API_URL, { params: filters });
            return data;
        },
        placeholderData: (previousData) => previousData,
    });

    // Get teacher by ID
    const useTeacherById = (id: string | undefined) => useQuery({
        queryKey: ['teacher', id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await axios.get(`${API_URL}/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    // Archive teacher
    const archiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await axios.delete(`${API_URL}/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
    });

    return {
        teachersQuery,
        useTeacherById,
        archiveMutation,
    };
}
