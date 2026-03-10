import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const API_URL = '/teachers';

/**
 * Transforms JSON data into FormData to support file uploads
 */
function prepareFormData(data: any) {
    const formData = new FormData();

    // Extract files separately
    const photoFile = data.photoFile;
    const certificatFiles = data.certificatFiles || [];

    if (photoFile) formData.append('photo', photoFile);

    // Clean data for the body (remove raw file objects)
    const { photoFile: pf, photoPreview, certificatFiles: cf, ...rest } = data;

    // If we have certificates files
    if (certificatFiles.length > 0) {
        certificatFiles.forEach((file: File) => {
            formData.append('certificats', file);
        });
    }

    // Append fields
    Object.keys(rest).forEach(key => {
        const val = rest[key];
        if (val === null || val === undefined) return;

        if (Array.isArray(val) || typeof val === 'object') {
            formData.append(key, JSON.stringify(val));
        } else {
            formData.append(key, val);
        }
    });

    return formData;
}

export function useTeacherForm() {
    const queryClient = useQueryClient();

    // Create teacher
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const hasFiles = data.photoFile || (data.certificatFiles && data.certificatFiles.length > 0);
            const payload = hasFiles ? prepareFormData(data) : data;

            const response = await api.post(API_URL, payload, {
                headers: hasFiles ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
    });

    // Update teacher
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const hasFiles = data.photoFile || (data.certificatFiles && data.certificatFiles.length > 0);
            const payload = hasFiles ? prepareFormData(data) : data;

            const response = await api.put(`${API_URL}/${id}`, payload, {
                headers: hasFiles ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        },
        onSuccess: (_data, variables) => {
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
