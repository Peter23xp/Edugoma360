import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ClassSection {
    id: string;
    name: string;
    code: string;
    year: number;
}

export interface ClassItem {
    id: string;
    name: string;
    section: ClassSection;
    maxStudents: number;
    isActive: boolean;
    _count: { enrollments: number };
    currentStudents: number;
    subjectsAssigned: number;
    totalSubjects: number;
    hasTimetable: boolean;
    room?: string;
    titulaire?: {
        id: string;
        nom: string;
        postNom: string;
        prenom?: string;
    };
}

export interface ClassStats {
    total: number;
    complete: number;
    avgStudents: number;
    roomsUsed: number;
    totalStudents: number;
}

export interface ClassAssignment {
    id: string;
    subjectId: string;
    teacherId: string;
    teacher: { id: string; nom: string; postNom?: string; prenom?: string };
    subject: { id: string; name: string };
}

// ── Main hook ────────────────────────────────────────────────────────────────
export function useClasses(sectionId?: string, search?: string) {
    const queryClient = useQueryClient();

    const query = useQuery<{ classes: ClassItem[]; stats: ClassStats }>({
        queryKey: ['classes-management', sectionId, search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            params.set('status', 'active');
            const res = await api.get(`/classes?${params.toString()}`);

            const rawClasses = res.data?.classes ?? res.data ?? [];
            let classes: ClassItem[] = rawClasses.map((c: any) => ({
                ...c,
                currentStudents: c.currentStudents ?? c._count?.enrollments ?? 0,
                subjectsAssigned: c.subjectsAssigned ?? c._count?.teacherAssignments ?? 0,
                totalSubjects: c.totalSubjects ?? c.section?.subjects?.length ?? 0,
                hasTimetable: false,
            }));

            // Client-side filter by section code
            if (sectionId) {
                classes = classes.filter(c => c.section?.code === sectionId);
            }

            const totalStudents = classes.reduce((s, c) => s + c.currentStudents, 0);
            const stats: ClassStats = {
                total: classes.length,
                complete: classes.filter(c => c.currentStudents >= c.maxStudents * 0.8).length,
                avgStudents: classes.length > 0 ? Math.round(totalStudents / classes.length) : 0,
                roomsUsed: classes.filter(c => c.room).length,
                totalStudents,
            };

            return { classes, stats };
        },
    });

    // Create
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/classes', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes-management'] });
            toast.success('Classe créée avec succès');
        },
        onError: (err: any) => {
            const msg = err.response?.data?.error || 'Erreur lors de la création';
            toast.error(msg.includes('CLASS_NAME_EXISTS') ? 'Ce nom de classe existe déjà' : msg);
        },
    });

    // Update
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await api.patch(`/classes/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes-management'] });
            toast.success('Classe mise à jour');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erreur de mise à jour');
        },
    });

    // Archive
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/classes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes-management'] });
            toast.success('Classe archivée');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
        },
    });

    // Assign teachers
    const assignMutation = useMutation({
        mutationFn: async ({ classId, assignments, titulaireId }: { classId: string; assignments: any[]; titulaireId?: string }) => {
            const res = await api.post(`/classes/${classId}/assign-teachers`, { assignments, titulaireId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes-management'] });
            toast.success('Enseignants attribués avec succès');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Erreur lors de l'attribution");
        },
    });

    // Get assignments for a specific class
    const getAssignments = async (classId: string): Promise<{ assignments: ClassAssignment[], titulaireId: string | null }> => {
        const res = await api.get(`/classes/${classId}/assignments`);
        return {
            assignments: res.data?.assignments ?? [],
            titulaireId: res.data?.titulaireId ?? null,
        };
    };

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,

        createClass: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateClass: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteClass: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        assignTeachers: assignMutation.mutateAsync,
        isAssigning: assignMutation.isPending,

        generateTimetable: useMutation({
            mutationFn: async (payload: { classId: string; preferences: any }) => {
                const res = await api.post(`/classes/${payload.classId}/generate-timetable`, {
                    preferences: payload.preferences,
                });
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['classes-management'] });
                toast.success('Emploi du temps généré avec succès');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Erreur lors de la génération');
            },
        }),

        getAssignments,
    };
}

// ── Sections dropdown ────────────────────────────────────────────────────────
export function useSectionsForFilter() {
    return useQuery<{ id: string; name: string; code: string; year: number }[]>({
        queryKey: ['sections-filter'],
        queryFn: async () => {
            const res = await api.get('/sections');
            const groups: any[] = res.data || [];
            const all: any[] = [];
            for (const g of groups) {
                for (const year of g.years || []) {
                    // Use real DB section ID from yearIds map
                    const dbId = g.yearIds?.[year] || `${g.code}-${year}`;
                    all.push({ id: dbId, name: g.name, code: g.code, year });
                }
            }
            return all;
        },
    });
}

// ── Teachers dropdown ────────────────────────────────────────────────────────
export function useTeachersForDropdown() {
    return useQuery<{ id: string; nom: string; postNom: string; prenom?: string }[]>({
        queryKey: ['teachers-dropdown'],
        queryFn: async () => {
            const res = await api.get('/teachers?limit=500');
            const teachersArray = res.data?.data || res.data?.teachers || [];
            return teachersArray.map((t: any) => ({
                id: t.id,
                nom: t.nom,
                postNom: t.postNom,
                prenom: t.prenom,
            }));
        },
    });
}
