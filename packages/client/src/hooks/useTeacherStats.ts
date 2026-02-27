import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api/reports/teachers'
});

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
            const { data } = await api.get('/overview', {
                params: { termId: filters.termId, sectionId: filters.sectionId }
            });
            return data;
        },
        enabled: !!filters.termId
    });

    // Ranking/Table
    const useRanking = (sortBy: 'performance' | 'workload' | 'attendance' = 'performance') => useQuery({
        queryKey: ['teacher-ranking', filters.termId, sortBy, filters.sectionId],
        queryFn: async () => {
            const { data } = await api.get('/ranking', {
                params: {
                    termId: filters.termId,
                    sortBy,
                    sectionId: filters.sectionId
                }
            });
            return data;
        },
        enabled: !!filters.termId
    });

    // Performance Chart
    const usePerformanceChart = () => useQuery({
        queryKey: ['teacher-performance-chart', filters.teacherIds],
        queryFn: async () => {
            const { data } = await api.get('/performance-chart', {
                params: { teacherIds: filters.teacherIds?.join(',') }
            });
            return data;
        }
    });

    // Workload distribution
    const useWorkload = () => useQuery({
        queryKey: ['teacher-workload'],
        queryFn: async () => {
            const { data } = await api.get('/workload');
            return data;
        }
    });

    // Attendance heatmap
    const useAttendanceHeatmap = () => useQuery({
        queryKey: ['teacher-attendance-heatmap', filters.startDate, filters.endDate],
        queryFn: async () => {
            const { data } = await api.get('/attendance-heatmap', {
                params: { startDate: filters.startDate, endDate: filters.endDate }
            });
            return data;
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
