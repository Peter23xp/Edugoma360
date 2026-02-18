import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface StudentFilters {
    classId?: string;
    section?: string;
    status?: string;
    q?: string;
    page: number;
    limit: number;
}

export interface StudentListItem {
    id: string;
    schoolId: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    sexe: 'M' | 'F';
    dateNaissance: string;
    lieuNaissance: string;
    nationalite: string;
    photoUrl?: string | null;
    statut: string;
    isActive: boolean;
    className?: string | null;
    classId?: string | null;
    sectionName?: string | null;
    sectionCode?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StudentsResponse {
    data: StudentListItem[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

export function useStudents(filters: StudentFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<StudentsResponse>({
        queryKey: ['students', filters],
        queryFn: async () => {
            const params: Record<string, string> = {
                page: String(filters.page),
                limit: String(filters.limit),
            };
            if (filters.classId) params.classId = filters.classId;
            if (filters.section) params.section = filters.section;
            if (filters.status) params.status = filters.status;
            if (filters.q) params.q = filters.q;

            const res = await api.get('/students', { params });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 2 * 60 * 1000,
    });

    const archiveMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/students/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });

    const batchArchiveMutation = useMutation({
        mutationFn: (data: { ids: string[]; reason?: string }) =>
            api.patch('/students/batch-archive', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });

    return {
        ...query,
        students: query.data?.data ?? [],
        total: query.data?.total ?? 0,
        totalPages: query.data?.pages ?? 1,
        archiveMutation,
        batchArchiveMutation,
    };
}

export function useClasses() {
    return useQuery<Array<{ id: string; name: string; sectionId: string }>>({
        queryKey: ['classes-active'],
        queryFn: async () => {
            const res = await api.get('/settings/classes');
            return res.data?.data ?? res.data ?? [];
        },
        staleTime: 10 * 60 * 1000,
    });
}
