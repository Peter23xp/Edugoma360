import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Subject {
    id: string;
    name: string;
    abbreviation: string;
    coefficient: number;
    maxScore: number;
    isEliminatory: boolean;
    hasThreshold?: boolean;
    elimThreshold: number | null;
    displayOrder: number;
}

export interface SectionGroup {
    id: string; // The UI code: "Sc", "TC"
    name: string;
    code: string;
    years: number[];
    classCount: number;
    studentCount: number;
    subjects: Subject[];
}

export function useSections() {
    const queryClient = useQueryClient();

    const query = useQuery<SectionGroup[]>({
        queryKey: ['sections'],
        queryFn: async () => {
            const res = await api.get('/sections');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/sections', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Section créée avec succès");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la création");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await api.put(`/sections/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Section mise à jour");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur de mise à jour");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/sections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Section supprimée");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la suppression");
        }
    });

    // Subject handling
    const addSubjectMutation = useMutation({
        mutationFn: async ({ sectionId, data }: { sectionId: string, data: any }) => {
            const res = await api.post(`/sections/${sectionId}/subjects`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Matière ajoutée");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de l'ajout");
        }
    });

    const updateSubjectMutation = useMutation({
        mutationFn: async ({ sectionId, subjectId, data }: { sectionId: string, subjectId: string, data: any }) => {
            const res = await api.put(`/sections/${sectionId}/subjects/${subjectId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Matière mise à jour");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur de mise à jour");
        }
    });

    const removeSubjectMutation = useMutation({
        mutationFn: async ({ sectionId, subjectId }: { sectionId: string, subjectId: string }) => {
            await api.delete(`/sections/${sectionId}/subjects/${subjectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Matière retirée de la section");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de la suppression");
        }
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,

        createSection: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateSection: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteSection: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        addSubject: addSubjectMutation.mutateAsync,
        isAddingSubject: addSubjectMutation.isPending,

        updateSubject: updateSubjectMutation.mutateAsync,
        isUpdatingSubject: updateSubjectMutation.isPending,

        removeSubject: removeSubjectMutation.mutateAsync,
        isRemovingSubject: removeSubjectMutation.isPending
    };
}
