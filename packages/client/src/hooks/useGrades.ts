import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import api from '../lib/api';
import type { Grade, GradeFiltersState, GradesMatrixData } from '@edugoma360/shared/types/academic';
import { addToGradeQueue } from '../lib/offline/gradeQueue';
import { useOffline } from './useOffline';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GradeStats {
    total: number;
    filled: number;
    missing: number;
    classAverage: number | null;
    belowTen: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useGrades — liste des notes pour un filtre donné
// ─────────────────────────────────────────────────────────────────────────────

export function useGrades(filters: Partial<GradeFiltersState> & { studentIds?: string[] }) {
    const { isOffline } = useOffline();
    const queryClient = useQueryClient();

    const query = useQuery<Grade[]>({
        queryKey: ['grades', filters],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (filters.classId) params.classId = filters.classId;
            if (filters.subjectId) params.subjectId = filters.subjectId;
            if (filters.termId) params.termId = filters.termId;
            if (filters.evalType) params.evalType = filters.evalType;
            const res = await api.get('/grades', { params });
            return res.data?.data ?? res.data ?? [];
        },
        enabled: !isOffline && !!(filters.classId || filters.studentIds?.length),
        staleTime: 30 * 1000, // 30 secondes
        placeholderData: (prev) => prev,
    });

    // Statistiques calculées côté client
    const stats = useMemo<GradeStats>(() => {
        const grades = query.data ?? [];
        const filled = grades.filter((g) => g.score !== null);
        const scores = filled.map((g) => g.score as number);
        const classAverage = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            : null;

        return {
            total: grades.length,
            filled: filled.length,
            missing: grades.length - filled.length,
            classAverage,
            belowTen: scores.filter((s) => s < 10).length,
        };
    }, [query.data]);

    // Mutation : créer / modifier une note
    const saveGradeMutation = useMutation({
        mutationFn: async (payload: {
            studentId: string;
            subjectId: string;
            classId: string;
            termId: string;
            evalType: string;
            score: number | null;
            observation?: string;
        }) => {
            if (isOffline) {
                await addToGradeQueue('grade_create', {
                    studentId: payload.studentId,
                    subjectId: payload.subjectId,
                    termId: payload.termId,
                    evalType: payload.evalType,
                    score: payload.score ?? 0,
                    observation: payload.observation,
                });
                return { offline: true };
            }
            const res = await api.post('/grades', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades', filters] });
            queryClient.invalidateQueries({ queryKey: ['averages'] });
        },
    });

    // Mutation : verrouiller les notes
    const lockGradesMutation = useMutation({
        mutationFn: async (payload: { classId: string; subjectId: string; termId: string; evalType: string }) => {
            const res = await api.post('/grades/lock', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
    });

    // Mutation : déverrouiller (Préfet uniquement)
    const unlockGradesMutation = useMutation({
        mutationFn: async (payload: { classId: string; subjectId: string; termId: string; evalType: string }) => {
            const res = await api.post('/grades/unlock', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
    });

    const gradeMap = useMemo(() => {
        const map = new Map<string, Grade>();
        (query.data ?? []).forEach((g) => {
            map.set(`${g.studentId}-${g.evalType}`, g);
        });
        return map;
    }, [query.data]);

    return {
        ...query,
        grades: query.data ?? [],
        gradeMap,
        stats,
        saveGradeMutation,
        lockGradesMutation,
        unlockGradesMutation,
        isLocked: (query.data ?? []).some((g) => g.isLocked),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useGradesMatrix — matrice notes par classe (SCR-013)
// ─────────────────────────────────────────────────────────────────────────────

export function useGradesMatrix(classId: string, termId: string) {
    return useQuery<GradesMatrixData>({
        queryKey: ['grades-matrix', classId, termId],
        queryFn: async () => {
            const res = await api.get('/grades/matrix', { params: { classId, termId } });
            return res.data?.data ?? res.data;
        },
        enabled: !!classId && !!termId,
        staleTime: 60 * 1000,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useGradeSync — synchronisation offline des notes
// ─────────────────────────────────────────────────────────────────────────────

export function useGradeSync() {
    const queryClient = useQueryClient();

    const syncMutation = useMutation({
        mutationFn: async (items: Array<{ studentId: string; subjectId: string; termId: string; evalType: string; score: number }>) => {
            const res = await api.post('/grades/sync', { grades: items });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
    });

    return { syncMutation };
}
