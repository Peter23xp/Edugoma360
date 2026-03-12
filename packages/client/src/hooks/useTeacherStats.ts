import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useTeacherStats = (filters: {
    termId?: string;
    sectionId?: string;
    subjectId?: string;
    performance?: string;
    startDate?: string;
    endDate?: string;
    teacherIds?: string[];
}) => {
    // Overview metrics
    const useOverview = () => useQuery({
        queryKey: ['teacher-stats-overview', filters.termId, filters.sectionId],
        queryFn: async () => {
            const { data } = await api.get('/reports/teachers/overview', {
                params: { termId: filters.termId, sectionId: filters.sectionId }
            });
            return data.data || data;
        },
        enabled: !!filters.termId
    });

    // Ranking/Table
    const useRanking = (sortBy: 'performance' | 'workload' | 'attendance' = 'performance') => useQuery({
        queryKey: ['teacher-ranking', filters.termId, sortBy, filters.sectionId],
        queryFn: async () => {
            const { data } = await api.get('/reports/teachers/ranking', {
                params: {
                    termId: filters.termId,
                    sortBy,
                    sectionId: filters.sectionId
                }
            });
            return data.data || data;
        },
        enabled: !!filters.termId
    });

    // Performance Chart
    const usePerformanceChart = () => useQuery({
        queryKey: ['teacher-performance-chart', filters.teacherIds],
        queryFn: async () => {
            const { data } = await api.get('/reports/teachers/performance-chart', {
                params: { teacherIds: filters.teacherIds?.join(',') }
            });
            return data.data || data;
        }
    });

    // Workload distribution
    const useWorkload = () => useQuery({
        queryKey: ['teacher-workload'],
        queryFn: async () => {
            const { data } = await api.get('/reports/teachers/workload');
            return data.data || data;
        }
    });

    // Attendance heatmap
    const useAttendanceHeatmap = () => useQuery({
        queryKey: ['teacher-attendance-heatmap', filters.startDate, filters.endDate],
        queryFn: async () => {
            const { data } = await api.get('/reports/teachers/attendance-heatmap', {
                params: { startDate: filters.startDate, endDate: filters.endDate }
            });
            return data.data || data;
        }
    });

    return {
        useOverview,
        useRanking,
        usePerformanceChart,
        useWorkload,
        useAttendanceHeatmap
    };
};
