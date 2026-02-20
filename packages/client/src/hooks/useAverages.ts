import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { ClassAveragesData, StudentAverage } from '@edugoma360/shared/types/academic';

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useAverages — Moyennes d'une classe pour un trimestre
// ─────────────────────────────────────────────────────────────────────────────

export function useAverages(classId: string, termId: string) {
    const queryClient = useQueryClient();

    const query = useQuery<ClassAveragesData>({
        queryKey: ['averages', classId, termId],
        queryFn: async () => {
            const res = await api.get(`/averages/class/${classId}`, { params: { termId } });
            return res.data?.data ?? res.data;
        },
        enabled: !!classId && !!termId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Recalcul forcé (ex: après verrouillage des notes)
    const recalculateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/averages/recalculate', { classId, termId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['averages', classId, termId] });
        },
    });

    return {
        ...query,
        averages: query.data?.students ?? [],
        classAverage: query.data?.classAverage ?? null,
        successRate: query.data?.successRate ?? null,
        highestAverage: query.data?.highestAverage ?? null,
        lowestAverage: query.data?.lowestAverage ?? null,
        termHistory: query.data?.termHistory ?? [],
        recalculateMutation,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useStudentAverage — Moyennes d'un élève spécifique
// ─────────────────────────────────────────────────────────────────────────────

export function useStudentAverage(studentId: string, termId: string) {
    return useQuery<StudentAverage>({
        queryKey: ['average-student', studentId, termId],
        queryFn: async () => {
            const res = await api.get(`/averages/student/${studentId}`, { params: { termId } });
            return res.data?.data ?? res.data;
        },
        enabled: !!studentId && !!termId,
        staleTime: 2 * 60 * 1000,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useTermAverages — Comparaison multi-trimestres pour un élève
// ─────────────────────────────────────────────────────────────────────────────

export function useTermAverages(studentId: string) {
    return useQuery<Array<{ termId: string; termName: string; average: number | null }>>({
        queryKey: ['term-averages', studentId],
        queryFn: async () => {
            const res = await api.get(`/averages/student/${studentId}/terms`);
            return res.data?.data ?? res.data ?? [];
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000,
    });
}
