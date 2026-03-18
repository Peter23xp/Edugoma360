import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface AttendanceReportFilters {
    startDate?: string;
    endDate?: string;
    classIds?: string[];
}

export interface ReportStats {
    period: { start: string; end: string };
    stats: {
        totalAttendanceRate: number;
        totalAbsences: number;
        justifiedAbsences: number;
        notJustifiedAbsences: number;
        totalLates: number;
        avgLateMinutes: number;
    };
    evolution: Array<{
        date: string;
        attendanceRate: number;
        present: number;
        absent: number;
        late: number;
    }>;
    byClass: Array<{
        classId: string;
        className: string;
        studentCount: number;
        attendanceRate: number;
        absences: number;
        lates: number;
        trend: number;
    }>;
    atRiskStudents: Array<{
        studentId: string;
        student: { matricule: string; nom: string; postNom: string; class: string };
        attendanceRate: number;
        absences: number;
        notJustifiedAbsences: number;
    }>;
}

export function useAttendanceReports(filters: AttendanceReportFilters) {
    return useQuery<ReportStats>({
        queryKey: ['attendance-reports-stats', filters],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.classIds?.length) params.classIds = filters.classIds.join(',');
            const { data } = await api.get('/attendance/reports/stats', { params });
            return data;
        },
    });
}
