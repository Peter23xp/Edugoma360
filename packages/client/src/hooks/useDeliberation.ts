import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface DeliberationStudent {
    id: string;
    studentId: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom: string | null;
    averageT1: number;
    averageT2: number;
    averageT3: number;
    yearAverage: number;
    rank: number;
    decision: string | null;
    status: 'DRAFT' | 'VALIDATED' | 'APPROVED';
}

interface DeliberationResponse {
    students: DeliberationStudent[];
    stats: {
        total: number;
        admitted: number;
        failed: number;
        adjourned: number;
        excellence: number;
        distinction: number;
    };
    isApproved: boolean;
    approvedAt: string | null;
    approvedBy: string | null;
}

export function useDeliberation(classId: string, termId: string) {
    return useQuery({
        queryKey: ['deliberation', classId, termId],
        queryFn: async () => {
            const { data } = await api.get<DeliberationResponse>(
                `/deliberation/${classId}/${termId}`
            );
            return data;
        },
        enabled: !!classId && !!termId,
        staleTime: 30 * 1000, // 30 secondes
    });
}

export function useUpdateDecision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            studentId,
            termId,
            decision,
        }: {
            studentId: string;
            termId: string;
            decision: string;
        }) => {
            const { data } = await api.put(`/deliberation/${studentId}`, {
                termId,
                decision,
            });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deliberation'] });
            toast.success('Décision mise à jour');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour');
        },
    });
}

export function useApproveDeliberation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            classId,
            termId,
        }: {
            classId: string;
            termId: string;
        }) => {
            const { data } = await api.post('/deliberation/approve', {
                classId,
                termId,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliberation'] });
            toast.success('Délibération approuvée avec succès');
        },
        onError: () => {
            toast.error("Erreur lors de l'approbation");
        },
    });
}

export function useExportPV() {
    return useMutation({
        mutationFn: async ({
            classId,
            termId,
        }: {
            classId: string;
            termId: string;
        }) => {
            const response = await api.get(`/deliberation/export/${classId}/${termId}`, {
                responseType: 'blob',
            });
            return response.data;
        },
        onSuccess: (blob, variables) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PV_Deliberation_${variables.classId}_${variables.termId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('PV téléchargé');
        },
        onError: () => {
            toast.error('Erreur lors du téléchargement');
        },
    });
}
