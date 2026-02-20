import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { AcademicClass, ClassWithStats, TeacherAssignment } from '@edugoma360/shared/types/academic';

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useClasses — liste des classes
// ─────────────────────────────────────────────────────────────────────────────

export function useClasses(filters?: { sectionId?: string; academicYearId?: string; isActive?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery<ClassWithStats[]>({
        queryKey: ['classes', filters],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (filters?.sectionId) params.sectionId = filters.sectionId;
            if (filters?.academicYearId) params.academicYearId = filters.academicYearId;
            if (filters?.isActive !== undefined) params.isActive = String(filters.isActive);
            const res = await api.get('/classes', { params });
            return res.data?.data ?? res.data ?? [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Créer une classe
    const createMutation = useMutation({
        mutationFn: async (payload: {
            name: string;
            sectionId: string;
            academicYearId: string;
            maxStudents: number;
        }) => {
            const res = await api.post('/classes', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });

    // Modifier une classe
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...payload }: Partial<AcademicClass> & { id: string }) => {
            const res = await api.put(`/classes/${id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });

    // Archiver une classe
    const archiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/classes/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });

    // Attribuer un enseignant à une matière
    const assignTeacherMutation = useMutation({
        mutationFn: async (payload: {
            classId: string;
            subjectId: string;
            teacherId: string;
        }) => {
            const res = await api.post(`/classes/${payload.classId}/assign`, payload);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['class-assignments', variables.classId] });
        },
    });

    return {
        ...query,
        classes: query.data ?? [],
        createMutation,
        updateMutation,
        archiveMutation,
        assignTeacherMutation,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useClassDetail — détail d'une classe avec ses attributions
// ─────────────────────────────────────────────────────────────────────────────

export function useClassDetail(classId: string) {
    const assignmentsQuery = useQuery<TeacherAssignment[]>({
        queryKey: ['class-assignments', classId],
        queryFn: async () => {
            const res = await api.get(`/classes/${classId}/assignments`);
            return res.data?.data ?? res.data ?? [];
        },
        enabled: !!classId,
        staleTime: 5 * 60 * 1000,
    });

    const classQuery = useQuery<ClassWithStats>({
        queryKey: ['class-detail', classId],
        queryFn: async () => {
            const res = await api.get(`/classes/${classId}`);
            return res.data?.data ?? res.data;
        },
        enabled: !!classId,
        staleTime: 5 * 60 * 1000,
    });

    return {
        class: classQuery.data,
        assignments: assignmentsQuery.data ?? [],
        isLoading: classQuery.isLoading || assignmentsQuery.isLoading,
    };
}
