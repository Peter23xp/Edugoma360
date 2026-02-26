import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CreateTeacherDto, UpdateTeacherDto } from '../../../../server/src/modules/teachers/teachers.dto';

const API_URL = '/api/teachers';

export function useTeacherForm() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Create teacher
    const createMutation = useMutation({
        mutationFn: async (data: CreateTeacherDto) => {
            const response = await axios.post(API_URL, data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            // Redirect will be handled in the component
        },
    });

    // Update teacher
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTeacherDto }) => {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            queryClient.invalidateQueries({ queryKey: ['teacher', variables.id] });
        },
    });

    return {
        createMutation,
        updateMutation,
        isLoading: createMutation.isPending || updateMutation.isPending,
        error: createMutation.error || updateMutation.error,
    };
}
