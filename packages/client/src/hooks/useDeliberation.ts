import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { DeliberationData, DeliberationStats } from '@edugoma360/shared/src/types/academic';
import type { DelibDecision } from '@edugoma360/shared/src/constants/decisions';
import { useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useDeliberation
// ─────────────────────────────────────────────────────────────────────────────

export function useDeliberation(classId: string, academicYearId: string) {
    const queryClient = useQueryClient();

    const query = useQuery<DeliberationData>({
        queryKey: ['deliberation', classId, academicYearId],
        queryFn: async () => {
            const res = await api.get(`/deliberation/${academicYearId}`, { params: { classId } });
            return res.data?.data ?? res.data;
        },
        enabled: !!classId && !!academicYearId,
        staleTime: 60 * 1000,
    });

    // Statistiques calculées
    const stats = useMemo<DeliberationStats | null>(() => {
        if (!query.data) return null;
        const students = query.data.students;
        const total = students.length;
        const admitted = students.filter((s) =>
            ['ADMITTED', 'DISTINCTION', 'GREAT_DISTINCTION'].includes(s.finalDecision ?? '')
        ).length;
        const adjourned = students.filter((s) => s.finalDecision === 'ADJOURNED').length;
        const failed = students.filter((s) => s.finalDecision === 'FAILED').length;
        const distinction = students.filter((s) => s.finalDecision === 'DISTINCTION').length;
        const greatDistinction = students.filter((s) => s.finalDecision === 'GREAT_DISTINCTION').length;

        return {
            total,
            admitted,
            adjourned,
            failed,
            distinction,
            greatDistinction,
            successRate: total > 0 ? Math.round((admitted / total) * 100) : 0,
        };
    }, [query.data]);

    // Mettre à jour la décision d'un élève
    const updateDecisionMutation = useMutation({
        mutationFn: async (payload: {
            studentId: string;
            decision: DelibDecision;
            note?: string;
        }) => {
            const res = await api.put(`/deliberation/${payload.studentId}`, {
                decision: payload.decision,
                note: payload.note,
                classId,
                academicYearId,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliberation', classId, academicYearId] });
        },
    });

    // Approbation finale (Préfet)
    const approveMutation = useMutation({
        mutationFn: async (payload: { signature?: string }) => {
            const res = await api.post('/deliberation/approve', {
                classId,
                academicYearId,
                signature: payload.signature,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliberation', classId, academicYearId] });
            queryClient.invalidateQueries({ queryKey: ['palmares'] });
            queryClient.invalidateQueries({ queryKey: ['bulletins'] });
        },
    });

    // Export PV en PDF
    const exportPVMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(
                '/deliberation/export',
                { classId, academicYearId },
                { responseType: 'blob' }
            );
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PV_Deliberation_${classId}_${academicYearId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        },
    });

    return {
        ...query,
        deliberation: query.data,
        students: query.data?.students ?? [],
        status: query.data?.status ?? 'DRAFT',
        isApproved: query.data?.status === 'APPROVED',
        stats,
        updateDecisionMutation,
        approveMutation,
        exportPVMutation,
    };
}


