import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../lib/api';
import type { AbsenceFiltersState } from '../components/attendance/AbsenceFilters';
import type { 
    AbsenceHistoryResponse, 
    StudentAbsenceStatsResponse,
    UpdateJustificationInput 
} from '@edugoma360/shared';
import toast from 'react-hot-toast';

interface UseAbsenceHistoryOptions {
    filters: AbsenceFiltersState;
    page: number;
    limit?: number;
}

export function useAbsenceHistory({ filters, page, limit = 25 }: UseAbsenceHistoryOptions) {
    const queryClient = useQueryClient();

    // ── Fetch History ────────────────────────────────────────────────────────
    const historyQuery = useQuery<AbsenceHistoryResponse>({
        queryKey: ['attendance', 'history', filters, page, limit],
        queryFn: async () => {
            // Setup query params
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            if (filters.period !== 'all' && filters.period !== 'custom') {
                params.append('period', filters.period);
            } else if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                params.append('startDate', filters.startDate);
                params.append('endDate', filters.endDate);
            }

            if (filters.classIds.length > 0) {
                params.append('classIds', filters.classIds.join(','));
            }

            if (filters.types.length > 0) {
                params.append('types', filters.types.join(','));
            }

            if (filters.isJustified !== undefined) {
                params.append('isJustified', String(filters.isJustified));
            }

            if (filters.studentSearch) {
                params.append('studentSearch', filters.studentSearch);
            }

            const { data } = await api.get(`/attendance/absences?${params.toString()}`);
            return data;
        },
        placeholderData: keepPreviousData,
    });

    // ── Update Justification ────────────────────────────────────────────────
    const updateJustificationMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: UpdateJustificationInput }) => {
            const formData = new FormData();
            formData.append('isJustified', String(data.isJustified));
            if (data.remark) formData.append('remark', data.remark);
            if (data.justificationFile) {
                // Handle file upload here if needed
                // formData.append('justificationFile', data.justificationFile);
            }

            const res = await api.put(`/attendance/records/${id}/justification`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', 'history'] });
            toast.success('Justification mise à jour', {
                icon: '✅',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        },
    });

    // ── Export Data ──────────────────────────────────────────────────────────
    const exportDataMutation = useMutation({
        mutationFn: async (format: 'excel' | 'pdf' | 'csv') => {
             // Pass same filters
             const params = new URLSearchParams();
             if (filters.period !== 'all' && filters.period !== 'custom') params.append('period', filters.period);
             if (filters.classIds.length > 0) params.append('classIds', filters.classIds.join(','));
             if (filters.types.length > 0) params.append('types', filters.types.join(','));
             if (filters.isJustified !== undefined) params.append('isJustified', String(filters.isJustified));
             params.append('format', format);
             
             // Download file
             const response = await api.get(`/attendance/absences/export?${params.toString()}`, {
                 responseType: 'blob',
             });
             
             // Create download link
             const url = window.URL.createObjectURL(new Blob([response.data]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', `Absences_${format}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`);
             document.body.appendChild(link);
             link.click();
             link.remove();
        },
        onSuccess: () => {
             toast.success('Export réussi');
        },
        onError: () => {
             toast.error("Erreur lors de l'export des données");
        }
    });

    return {
        ...historyQuery,
        updateJustification: updateJustificationMutation,
        exportData: exportDataMutation,
    };
}

// ── Secondary Hook: Student Stats ───────────────────────────────────────────
export function useStudentAbsenceStats(studentId: string | null) {
    return useQuery<StudentAbsenceStatsResponse>({
        queryKey: ['attendance', 'student-stats', studentId],
        queryFn: async () => {
            const { data } = await api.get(`/attendance/student/${studentId}/stats`);
            return data;
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000, // 5 min
    });
}
