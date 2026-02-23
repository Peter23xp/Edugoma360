import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface AverageData {
    studentId: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom: string | null;
    average: number;
    totalPoints: number;
    rank: number;
    status: 'ADMITTED' | 'FAILED';
}

interface ClassAveragesResponse {
    averages: AverageData[];
    classAverage: number;
    successRate: number;
    highestAverage: number;
    lowestAverage: number;
}

export function useClassAverages(classId: string, termId: string) {
    return useQuery({
        queryKey: ['averages', 'class', classId, termId],
        queryFn: async () => {
            const { data } = await api.get<ClassAveragesResponse>(
                `/averages/class/${classId}`,
                { params: { termId } }
            );
            return data;
        },
        enabled: !!classId && !!termId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useStudentAverages(studentId: string) {
    return useQuery({
        queryKey: ['averages', 'student', studentId],
        queryFn: async () => {
            const { data } = await api.get(`/averages/student/${studentId}`);
            return data;
        },
        enabled: !!studentId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useRecalculateAverages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ classId, termId }: { classId: string; termId: string }) => {
            const { data } = await api.post('/averages/recalculate', { classId, termId });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['averages', 'class', variables.classId] });
        },
    });
}
