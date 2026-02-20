import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { TimetablePeriod, TimetableConflict, DayOfWeek } from '@edugoma360/shared/src/types/academic';

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useTimetableByTeacher — emploi du temps d'un enseignant
// ─────────────────────────────────────────────────────────────────────────────

export function useTimetableByTeacher(teacherId: string) {
    return useQuery<TimetablePeriod[]>({
        queryKey: ['timetable-teacher', teacherId],
        queryFn: async () => {
            const res = await api.get(`/timetable/teacher/${teacherId}`);
            return res.data?.data ?? res.data ?? [];
        },
        enabled: !!teacherId,
        staleTime: 5 * 60 * 1000,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useTimetableByClass — emploi du temps d'une classe
// ─────────────────────────────────────────────────────────────────────────────

export function useTimetableByClass(classId: string) {
    return useQuery<TimetablePeriod[]>({
        queryKey: ['timetable-class', classId],
        queryFn: async () => {
            const res = await api.get(`/timetable/class/${classId}`);
            return res.data?.data ?? res.data ?? [];
        },
        enabled: !!classId,
        staleTime: 5 * 60 * 1000,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useTimetableEditor — gestion CRUD (Préfet)
// ─────────────────────────────────────────────────────────────────────────────

export function useTimetableEditor() {
    const queryClient = useQueryClient();

    const addPeriodMutation = useMutation({
        mutationFn: async (payload: {
            classId: string;
            subjectId: string;
            teacherId: string;
            dayOfWeek: DayOfWeek;
            periodNumber: number;
            academicYearId: string;
        }) => {
            const res = await api.post('/timetable', payload);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['timetable-class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['timetable-teacher', variables.teacherId] });
        },
    });

    const deletePeriodMutation = useMutation({
        mutationFn: async (periodId: string) => {
            const res = await api.delete(`/timetable/${periodId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable-class'] });
            queryClient.invalidateQueries({ queryKey: ['timetable-teacher'] });
        },
    });

    // Vérification des conflits avant ajout
    const checkConflictsMutation = useMutation({
        mutationFn: async (payload: {
            teacherId: string;
            classId: string;
            dayOfWeek: DayOfWeek;
            periodNumber: number;
            excludePeriodId?: string;
        }): Promise<TimetableConflict[]> => {
            const res = await api.post('/timetable/conflicts', payload);
            return res.data?.conflicts ?? [];
        },
    });

    return {
        addPeriodMutation,
        deletePeriodMutation,
        checkConflictsMutation,
    };
}

